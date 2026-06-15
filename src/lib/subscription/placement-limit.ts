import { PaperKind, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getPlacementDailyLimit,
  getPlan,
  type PlanId,
} from "@/lib/subscription/plans";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function resolveUserPlanId(userId: string): Promise<PlanId> {
  const now = new Date();
  const sub = await db.userSubscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
  });
  if (!sub || sub.plan === "FREE") return "FREE";
  return sub.plan;
}

export async function countTodayPlacementAttempts(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: { paperKind: PaperKind.PLACEMENT },
    },
  });
}

export async function getPlacementDailySnapshot(userId: string) {
  const [planId, used] = await Promise.all([
    resolveUserPlanId(userId),
    countTodayPlacementAttempts(userId),
  ]);
  const limit = getPlacementDailyLimit(planId);
  return {
    planId,
    planName: getPlan(planId).name,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

function placementLimitError(planId: PlanId, limit: number): string {
  const upgrade =
    planId === "FREE"
      ? " Nâng cấp Pro (4 lượt/ngày) hoặc VIP (6 lượt/ngày) để tiếp tục."
      : planId === "PRO"
        ? " Nâng cấp VIP (6 lượt/ngày) để tiếp tục."
        : "";
  return `Đã dùng hết ${limit} lượt placement hôm nay (gói ${getPlan(planId).name}).${upgrade}`;
}

export async function canStartPlacementAttempt(userId: string): Promise<{
  ok: boolean;
  error?: string;
  used?: number;
  limit?: number;
  remaining?: number;
}> {
  const snapshot = await getPlacementDailySnapshot(userId);
  if (snapshot.used >= snapshot.limit) {
    return {
      ok: false,
      error: placementLimitError(snapshot.planId, snapshot.limit),
      used: snapshot.used,
      limit: snapshot.limit,
      remaining: 0,
    };
  }
  return {
    ok: true,
    used: snapshot.used,
    limit: snapshot.limit,
    remaining: snapshot.remaining,
  };
}
