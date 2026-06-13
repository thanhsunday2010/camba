"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { gradeObjectiveAnswer } from "@/lib/exam/scoring";
import { updateUserStreak } from "@/lib/ai/rate-limit";
import { markAssignmentsComplete } from "@/lib/exam/assignments";
import { evaluatePlacement } from "@/lib/placement/evaluate";
import { inferTrackFromPaperTitle } from "@/lib/placement/build-report";
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
  paperKind: z.enum(["PRACTICE", "MOCK_SKILL", "MOCK_FULL", "PLACEMENT"]).optional(),
  sections: z.string().optional(),
});

function parsePaperFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    level: formData.get("level"),
    skill: formData.get("skill"),
    timeLimit: formData.get("timeLimit") || undefined,
    isMockTest: formData.get("isMockTest") === "on",
    published: formData.get("published") === "on",
    paperKind: formData.get("paperKind") || "PRACTICE",
    sections: formData.get("sections") || undefined,
  };
}

function paperKindDefaults(kind: PaperKind) {
  return {
    isMockTest: kind !== PaperKind.PRACTICE,
  };
}

function parseSectionsJson(raw?: string): Prisma.InputJsonValue | undefined {
  if (!raw?.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

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

export async function updateQuestionAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Thiếu ID câu hỏi" };

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
    await db.question.update({
      where: { id },
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
    return { error: "Không thể cập nhật câu hỏi. Kiểm tra JSON content." };
  }
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

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
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

  if (attempt.userId) {
    if (!session || session.user.id !== attempt.userId) {
      return { error: "Không có quyền nộp bài này" };
    }
  } else if (attempt.paper.paperKind !== PaperKind.PLACEMENT) {
    return { error: "Bài làm khách chỉ áp dụng cho placement test" };
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
    const track = inferTrackFromPaperTitle(attempt.paper.title);
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
      ...(attempt.paper.paperKind === PaperKind.PLACEMENT && placementReport
        ? { placementReport: placementReport as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });

  if (status === "GRADED" && session?.user?.id) {
    await markAssignmentsComplete(session.user.id, attempt.paperId);
    await updateUserStreak(session.user.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/placement");
  revalidatePath("/admin/placement");
  revalidatePath(`/placement/results/${attemptId}`);
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

  const parsed = paperSchema.safeParse(parsePaperFormData(formData));

  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const paperKind = (parsed.data.paperKind ?? "PRACTICE") as PaperKind;
  const defaults = paperKindDefaults(paperKind);
  const sections = parseSectionsJson(parsed.data.sections);

  const paper = await db.examPaper.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      level: parsed.data.level as ExamLevel,
      skill: parsed.data.skill as Skill,
      timeLimit: parsed.data.timeLimit,
      isMockTest: parsed.data.isMockTest ?? defaults.isMockTest,
      published: parsed.data.published ?? true,
      paperKind,
      sections,
    },
  });

  revalidatePath("/admin/papers");
  revalidatePath("/placement");
  return { success: true, paperId: paper.id };
}

export async function updatePaperAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Thiếu ID đề thi" };

  const parsed = paperSchema.safeParse(parsePaperFormData(formData));
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const paperKind = (parsed.data.paperKind ?? "PRACTICE") as PaperKind;
  const defaults = paperKindDefaults(paperKind);
  const sections = parseSectionsJson(parsed.data.sections);

  await db.examPaper.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      level: parsed.data.level as ExamLevel,
      skill: parsed.data.skill as Skill,
      timeLimit: parsed.data.timeLimit,
      isMockTest: parsed.data.isMockTest ?? defaults.isMockTest,
      published: parsed.data.published ?? true,
      paperKind,
      sections,
    },
  });

  revalidatePath("/admin/papers");
  revalidatePath("/placement");
  return { success: true };
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

export async function movePaperQuestionAction(
  paperQuestionId: string,
  direction: "up" | "down"
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  const current = await db.paperQuestion.findUnique({
    where: { id: paperQuestionId },
  });
  if (!current) return { error: "Không tìm thấy câu trong đề" };

  const siblings = await db.paperQuestion.findMany({
    where: { paperId: current.paperId },
    orderBy: { orderIndex: "asc" },
  });

  const idx = siblings.findIndex((s) => s.id === paperQuestionId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

  const other = siblings[swapIdx];
  await db.$transaction([
    db.paperQuestion.update({
      where: { id: current.id },
      data: { orderIndex: other.orderIndex },
    }),
    db.paperQuestion.update({
      where: { id: other.id },
      data: { orderIndex: current.orderIndex },
    }),
  ]);

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
