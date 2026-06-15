import { PaperKind, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminUserId } from "@/lib/auth-utils";
import {
  getPlacementWeeklyLimit,
  getPlan,
  PLACEMENT_WEEKLY_LIMIT,
  type PlanId,
} from "@/lib/subscription/plans";

function startOfWeek(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysFromMonday);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Khách (không đăng ký): 1 lượt placement bất kỳ loại nào / tháng (theo SĐT) */
export const GUEST_PLACEMENT_MONTHLY_LIMIT = 1;

export type PlacementWeeklySnapshot =
  | {
      planId: PlanId;
      planName: string;
      used: number;
      limit: null;
      remaining: null;
      unlimited: true;
    }
  | {
      planId: PlanId;
      planName: string;
      used: number;
      limit: number;
      remaining: number;
      unlimited: false;
    };

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

export async function countWeeklyPlacementAttempts(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfWeek() },
      paper: { paperKind: PaperKind.PLACEMENT },
    },
  });
}

export async function getPlacementWeeklySnapshot(userId: string): Promise<PlacementWeeklySnapshot> {
  if (await isAdminUserId(userId)) {
    const used = await countWeeklyPlacementAttempts(userId);
    return {
      planId: "FREE",
      planName: "Admin",
      used,
      limit: null,
      remaining: null,
      unlimited: true,
    };
  }

  const [planId, used] = await Promise.all([
    resolveUserPlanId(userId),
    countWeeklyPlacementAttempts(userId),
  ]);
  const limit = getPlacementWeeklyLimit(planId);
  return {
    planId,
    planName: getPlan(planId).name,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    unlimited: false,
  };
}

function placementLimitError(limit: number): string {
  return `Đã dùng hết ${limit} lượt placement tuần này. Thử lại từ đầu tuần sau nhé.`;
}

export async function canStartPlacementAttempt(userId: string): Promise<{
  ok: boolean;
  error?: string;
  used?: number;
  limit?: number | null;
  remaining?: number | null;
  unlimited?: boolean;
}> {
  const snapshot = await getPlacementWeeklySnapshot(userId);
  if (snapshot.unlimited) {
    return { ok: true, unlimited: true };
  }
  if (snapshot.used >= snapshot.limit) {
    return {
      ok: false,
      error: placementLimitError(snapshot.limit),
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

export async function countGuestPlacementAttemptsThisMonth(
  guestPhone: string
): Promise<number> {
  return db.attempt.count({
    where: {
      userId: null,
      guestPhone,
      startedAt: { gte: startOfMonth() },
      paper: { paperKind: PaperKind.PLACEMENT },
    },
  });
}

export async function getGuestPlacementMonthlySnapshot(guestPhone: string) {
  const used = await countGuestPlacementAttemptsThisMonth(guestPhone);
  const limit = GUEST_PLACEMENT_MONTHLY_LIMIT;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function canGuestStartPlacementAttempt(guestPhone: string): Promise<{
  ok: boolean;
  error?: string;
  used?: number;
  limit?: number;
  remaining?: number;
}> {
  const snapshot = await getGuestPlacementMonthlySnapshot(guestPhone);
  if (snapshot.used >= snapshot.limit) {
    return {
      ok: false,
      error:
        `Số điện thoại này đã dùng ${snapshot.limit} lượt placement trong tháng. ` +
        `Đăng ký tài khoản miễn phí để làm thêm (${PLACEMENT_WEEKLY_LIMIT} lượt/tuần).`,
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
