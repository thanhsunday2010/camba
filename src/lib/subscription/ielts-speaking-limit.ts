import { PaperKind } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminUserId } from "@/lib/auth-utils";
import {
  IELTS_SPEAKING_MOCK_POOL_KEY,
  isIeltsSpeakingPracticePoolKey,
} from "@/lib/exam/ielts-speaking-config";
import { getPlan, getIeltsSpeakingLimits, type PlanId } from "@/lib/subscription/plans";
import { getUserPlanId } from "@/lib/subscription/service";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysFromMonday);
  return d;
}

async function countIeltsSpeakingPracticeToday(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: {
        paperKind: PaperKind.PRACTICE,
        practicePoolKey: { startsWith: "IELTS:SPK:P" },
      },
    },
  });
}

async function countIeltsSpeakingMockToday(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: { mockPoolKey: IELTS_SPEAKING_MOCK_POOL_KEY },
    },
  });
}

async function countIeltsSpeakingMockThisWeek(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfWeek() },
      paper: { mockPoolKey: IELTS_SPEAKING_MOCK_POOL_KEY },
    },
  });
}

export type IeltsSpeakingUsageSnapshot = {
  planId: PlanId;
  planName: string;
  practiceUsed: number;
  practiceLimit: number;
  practiceRemaining: number;
  mockUsed: number;
  mockLimit: number;
  mockRemaining: number;
  mockPeriod: "day" | "week";
};

export async function getIeltsSpeakingUsageSnapshot(
  userId: string
): Promise<IeltsSpeakingUsageSnapshot> {
  const planId = await getUserPlanId(userId);
  const limits = getIeltsSpeakingLimits(planId);
  const plan = getPlan(planId);

  const practiceUsed = await countIeltsSpeakingPracticeToday(userId);

  let mockUsed: number;
  let mockPeriod: "day" | "week";
  if (limits.mockDaily > 0) {
    mockUsed = await countIeltsSpeakingMockToday(userId);
    mockPeriod = "day";
  } else {
    mockUsed = await countIeltsSpeakingMockThisWeek(userId);
    mockPeriod = "week";
  }

  const mockLimit = limits.mockDaily > 0 ? limits.mockDaily : limits.mockWeekly;

  return {
    planId,
    planName: plan.name,
    practiceUsed,
    practiceLimit: limits.practiceDaily,
    practiceRemaining: Math.max(0, limits.practiceDaily - practiceUsed),
    mockUsed,
    mockLimit,
    mockRemaining: Math.max(0, mockLimit - mockUsed),
    mockPeriod,
  };
}

function practiceLimitError(limit: number): string {
  return `Đã hết ${limit} lượt luyện Speaking IELTS hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

function mockLimitError(limit: number, period: "day" | "week"): string {
  if (period === "week") {
    return `Đã dùng ${limit} lượt mock Speaking IELTS tuần này. Thử lại từ đầu tuần sau hoặc nâng cấp Pro/VIP.`;
  }
  return `Đã hết ${limit} lượt mock Speaking IELTS hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

export async function canStartIeltsSpeakingPractice(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getIeltsSpeakingLimits(planId);
  const used = await countIeltsSpeakingPracticeToday(userId);

  if (used >= limits.practiceDaily) {
    return { ok: false, error: practiceLimitError(limits.practiceDaily) };
  }
  return { ok: true };
}

export async function canStartIeltsSpeakingMock(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getIeltsSpeakingLimits(planId);

  if (limits.mockDaily > 0) {
    const used = await countIeltsSpeakingMockToday(userId);
    if (used >= limits.mockDaily) {
      return { ok: false, error: mockLimitError(limits.mockDaily, "day") };
    }
    return { ok: true };
  }

  const used = await countIeltsSpeakingMockThisWeek(userId);
  if (used >= limits.mockWeekly) {
    return { ok: false, error: mockLimitError(limits.mockWeekly, "week") };
  }
  return { ok: true };
}

export function isIeltsSpeakingPracticePaperKey(key: string | null | undefined): boolean {
  return !!key && isIeltsSpeakingPracticePoolKey(key);
}
