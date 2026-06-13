import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AdminPlacementClient } from "@/components/admin/placement-client";
import type { PlacementReport } from "@/lib/placement/evaluate";

export default async function AdminPlacementPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const attempts = await db.attempt.findMany({
    where: {
      paper: { paperKind: "PLACEMENT" },
      status: { in: ["SUBMITTED", "GRADED"] },
    },
    include: {
      paper: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 500,
  });

  const rows = attempts.map((a) => ({
    id: a.id,
    guestFullName: a.guestFullName,
    guestPhone: a.guestPhone,
    score: a.score,
    maxScore: a.maxScore,
    submittedAt: a.submittedAt,
    placementReport: a.placementReport as PlacementReport | null,
    paper: a.paper,
    user: a.user,
  }));

  return <AdminPlacementClient attempts={rows} />;
}
