import { ExamLevel, PaperKind } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminUserId } from "@/lib/auth-utils";
import {
  buildCambridgeSpeakingMockPoolKey,
  isCambridgeSpeakingPracticePoolKey,
} from "@/lib/exam/cambridge-speaking-config";
import { getCambridgeSpeakingLimits, getPlan, type PlanId } from "@/lib/subscription/plans";
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

async function countCambridgeSpeakingPracticeToday(
  userId: string,
  level: ExamLevel
): Promise<number> {
  const prefix = `${level}:SPK:P`;
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: {
        paperKind: PaperKind.PRACTICE,
        practicePoolKey: { startsWith: prefix },
      },
    },
  });
}

async function countCambridgeSpeakingMockToday(
  userId: string,
  level: ExamLevel
): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: { mockPoolKey: buildCambridgeSpeakingMockPoolKey(level) },
    },
  });
}

async function countCambridgeSpeakingMockThisWeek(
  userId: string,
  level: ExamLevel
): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfWeek() },
      paper: { mockPoolKey: buildCambridgeSpeakingMockPoolKey(level) },
    },
  });
}

export type CambridgeSpeakingUsageSnapshot = {
  planId: PlanId;
  planName: string;
  level: ExamLevel;
  practiceUsed: number;
  practiceLimit: number;
  practiceRemaining: number;
  mockUsed: number;
  mockLimit: number;
  mockRemaining: number;
  mockPeriod: "day" | "week";
};

export async function getCambridgeSpeakingUsageSnapshot(
  userId: string,
  level: ExamLevel
): Promise<CambridgeSpeakingUsageSnapshot> {
  const planId = await getUserPlanId(userId);
  const limits = getCambridgeSpeakingLimits(planId);
  const plan = getPlan(planId);

  const practiceUsed = await countCambridgeSpeakingPracticeToday(userId, level);

  let mockUsed: number;
  let mockPeriod: "day" | "week";
  if (limits.mockDaily > 0) {
    mockUsed = await countCambridgeSpeakingMockToday(userId, level);
    mockPeriod = "day";
  } else {
    mockUsed = await countCambridgeSpeakingMockThisWeek(userId, level);
    mockPeriod = "week";
  }

  const mockLimit = limits.mockDaily > 0 ? limits.mockDaily : limits.mockWeekly;

  return {
    planId,
    planName: plan.name,
    level,
    practiceUsed,
    practiceLimit: limits.practiceDaily,
    practiceRemaining: Math.max(0, limits.practiceDaily - practiceUsed),
    mockUsed,
    mockLimit,
    mockRemaining: Math.max(0, mockLimit - mockUsed),
    mockPeriod,
  };
}

function practiceLimitError(level: ExamLevel, limit: number): string {
  return `Đã hết ${limit} lượt luyện Speaking ${level} hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

function mockLimitError(level: ExamLevel, limit: number, period: "day" | "week"): string {
  if (period === "week") {
    return `Đã dùng ${limit} lượt mock Speaking ${level} tuần này. Thử lại từ đầu tuần sau hoặc nâng cấp Pro/VIP.`;
  }
  return `Đã hết ${limit} lượt mock Speaking ${level} hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

export async function canStartCambridgeSpeakingPractice(
  userId: string,
  level: ExamLevel
): Promise<{ ok: boolean; error?: string }> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getCambridgeSpeakingLimits(planId);
  const used = await countCambridgeSpeakingPracticeToday(userId, level);

  if (used >= limits.practiceDaily) {
    return { ok: false, error: practiceLimitError(level, limits.practiceDaily) };
  }
  return { ok: true };
}

export async function canStartCambridgeSpeakingMock(
  userId: string,
  level: ExamLevel
): Promise<{ ok: boolean; error?: string }> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getCambridgeSpeakingLimits(planId);

  if (limits.mockDaily > 0) {
    const used = await countCambridgeSpeakingMockToday(userId, level);
    if (used >= limits.mockDaily) {
      return { ok: false, error: mockLimitError(level, limits.mockDaily, "day") };
    }
    return { ok: true };
  }

  const used = await countCambridgeSpeakingMockThisWeek(userId, level);
  if (used >= limits.mockWeekly) {
    return { ok: false, error: mockLimitError(level, limits.mockWeekly, "week") };
  }
  return { ok: true };
}

export function isCambridgeSpeakingPracticePaperKey(key: string | null | undefined): boolean {
  return !!key && isCambridgeSpeakingPracticePoolKey(key);
}
