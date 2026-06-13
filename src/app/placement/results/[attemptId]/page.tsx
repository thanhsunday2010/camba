import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PlacementResultsClient } from "@/components/placement/placement-results-client";
import type { PlacementReport } from "@/lib/placement/evaluate";

export default async function PlacementResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { attemptId } = await params;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId, userId: session.user.id },
    include: { paper: true },
  });

  if (!attempt || attempt.paper.paperKind !== "PLACEMENT") notFound();

  return (
    <PlacementResultsClient
      attempt={{
        id: attempt.id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        timeSpent: attempt.timeSpent,
        paper: { title: attempt.paper.title },
        placementReport: attempt.placementReport as PlacementReport | null,
      }}
    />
  );
}
