import { PaperKind } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminUserId } from "@/lib/auth-utils";
import {
  IELTS_WRITING_MOCK_POOL_KEY,
  isIeltsWritingPracticePoolKey,
} from "@/lib/exam/ielts-writing-config";
import { getPlan, getIeltsSpeakingLimits, isUnlimitedQuota, computeRemaining, type PlanId } from "@/lib/subscription/plans";
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

async function countIeltsWritingPracticeToday(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: {
        paperKind: PaperKind.PRACTICE,
        OR: [
          { practicePoolKey: { startsWith: "IELTS:AC:WRT:T" } },
          { practicePoolKey: { startsWith: "IELTS:GT:WRT:T" } },
          { practicePoolKey: { startsWith: "IELTS:WRT:T" } },
        ],
      },
    },
  });
}

async function countIeltsWritingMockToday(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: {
        OR: [
          { mockPoolKey: IELTS_WRITING_MOCK_POOL_KEY },
          { mockPoolKey: "IELTS:WRT:MOCK" },
          { mockPoolKey: "IELTS:GT:WRT:MOCK" },
        ],
      },
    },
  });
}

async function countIeltsWritingMockThisWeek(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfWeek() },
      paper: {
        OR: [
          { mockPoolKey: IELTS_WRITING_MOCK_POOL_KEY },
          { mockPoolKey: "IELTS:WRT:MOCK" },
          { mockPoolKey: "IELTS:GT:WRT:MOCK" },
        ],
      },
    },
  });
}

export type IeltsWritingUsageSnapshot = {
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

export async function getIeltsWritingUsageSnapshot(
  userId: string
): Promise<IeltsWritingUsageSnapshot> {
  const planId = await getUserPlanId(userId);
  const limits = getIeltsSpeakingLimits(planId);
  const plan = getPlan(planId);

  const practiceUsed = await countIeltsWritingPracticeToday(userId);

  let mockUsed: number;
  let mockPeriod: "day" | "week";
  if (isUnlimitedQuota(limits.mockDaily)) {
    mockUsed = await countIeltsWritingMockToday(userId);
    mockPeriod = "day";
  } else if (limits.mockDaily > 0) {
    mockUsed = await countIeltsWritingMockToday(userId);
    mockPeriod = "day";
  } else {
    mockUsed = await countIeltsWritingMockThisWeek(userId);
    mockPeriod = "week";
  }

  const mockLimit = isUnlimitedQuota(limits.mockDaily)
    ? limits.mockDaily
    : limits.mockDaily > 0
      ? limits.mockDaily
      : limits.mockWeekly;

  return {
    planId,
    planName: plan.name,
    practiceUsed,
    practiceLimit: limits.practiceDaily,
    practiceRemaining: computeRemaining(practiceUsed, limits.practiceDaily),
    mockUsed,
    mockLimit,
    mockRemaining: computeRemaining(mockUsed, mockLimit),
    mockPeriod,
  };
}

function practiceLimitError(limit: number): string {
  return `Đã hết ${limit} lượt luyện Writing IELTS hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

function mockLimitError(limit: number, period: "day" | "week"): string {
  if (period === "week") {
    return `Đã dùng ${limit} lượt mock Writing IELTS tuần này. Thử lại từ đầu tuần sau hoặc nâng cấp Pro/VIP.`;
  }
  return `Đã hết ${limit} lượt mock Writing IELTS hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

export async function canStartIeltsWritingPractice(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getIeltsSpeakingLimits(planId);
  if (isUnlimitedQuota(limits.practiceDaily)) return { ok: true };

  const used = await countIeltsWritingPracticeToday(userId);

  if (used >= limits.practiceDaily) {
    return { ok: false, error: practiceLimitError(limits.practiceDaily) };
  }
  return { ok: true };
}

export async function canStartIeltsWritingMock(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getIeltsSpeakingLimits(planId);

  if (isUnlimitedQuota(limits.mockDaily) || isUnlimitedQuota(limits.mockWeekly)) {
    return { ok: true };
  }

  if (limits.mockDaily > 0) {
    const used = await countIeltsWritingMockToday(userId);
    if (used >= limits.mockDaily) {
      return { ok: false, error: mockLimitError(limits.mockDaily, "day") };
    }
    return { ok: true };
  }

  const used = await countIeltsWritingMockThisWeek(userId);
  if (used >= limits.mockWeekly) {
    return { ok: false, error: mockLimitError(limits.mockWeekly, "week") };
  }
  return { ok: true };
}

export function isIeltsWritingPracticePaperKey(key: string | null | undefined): boolean {
  return !!key && isIeltsWritingPracticePoolKey(key);
}
