import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ResultsClient } from "@/components/exam/results-client";
import { parseGamificationSnapshot } from "@/lib/gamification/service";

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

  return (
    <ResultsClient
      attempt={attempt}
      aiFeedbacks={aiFeedbacks}
      gamification={gamification}
    />
  );
}
