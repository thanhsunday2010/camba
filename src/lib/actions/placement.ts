"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateUserStreak } from "@/lib/ai/rate-limit";
import { assignPlacementQuestionsForAttempt } from "@/lib/placement/select-questions";
import { canGuestStartPlacementAttempt, canStartPlacementAttempt } from "@/lib/subscription/placement-limit";
import { PaperKind } from "@prisma/client";

const guestSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Số điện thoại phải đúng 10 chữ số"),
});

export async function startPlacementAttemptAction(
  paperId: string,
  guest?: { fullName: string; phone: string }
) {
  const session = await auth();

  const paper = await db.examPaper.findFirst({
    where: { id: paperId, paperKind: PaperKind.PLACEMENT, published: true },
  });
  if (!paper) return { error: "Không tìm thấy bài placement" };

  if (session?.user?.id) {
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
      await assignPlacementQuestionsForAttempt(db, existing.id);
      const savedAnswers: Record<string, unknown> = {};
      for (const a of existing.answers) {
        savedAnswers[a.questionId] = a.answer;
      }
      return {
        attemptId: existing.id,
        resumed: true,
        savedAnswers,
      };
    }

    const limitCheck = await canStartPlacementAttempt(session.user.id);
    if (!limitCheck.ok) {
      return { error: limitCheck.error };
    }

    const attempt = await db.attempt.create({
      data: {
        userId: session.user.id,
        paperId,
        status: "IN_PROGRESS",
      },
    });

    await assignPlacementQuestionsForAttempt(db, attempt.id);

    await updateUserStreak(session.user.id);
    return { attemptId: attempt.id, resumed: false, savedAnswers: {} };
  }

  if (!guest) {
    return { error: "Vui lòng nhập Họ tên và Số điện thoại" };
  }

  const parsed = guestSchema.safeParse(guest);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Thông tin không hợp lệ" };
  }

  const guestPhone = parsed.data.phone;
  const guestFullName = parsed.data.fullName.trim();

  const existingGuest = await db.attempt.findFirst({
    where: {
      userId: null,
      guestPhone,
      paperId,
      status: "IN_PROGRESS",
    },
    include: { answers: true },
    orderBy: { startedAt: "desc" },
  });

  if (existingGuest) {
    await assignPlacementQuestionsForAttempt(db, existingGuest.id);
    const savedAnswers: Record<string, unknown> = {};
    for (const a of existingGuest.answers) {
      savedAnswers[a.questionId] = a.answer;
    }
    return {
      attemptId: existingGuest.id,
      resumed: true,
      savedAnswers,
    };
  }

  const guestLimit = await canGuestStartPlacementAttempt(guestPhone);
  if (!guestLimit.ok) {
    return { error: guestLimit.error };
  }

  const attempt = await db.attempt.create({
    data: {
      paperId,
      guestFullName,
      guestPhone,
      status: "IN_PROGRESS",
    },
  });

  await assignPlacementQuestionsForAttempt(db, attempt.id);

  return { attemptId: attempt.id, resumed: false, savedAnswers: {} };
}

export async function getPlacementAttemptAction(attemptId: string) {
  const session = await auth();

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      answers: true,
    },
  });

  if (!attempt || attempt.paper.paperKind !== PaperKind.PLACEMENT) {
    return { error: "Bài làm không hợp lệ" };
  }

  if (attempt.userId) {
    if (!session || session.user.id !== attempt.userId) {
      return { error: "Không có quyền truy cập bài làm này" };
    }
  }

  const savedAnswers: Record<string, unknown> = {};
  for (const a of attempt.answers) {
    savedAnswers[a.questionId] = a.answer;
  }

  return {
    attemptId: attempt.id,
    status: attempt.status,
    savedAnswers,
  };
}

export async function savePlacementAnswerAction(
  attemptId: string,
  questionId: string,
  answer: unknown
) {
  const session = await auth();

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { paper: true },
  });

  if (
    !attempt ||
    attempt.status !== "IN_PROGRESS" ||
    attempt.paper.paperKind !== PaperKind.PLACEMENT
  ) {
    return { error: "Bài làm không hợp lệ" };
  }

  if (attempt.userId) {
    if (!session || session.user.id !== attempt.userId) {
      return { error: "Không có quyền" };
    }
  }

  await db.attemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, answer: answer ?? "" },
    update: { answer: answer ?? "" },
  });

  return { ok: true };
}
