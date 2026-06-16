import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { gradeSpeaking, transcribeAudio } from "@/lib/ai/grading";
import { AttemptStatus } from "@prisma/client";
import { finalizeAttemptGrading } from "@/lib/exam/finalize-attempt";
import { checkSpeakingAIRateLimit } from "@/lib/ai/rate-limit";
import { formatAiGradingQuotaExceededMessage } from "@/lib/subscription/quota-messages";
import { getGeminiApiKey, getSpeechToTextMode } from "@/lib/ai/config";
import { getSpeakingPromptText } from "@/lib/exam/speaking-audio";
import type { SpeakingContent } from "@/lib/exam/scoring";
import type { SpeakingFeedback } from "@/lib/ai/schemas";
import { z } from "zod";

const jsonSchema = z.object({
  questionId: z.string(),
  attemptId: z.string().optional(),
  transcript: z.string().min(3),
});

function feedbackFromRecord(record: {
  overallScore: number | null;
  cambridgeBand: string | null;
  criteria: unknown;
  errors: unknown;
  suggestions: unknown;
}): SpeakingFeedback {
  const criteria = (record.criteria ?? {}) as SpeakingFeedback["criteria"];
  const errors = Array.isArray(record.errors)
    ? (record.errors as SpeakingFeedback["errors"])
    : [];
  const tips_vi = Array.isArray(record.suggestions)
    ? (record.suggestions as string[])
    : [];

  return {
    overallScore: record.overallScore ?? 0,
    cambridgeBand: record.cambridgeBand ?? "",
    criteria: {
      fluency: criteria.fluency ?? 0,
      pronunciation: criteria.pronunciation ?? 0,
      grammar: criteria.grammar ?? 0,
      vocabulary: criteria.vocabulary ?? 0,
      taskAchievement: criteria.taskAchievement ?? 0,
    },
    errors,
    tips_vi,
    summary_vi: tips_vi[0] ?? "Đã chấm bài nói trước đó.",
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getGeminiApiKey()) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY chưa được cấu hình" },
      { status: 503 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";

  let questionId: string;
  let attemptId: string | undefined;
  let transcript: string;

  if (contentType.includes("application/json")) {
    const parsed = jsonSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Transcript required (min 3 chars)" }, { status: 400 });
    }
    questionId = parsed.data.questionId;
    attemptId = parsed.data.attemptId;
    transcript = parsed.data.transcript;
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    questionId = formData.get("questionId") as string;
    attemptId = (formData.get("attemptId") as string) || undefined;
    const textTranscript = formData.get("transcript") as string | null;
    const audio = formData.get("audio") as File | null;

    if (textTranscript?.trim()) {
      transcript = textTranscript.trim();
    } else if (audio && getSpeechToTextMode() === "gemini") {
      const buffer = Buffer.from(await audio.arrayBuffer());
      transcript = await transcribeAudio(buffer, audio.type || "audio/webm");
    } else {
      return NextResponse.json(
        {
          error:
            "Gửi transcript JSON từ Web Speech API, hoặc bật SPEECH_TO_TEXT_MODE=gemini để upload audio.",
        },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
  }

  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question || question.type !== "SPEAKING_PROMPT") {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (attemptId) {
    const existing = await db.aIFeedback.findFirst({
      where: {
        userId: session.user.id,
        questionId: question.id,
        attemptId,
        feedbackType: "speaking",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({
        feedback: feedbackFromRecord(existing),
        feedbackId: existing.id,
        transcript: existing.transcript ?? transcript,
        alreadyGraded: true,
      });
    }
  }

  const allowed = await checkSpeakingAIRateLimit(session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: formatAiGradingQuotaExceededMessage() }, { status: 429 });
  }

  const { getUserPlanLimits } = await import("@/lib/subscription/service");
  const { countWords } = await import("@/lib/subscription/plans");
  const limits = await getUserPlanLimits(session.user.id);
  const wordCount = countWords(transcript);
  if (wordCount > limits.speakingWordLimit) {
    return NextResponse.json(
      {
        error: `Vượt giới hạn ${limits.speakingWordLimit} từ/lần của gói hiện tại. Nâng cấp để nói dài hơn.`,
      },
      { status: 400 }
    );
  }

  const content = question.content as unknown as SpeakingContent & {
    examTrack?: string;
    ieltsPart?: 1 | 2 | 3;
  };
  const isIelts = content.examTrack === "IELTS";
  const promptText = getSpeakingPromptText(content);

  try {
    const { feedback, raw } = await gradeSpeaking({
      examLevel: question.level,
      prompt: promptText,
      transcript,
      track: isIelts ? "ielts" : "cambridge",
      ieltsPart: content.ieltsPart,
    });

    const aiFeedback = await db.aIFeedback.create({
      data: {
        userId: session.user.id,
        questionId: question.id,
        attemptId,
        feedbackType: "speaking",
        inputText: transcript,
        transcript,
        overallScore: feedback.overallScore,
        cambridgeBand: feedback.cambridgeBand,
        criteria: feedback.criteria,
        errors: feedback.errors,
        suggestions: feedback.tips_vi,
        rawResponse: raw as object,
      },
    });

    const { recordSpeakingAiGradingUsage } = await import("@/lib/subscription/service");
    await recordSpeakingAiGradingUsage(session.user.id);

    if (attemptId) {
      const attempt = await db.attempt.findUnique({
        where: { id: attemptId },
        select: { status: true },
      });

      await db.attemptAnswer.upsert({
        where: {
          attemptId_questionId: { attemptId, questionId: question.id },
        },
        create: {
          attemptId,
          questionId: question.id,
          answer: transcript,
          score: (feedback.overallScore / 100) * question.points,
          isCorrect: feedback.overallScore >= 60,
        },
        update: {
          answer: transcript,
          score: (feedback.overallScore / 100) * question.points,
          isCorrect: feedback.overallScore >= 60,
        },
      });

      if (attempt && attempt.status !== AttemptStatus.IN_PROGRESS) {
        await finalizeAttemptGrading(attemptId);
      }
    }

    return NextResponse.json({ feedback, feedbackId: aiFeedback.id, transcript });
  } catch (e) {
    console.error(e);
    const detail = e instanceof Error ? e.message : "unknown";
    const message =
      detail.includes("Parse") || detail.includes("parse")
        ? "AI trả lời không đúng định dạng. Vui lòng thử lại."
        : detail.includes("quota") || detail.includes("429")
          ? formatAiGradingQuotaExceededMessage()
          : "Không thể chấm bài nói bằng AI. Thử lại sau vài giây.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
