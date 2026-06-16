import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AttemptStatus } from "@prisma/client";
import { finalizeAttemptGrading } from "@/lib/exam/finalize-attempt";
import { gradeWriting } from "@/lib/ai/grading";
import { getGeminiApiKey } from "@/lib/ai/config";
import { checkWritingAIRateLimit } from "@/lib/ai/rate-limit";
import { formatAiGradingQuotaExceededMessage } from "@/lib/subscription/quota-messages";
import { getWritingTaskPrompt } from "@/lib/exam/scoring";
import { getWritingSubmissionWordLimit } from "@/lib/exam/writing-word-limit";
import type { WritingFeedback } from "@/lib/ai/schemas";
import { z } from "zod";

const writingSchema = z.object({
  questionId: z.string(),
  attemptId: z.string().optional(),
  studentAnswer: z.string().min(10).max(5000),
});

function feedbackFromRecord(record: {
  overallScore: number | null;
  cambridgeBand: string | null;
  criteria: unknown;
  errors: unknown;
  suggestions: unknown;
  improvedVersion: string | null;
  rawResponse: unknown;
}): WritingFeedback {
  const criteria = (record.criteria ?? {}) as WritingFeedback["criteria"];
  const errors = Array.isArray(record.errors)
    ? (record.errors as WritingFeedback["errors"])
    : [];
  const tips_vi = Array.isArray(record.suggestions)
    ? (record.suggestions as string[])
    : [];
  const raw = record.rawResponse as { summary_vi?: string } | null;

  return {
    overallScore: record.overallScore ?? 0,
    cambridgeBand: record.cambridgeBand ?? "",
    criteria: {
      content: criteria.content ?? 0,
      communicativeAchievement: criteria.communicativeAchievement ?? 0,
      organisation: criteria.organisation ?? 0,
      language: criteria.language ?? 0,
    },
    errors,
    improvedVersion: record.improvedVersion ?? "",
    tips_vi: tips_vi.length > 0 ? tips_vi : ["Đã chấm bài viết trước đó."],
    summary_vi: raw?.summary_vi ?? tips_vi[0] ?? "Đã chấm bài viết trước đó.",
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = writingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const question = await db.question.findUnique({
    where: { id: parsed.data.questionId },
  });
  if (!question || question.type !== "FREE_TEXT") {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (parsed.data.attemptId) {
    const attempt = await db.attempt.findFirst({
      where: { id: parsed.data.attemptId, userId: session.user.id },
      select: { id: true, status: true },
    });
    if (!attempt) {
      return NextResponse.json({ error: "Bài làm không hợp lệ" }, { status: 404 });
    }

    const existing = await db.aIFeedback.findFirst({
      where: {
        userId: session.user.id,
        questionId: question.id,
        attemptId: parsed.data.attemptId,
        feedbackType: "writing",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({
        feedback: feedbackFromRecord(existing),
        feedbackId: existing.id,
        alreadyGraded: true,
      });
    }
  }

  const allowed = await checkWritingAIRateLimit(session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: formatAiGradingQuotaExceededMessage() }, { status: 429 });
  }

  const { countWords } = await import("@/lib/subscription/plans");
  const wordCount = countWords(parsed.data.studentAnswer);

  const content = question.content as { taskPrompt?: string; wordLimit?: number };
  const submissionLimit = getWritingSubmissionWordLimit(content.wordLimit);
  if (submissionLimit != null && wordCount > submissionLimit) {
    return NextResponse.json(
      {
        error: `Vượt giới hạn ${submissionLimit} từ (đề ${content.wordLimit} từ + 20%).`,
      },
      { status: 400 }
    );
  }

  const taskPrompt = getWritingTaskPrompt(content);
  if (!taskPrompt) {
    return NextResponse.json({ error: "Câu hỏi thiếu đề bài writing" }, { status: 422 });
  }

  if (!getGeminiApiKey()) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY chưa được cấu hình" },
      { status: 503 }
    );
  }

  try {
    const { feedback, raw } = await gradeWriting({
      examLevel: question.level,
      taskPrompt,
      studentAnswer: parsed.data.studentAnswer,
      wordLimit: content.wordLimit,
    });

    const aiFeedback = await db.aIFeedback.create({
      data: {
        userId: session.user.id,
        questionId: question.id,
        attemptId: parsed.data.attemptId,
        feedbackType: "writing",
        inputText: parsed.data.studentAnswer,
        overallScore: feedback.overallScore,
        cambridgeBand: feedback.cambridgeBand,
        criteria: feedback.criteria,
        errors: feedback.errors,
        suggestions: feedback.tips_vi,
        improvedVersion: feedback.improvedVersion,
        rawResponse: {
          ...(typeof raw === "object" && raw !== null ? (raw as object) : {}),
          summary_vi: feedback.summary_vi,
        },
      },
    });

    const { recordWritingAiGradingUsage } = await import("@/lib/subscription/service");
    await recordWritingAiGradingUsage(session.user.id);

    if (parsed.data.attemptId) {
      const attempt = await db.attempt.findUnique({
        where: { id: parsed.data.attemptId },
        select: { status: true },
      });

      await db.attemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: parsed.data.attemptId,
            questionId: question.id,
          },
        },
        create: {
          attemptId: parsed.data.attemptId,
          questionId: question.id,
          answer: parsed.data.studentAnswer,
          score: (feedback.overallScore / 100) * question.points,
          isCorrect: feedback.overallScore >= 60,
        },
        update: {
          answer: parsed.data.studentAnswer,
          score: (feedback.overallScore / 100) * question.points,
          isCorrect: feedback.overallScore >= 60,
        },
      });

      if (attempt && attempt.status !== AttemptStatus.IN_PROGRESS) {
        await finalizeAttemptGrading(parsed.data.attemptId);
      }
    }

    return NextResponse.json({ feedback, feedbackId: aiFeedback.id });
  } catch (e) {
    console.error(e);
    const detail = e instanceof Error ? e.message : "unknown";
    const message =
      detail.includes("Parse") || detail.includes("parse")
        ? "AI trả lời không đúng định dạng. Vui lòng thử lại."
        : detail.includes("quota") || detail.includes("429")
          ? formatAiGradingQuotaExceededMessage()
          : "Không thể chấm bài viết bằng AI. Thử lại sau vài giây.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
