"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { gradeObjectiveAnswer } from "@/lib/exam/scoring";
import { updateUserStreak } from "@/lib/ai/rate-limit";
import { QuestionType, ExamLevel, Skill } from "@prisma/client";

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

  const attempt = await db.attempt.create({
    data: {
      userId: session.user.id,
      paperId,
      status: "IN_PROGRESS",
    },
  });

  await updateUserStreak(session.user.id);
  return { attemptId: attempt.id };
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

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      status,
      score: needsAI.length > 0 ? totalScore : totalScore,
      maxScore,
      submittedAt: new Date(),
      timeSpent,
    },
  });

  return { attemptId, needsAI, score: totalScore, maxScore };
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
