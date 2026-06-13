"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { gradeObjectiveAnswer } from "@/lib/exam/scoring";
import { updateUserStreak } from "@/lib/ai/rate-limit";
import { markAssignmentsComplete } from "@/lib/exam/assignments";
import { evaluatePlacement } from "@/lib/placement/evaluate";
import { QuestionType, ExamLevel, Skill, PaperKind, Prisma } from "@prisma/client";

const questionSchema = z.object({
  type: z.enum(["MCQ", "GAP_FILL", "FREE_TEXT", "SPEAKING_PROMPT"]),
  level: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
  skill: z.enum(["READING", "WRITING", "LISTENING", "SPEAKING", "USE_OF_ENGLISH"]),
  title: z.string().optional(),
  content: z.string(),
  correctAnswer: z.string().optional(),
  points: z.coerce.number().min(1).default(1),
  audioUrl: z.string().optional(),
});

const paperSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  level: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
  skill: z.enum(["READING", "WRITING", "LISTENING", "SPEAKING", "USE_OF_ENGLISH"]),
  timeLimit: z.coerce.number().min(60).optional(),
  isMockTest: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
});

export async function createQuestionAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  const parsed = questionSchema.safeParse({
    type: formData.get("type"),
    level: formData.get("level"),
    skill: formData.get("skill"),
    title: formData.get("title") || undefined,
    content: formData.get("content"),
    correctAnswer: formData.get("correctAnswer") || undefined,
    points: formData.get("points") || 1,
    audioUrl: formData.get("audioUrl") || undefined,
  });

  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  try {
    await db.question.create({
      data: {
        type: parsed.data.type as QuestionType,
        level: parsed.data.level as ExamLevel,
        skill: parsed.data.skill as Skill,
        title: parsed.data.title,
        content: JSON.parse(parsed.data.content),
        correctAnswer: parsed.data.correctAnswer
          ? JSON.parse(parsed.data.correctAnswer)
          : null,
        points: parsed.data.points,
        audioUrl: parsed.data.audioUrl,
      },
    });
    revalidatePath("/admin/questions");
    return { success: true };
  } catch {
    return { error: "Không thể tạo câu hỏi. Kiểm tra JSON content." };
  }
}

export async function deleteQuestionAction(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  await db.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
  return { success: true };
}

export async function startAttemptAction(paperId: string) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const paper = await db.examPaper.findUnique({
    where: { id: paperId, published: true },
  });
  if (!paper) return { error: "Không tìm thấy đề" };

  const existing = await db.attempt.findFirst({
    where: {
      userId: session.user.id,
      paperId,
      status: "IN_PROGRESS",
    },
    include: { answers: true },
    orderBy: { startedAt: "desc" },
  });

  if (existing) {
    const savedAnswers: Record<string, unknown> = {};
    for (const a of existing.answers) {
      savedAnswers[a.questionId] = a.answer;
    }
    return { attemptId: existing.id, resumed: true, savedAnswers };
  }

  const attempt = await db.attempt.create({
    data: {
      userId: session.user.id,
      paperId,
      status: "IN_PROGRESS",
    },
  });

  await updateUserStreak(session.user.id);
  return { attemptId: attempt.id, resumed: false, savedAnswers: {} };
}

export async function submitAttemptAction(
  attemptId: string,
  answers: Record<string, unknown>,
  timeSpent?: number
) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId, userId: session.user.id },
    include: {
      paper: {
        include: {
          questions: {
            include: { question: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!attempt || attempt.status !== "IN_PROGRESS") {
    return { error: "Bài làm không hợp lệ" };
  }

  let totalScore = 0;
  let maxScore = 0;
  const needsAI: string[] = [];
  const skillStats = new Map<Skill, { correct: number; total: number }>();

  for (const pq of attempt.paper.questions) {
    const q = pq.question;
    const studentAnswer = answers[q.id];
    maxScore += q.points;

    if (q.type === "FREE_TEXT" || q.type === "SPEAKING_PROMPT") {
      needsAI.push(q.id);
      await db.attemptAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: q.id } },
        create: {
          attemptId,
          questionId: q.id,
          answer: studentAnswer ?? "",
          isCorrect: null,
          score: null,
        },
        update: { answer: studentAnswer ?? "" },
      });
      continue;
    }

    const result = gradeObjectiveAnswer(q.type, q.correctAnswer, studentAnswer);
    const score = result.score * q.points;
    totalScore += score;

    const stat = skillStats.get(q.skill) ?? { correct: 0, total: 0 };
    stat.total += 1;
    if (result.isCorrect) stat.correct += 1;
    skillStats.set(q.skill, stat);

    await db.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: q.id } },
      create: {
        attemptId,
        questionId: q.id,
        answer: studentAnswer ?? "",
        isCorrect: result.isCorrect,
        score,
      },
      update: {
        answer: studentAnswer ?? "",
        isCorrect: result.isCorrect,
        score,
      },
    });
  }

  const status = needsAI.length > 0 ? "SUBMITTED" : "GRADED";

  let placementReport = undefined;
  if (attempt.paper.paperKind === PaperKind.PLACEMENT) {
    const skillResults = Array.from(skillStats.entries()).map(([skill, s]) => ({
      skill,
      correct: s.correct,
      total: s.total,
      percent: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }));
    const track = attempt.paper.title.includes("YLE") ? "YLE" : "SECONDARY";
    placementReport = evaluatePlacement(skillResults, track);
  }

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      status,
      score: totalScore,
      maxScore,
      submittedAt: new Date(),
      timeSpent,
      ...(placementReport
        ? { placementReport: placementReport as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });

  if (status === "GRADED") {
    await markAssignmentsComplete(session.user.id, attempt.paperId);
    await updateUserStreak(session.user.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/placement");
  return { attemptId, needsAI, score: totalScore, maxScore, placementReport };
}

export async function assignPaperAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || !["TEACHER", "ADMIN"].includes(session.user.role)) {
    return;
  }

  const paperId = formData.get("paperId") as string;
  const studentId = formData.get("studentId") as string;
  const dueDate = formData.get("dueDate") as string;

  await db.assignment.create({
    data: {
      paperId,
      teacherId: session.user.id,
      studentId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/teacher");
}

export async function createPaperAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  const parsed = paperSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    level: formData.get("level"),
    skill: formData.get("skill"),
    timeLimit: formData.get("timeLimit") || undefined,
      isMockTest: formData.get("isMockTest") === "on",
      published: formData.get("published") === "on",
  });

  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const paper = await db.examPaper.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      level: parsed.data.level as ExamLevel,
      skill: parsed.data.skill as Skill,
      timeLimit: parsed.data.timeLimit,
      isMockTest: parsed.data.isMockTest ?? false,
      published: parsed.data.published ?? true,
    },
  });

  revalidatePath("/admin/papers");
  return { success: true, paperId: paper.id };
}

export async function addQuestionToPaperAction(paperId: string, questionId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  const count = await db.paperQuestion.count({ where: { paperId } });
  await db.paperQuestion.upsert({
    where: { paperId_questionId: { paperId, questionId } },
    create: { paperId, questionId, orderIndex: count },
    update: {},
  });

  revalidatePath("/admin/papers");
  return { success: true };
}

export async function removeQuestionFromPaperAction(paperQuestionId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  await db.paperQuestion.delete({ where: { id: paperQuestionId } });
  revalidatePath("/admin/papers");
  return { success: true };
}

export async function deletePaperAction(paperId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  await db.examPaper.delete({ where: { id: paperId } });
  revalidatePath("/admin/papers");
  return { success: true };
}
