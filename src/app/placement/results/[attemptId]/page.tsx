import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PlacementResultsClient } from "@/components/placement/placement-results-client";
import type { PlacementReport } from "@/lib/placement/evaluate";
import { ensurePlacementReport } from "@/lib/placement/build-report";
import { parseGamificationSnapshot } from "@/lib/gamification/service";

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
      isGuest={!attempt.userId}
      gamification={
        attempt.userId
          ? parseGamificationSnapshot(attempt.gamificationSnapshot)
          : null
      }
    />
  );
}
