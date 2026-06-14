import { db } from "@/lib/db";
import { AdminPlacementClient } from "@/components/admin/placement-client";
import type { PlacementReport } from "@/lib/placement/evaluate";
import { requireAdminPage } from "@/lib/admin/access";

export default async function AdminPlacementPage() {
  const { access } = await requireAdminPage("placement.view");

  const attempts = await db.attempt.findMany({
    where: {
      paper: { paperKind: "PLACEMENT" },
      status: { in: ["SUBMITTED", "GRADED"] },
    },
    include: {
      paper: { select: { title: true } },
      user: { select: { name: true, email: true, phone: true } },
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

  return <AdminPlacementClient attempts={rows} permissions={access.permissions} />;
}
