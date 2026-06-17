import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PlacementResultsClient } from "@/components/placement/placement-results-client";
import type { PlacementReport } from "@/lib/placement/evaluate";
import { ensurePlacementReport } from "@/lib/placement/build-report";
import { parseGamificationSnapshot } from "@/lib/gamification/service";
import { getPlacementWeeklySnapshot } from "@/lib/subscription/placement-limit";
import { QuestionType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function PlacementResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  const { attemptId } = await params;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { paper: true },
  });

  if (!attempt || attempt.paper.paperKind !== "PLACEMENT") notFound();

  if (attempt.userId) {
    if (!session || session.user.id !== attempt.userId) {
      if (session?.user?.role !== "ADMIN") notFound();
    }
  }

  if (attempt.status === "IN_PROGRESS") notFound();

  const placementReport = await ensurePlacementReport(
    db,
    attemptId,
    attempt.placementReport
  );

  const displayName =
    attempt.guestFullName ?? (attempt.userId ? undefined : "Khách");

  const placementWeekly =
    attempt.userId && session?.user?.id === attempt.userId
      ? await getPlacementWeeklySnapshot(attempt.userId)
      : null;

  const [attemptQuestions, aiFeedbacks] = await Promise.all([
    db.attemptQuestion.findMany({
      where: { attemptId },
      orderBy: { orderIndex: "asc" },
      select: {
        question: {
          select: {
            id: true,
            type: true,
            content: true,
            correctAnswer: true,
            points: true,
            skill: true,
            title: true,
          },
        },
      },
    }),
    db.aIFeedback.findMany({
      where: { attemptId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const answerRows = await db.attemptAnswer.findMany({
    where: { attemptId },
  });
  const answerByQuestion = new Map(answerRows.map((a) => [a.questionId, a]));

  const aiAnswers = attemptQuestions
    .map((aq) => aq.question)
    .filter(
      (q) => q.type === QuestionType.FREE_TEXT || q.type === QuestionType.SPEAKING_PROMPT
    )
    .map((question) => {
      const answer = answerByQuestion.get(question.id);
      return {
        id: answer?.id ?? question.id,
        answer: answer?.answer ?? null,
        isCorrect: answer?.isCorrect ?? null,
        score: answer?.score ?? null,
        question,
      };
    });

  const aiFeedbackItems = aiFeedbacks.map((f) => ({
    id: f.id,
    feedbackType: f.feedbackType,
    inputText: f.inputText,
    transcript: f.transcript,
    overallScore: f.overallScore,
    cambridgeBand: f.cambridgeBand,
    criteria: f.criteria,
    errors: f.errors,
    suggestions: f.suggestions,
    improvedVersion: f.improvedVersion,
    questionId: f.questionId,
    rawResponse: f.rawResponse,
  }));

  return (
    <PlacementResultsClient
      attempt={{
        id: attempt.id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        timeSpent: attempt.timeSpent,
        paper: { title: attempt.paper.title },
        placementReport: placementReport as PlacementReport | null,
        guestFullName: attempt.guestFullName,
        guestPhone: attempt.guestPhone,
        displayName,
      }}
      aiAnswers={aiAnswers}
      aiFeedbacks={aiFeedbackItems}
      isGuest={!attempt.userId}
      placementWeekly={placementWeekly}
      gamification={
        attempt.userId
          ? parseGamificationSnapshot(attempt.gamificationSnapshot)
          : null
      }
    />
  );
}
