import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ResultsClient } from "@/components/exam/results-client";
import { parseGamificationSnapshot } from "@/lib/gamification/service";
import { getPartAiPracticeResultsMeta } from "@/lib/exam/part-ai-practice-results";
import { getObjectivePracticeContinueMeta } from "@/lib/exam/practice-results-next";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { attemptId } = await params;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId, userId: session.user.id },
    include: {
      paper: true,
      answers: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!attempt) notFound();

  const aiFeedbacks = await db.aIFeedback.findMany({
    where: { userId: session.user.id, attemptId },
  });

  const gamification = parseGamificationSnapshot(attempt.gamificationSnapshot);

  const partAiPracticeMeta = await getPartAiPracticeResultsMeta(session.user.id, {
    id: attempt.paper.id,
    paperKind: attempt.paper.paperKind,
    practicePoolKey: attempt.paper.practicePoolKey,
    level: attempt.paper.level,
  });

  const objectiveContinueMeta =
    partAiPracticeMeta === null && attempt.status === "GRADED"
      ? getObjectivePracticeContinueMeta({
          id: attempt.paper.id,
          level: attempt.paper.level,
          skill: attempt.paper.skill,
          paperKind: attempt.paper.paperKind,
        })
      : null;

  return (
    <ResultsClient
      attempt={attempt}
      aiFeedbacks={aiFeedbacks}
      gamification={gamification}
      partAiPracticeMeta={partAiPracticeMeta}
      objectiveContinueMeta={objectiveContinueMeta}
    />
  );
}
