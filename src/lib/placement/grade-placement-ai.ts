import {
  AttemptStatus,
  PaperKind,
  Prisma,
  QuestionType,
  type PrismaClient,
} from "@prisma/client";
import { getGeminiApiKey } from "@/lib/ai/config";
import { gradeSpeaking, gradeWriting } from "@/lib/ai/grading";
import { checkSpeakingAIRateLimit, checkWritingAIRateLimit } from "@/lib/ai/rate-limit";
import { formatAiGradingQuotaExceededMessage } from "@/lib/subscription/quota-messages";
import { finalizeAttemptGrading } from "@/lib/exam/finalize-attempt";
import { getSpeakingPromptText } from "@/lib/exam/speaking-audio";
import type { SpeakingContent } from "@/lib/exam/scoring";
import { getWritingTaskPrompt } from "@/lib/exam/scoring";
import { getWritingSubmissionWordLimit } from "@/lib/exam/writing-word-limit";
import {
  buildPracticeMinWordsContext,
  meetsPracticeMinWords,
} from "@/lib/exam/practice-min-words";
import { buildPlacementReportForAttempt } from "@/lib/placement/build-report";
import { countWords } from "@/lib/subscription/plans";
import { getUserPlanLimits } from "@/lib/subscription/service";

const PLACEMENT_AI_GUEST_EMAIL = "placement-ai-guest@internal.camba.local";

export async function resolvePlacementAiFeedbackUserId(
  db: PrismaClient,
  attemptUserId: string | null
): Promise<string> {
  if (attemptUserId) return attemptUserId;

  const existing = await db.user.findUnique({
    where: { email: PLACEMENT_AI_GUEST_EMAIL },
    select: { id: true },
  });
  if (existing) return existing.id;

  const user = await db.user.create({
    data: {
      email: PLACEMENT_AI_GUEST_EMAIL,
      name: "Placement AI (guest)",
      role: "STUDENT",
    },
  });
  return user.id;
}

export type GradePlacementAiResult = {
  graded: number;
  failed: number;
  errors: string[];
};

export async function gradePlacementAiQuestions(
  db: PrismaClient,
  attemptId: string,
  answers: Record<string, unknown>
): Promise<GradePlacementAiResult> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      attemptQuestions: {
        include: { question: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!attempt || attempt.paper.paperKind !== PaperKind.PLACEMENT) {
    throw new Error("Bài làm placement không hợp lệ");
  }

  if (attempt.status === AttemptStatus.IN_PROGRESS) {
    throw new Error("Bài chưa nộp");
  }

  if (!getGeminiApiKey()) {
    throw new Error("GOOGLE_AI_API_KEY chưa được cấu hình");
  }

  const minWordsContext = buildPracticeMinWordsContext(attempt.paper);
  const feedbackUserId = await resolvePlacementAiFeedbackUserId(db, attempt.userId);
  const questions = attempt.attemptQuestions.map((aq) => aq.question);
  const aiQuestions = questions.filter(
    (q) => q.type === QuestionType.FREE_TEXT || q.type === QuestionType.SPEAKING_PROMPT
  );

  let graded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const q of aiQuestions) {
    const ans = answers[q.id];
    if (typeof ans !== "string" || !ans.trim()) continue;
    if (!meetsPracticeMinWords(q.type, q.content, ans, minWordsContext)) continue;

    const existing = await db.aIFeedback.findFirst({
      where: {
        attemptId,
        questionId: q.id,
        feedbackType: q.type === QuestionType.FREE_TEXT ? "writing" : "speaking",
      },
    });
    if (existing) {
      graded += 1;
      continue;
    }

    if (q.type === QuestionType.FREE_TEXT) {
      if (attempt.userId) {
        const allowed = await checkWritingAIRateLimit(attempt.userId);
        if (!allowed) {
          failed += 1;
          errors.push(formatAiGradingQuotaExceededMessage());
          continue;
        }
      }

      const content = q.content as { taskPrompt?: string; wordLimit?: number };
      const wordCount = countWords(ans);
      const submissionLimit = getWritingSubmissionWordLimit(content.wordLimit);
      if (submissionLimit != null && wordCount > submissionLimit) {
        failed += 1;
        errors.push(`Writing vượt giới hạn ${submissionLimit} từ.`);
        continue;
      }

      const taskPrompt = getWritingTaskPrompt(content);
      if (!taskPrompt) {
        failed += 1;
        errors.push("Câu writing thiếu đề bài.");
        continue;
      }

      try {
        const { feedback, raw } = await gradeWriting({
          examLevel: q.level,
          taskPrompt,
          studentAnswer: ans,
          wordLimit: content.wordLimit,
        });

        await db.aIFeedback.create({
          data: {
            userId: feedbackUserId,
            questionId: q.id,
            attemptId,
            feedbackType: "writing",
            inputText: ans,
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

        if (attempt.userId) {
          const { recordWritingAiGradingUsage } = await import("@/lib/subscription/service");
          await recordWritingAiGradingUsage(attempt.userId);
        }

        await db.attemptAnswer.upsert({
          where: { attemptId_questionId: { attemptId, questionId: q.id } },
          create: {
            attemptId,
            questionId: q.id,
            answer: ans,
            score: (feedback.overallScore / 100) * q.points,
            isCorrect: feedback.overallScore >= 60,
          },
          update: {
            answer: ans,
            score: (feedback.overallScore / 100) * q.points,
            isCorrect: feedback.overallScore >= 60,
          },
        });

        graded += 1;
      } catch (e) {
        failed += 1;
        errors.push(e instanceof Error ? e.message : "Không thể chấm writing");
      }
      continue;
    }

    if (attempt.userId) {
      const allowed = await checkSpeakingAIRateLimit(attempt.userId);
      if (!allowed) {
        failed += 1;
        errors.push(formatAiGradingQuotaExceededMessage());
        continue;
      }

      const limits = await getUserPlanLimits(attempt.userId);
      const wordCount = countWords(ans);
      if (wordCount > limits.speakingWordLimit) {
        failed += 1;
        errors.push(`Speaking vượt giới hạn ${limits.speakingWordLimit} từ/lần.`);
        continue;
      }
    }

    const content = q.content as unknown as SpeakingContent & {
      examTrack?: string;
      ieltsPart?: 1 | 2 | 3;
    };
    const isIelts = content.examTrack === "IELTS";
    const promptText = getSpeakingPromptText(content);

    try {
      const { feedback, raw } = await gradeSpeaking({
        examLevel: q.level,
        prompt: promptText,
        transcript: ans,
        track: isIelts ? "ielts" : "cambridge",
        ieltsPart: content.ieltsPart,
      });

      await db.aIFeedback.create({
        data: {
          userId: feedbackUserId,
          questionId: q.id,
          attemptId,
          feedbackType: "speaking",
          inputText: ans,
          transcript: ans,
          overallScore: feedback.overallScore,
          cambridgeBand: feedback.cambridgeBand,
          criteria: feedback.criteria,
          errors: feedback.errors,
          suggestions: feedback.tips_vi,
          rawResponse: raw as object,
        },
      });

      if (attempt.userId) {
        const { recordSpeakingAiGradingUsage } = await import("@/lib/subscription/service");
        await recordSpeakingAiGradingUsage(attempt.userId);
      }

      await db.attemptAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: q.id } },
        create: {
          attemptId,
          questionId: q.id,
          answer: ans,
          score: (feedback.overallScore / 100) * q.points,
          isCorrect: feedback.overallScore >= 60,
        },
        update: {
          answer: ans,
          score: (feedback.overallScore / 100) * q.points,
          isCorrect: feedback.overallScore >= 60,
        },
      });

      graded += 1;
    } catch (e) {
      failed += 1;
      errors.push(e instanceof Error ? e.message : "Không thể chấm speaking");
    }
  }

  await finalizeAttemptGrading(attemptId);

  const report = await buildPlacementReportForAttempt(db, attemptId);
  if (report) {
    await db.attempt.update({
      where: { id: attemptId },
      data: { placementReport: report as unknown as Prisma.InputJsonValue },
    });
  }

  return { graded, failed, errors };
}
