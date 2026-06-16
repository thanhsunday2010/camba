import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AttemptStatus } from "@prisma/client";
import { finalizeAttemptGrading } from "@/lib/exam/finalize-attempt";
import { gradeWriting } from "@/lib/ai/grading";
import { getGeminiApiKey } from "@/lib/ai/config";
import { checkWritingAIRateLimit, getWritingAIRateLimitInfo } from "@/lib/ai/rate-limit";
import { z } from "zod";

const writingSchema = z.object({
  questionId: z.string(),
  attemptId: z.string().optional(),
  studentAnswer: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkWritingAIRateLimit(session.user.id);
  if (!allowed) {
    const info = await getWritingAIRateLimitInfo(session.user.id);
    return NextResponse.json(
      { error: `Đã hết ${info.limit} lượt AI hôm nay (dùng chung). Nâng cấp gói tại trang Bảng giá.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = writingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { getUserPlanLimits } = await import("@/lib/subscription/service");
  const { countWords } = await import("@/lib/subscription/plans");
  const limits = await getUserPlanLimits(session.user.id);
  const wordCount = countWords(parsed.data.studentAnswer);
  if (wordCount > limits.writingWordLimit) {
    return NextResponse.json(
      {
        error: `Vượt giới hạn ${limits.writingWordLimit} từ/lần của gói hiện tại. Nâng cấp để viết dài hơn.`,
      },
      { status: 400 }
    );
  }

  const question = await db.question.findUnique({
    where: { id: parsed.data.questionId },
  });
  if (!question || question.type !== "FREE_TEXT") {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const content = question.content as { taskPrompt: string; wordLimit?: number };

  if (!getGeminiApiKey()) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY chưa được cấu hình" },
      { status: 503 }
    );
  }

  try {
    const { feedback, raw } = await gradeWriting({
      examLevel: question.level,
      taskPrompt: content.taskPrompt,
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
        rawResponse: raw as object,
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
    return NextResponse.json({ error: "AI grading failed" }, { status: 500 });
  }
}
