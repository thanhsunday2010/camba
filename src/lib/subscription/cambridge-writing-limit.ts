import { ExamLevel, PaperKind } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminUserId } from "@/lib/auth-utils";
import {
  buildCambridgeWritingMockPoolKey,
  isCambridgeWritingPracticePoolKey,
} from "@/lib/exam/cambridge-writing-config";
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

async function countCambridgeWritingPracticeToday(
  userId: string,
  level: ExamLevel
): Promise<number> {
  const prefix = `${level}:WRT:P`;
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

async function countCambridgeWritingMockToday(userId: string, level: ExamLevel): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfToday() },
      paper: { mockPoolKey: buildCambridgeWritingMockPoolKey(level) },
    },
  });
}

async function countCambridgeWritingMockThisWeek(
  userId: string,
  level: ExamLevel
): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      startedAt: { gte: startOfWeek() },
      paper: { mockPoolKey: buildCambridgeWritingMockPoolKey(level) },
    },
  });
}

export type CambridgeWritingUsageSnapshot = {
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

export async function getCambridgeWritingUsageSnapshot(
  userId: string,
  level: ExamLevel
): Promise<CambridgeWritingUsageSnapshot> {
  const planId = await getUserPlanId(userId);
  const limits = getCambridgeSpeakingLimits(planId);
  const plan = getPlan(planId);

  const practiceUsed = await countCambridgeWritingPracticeToday(userId, level);

  let mockUsed: number;
  let mockPeriod: "day" | "week";
  if (limits.mockDaily > 0) {
    mockUsed = await countCambridgeWritingMockToday(userId, level);
    mockPeriod = "day";
  } else {
    mockUsed = await countCambridgeWritingMockThisWeek(userId, level);
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
  return `Đã hết ${limit} lượt luyện Writing ${level} hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

function mockLimitError(level: ExamLevel, limit: number, period: "day" | "week"): string {
  if (period === "week") {
    return `Đã dùng ${limit} lượt mock Writing ${level} tuần này. Thử lại từ đầu tuần sau hoặc nâng cấp Pro/VIP.`;
  }
  return `Đã hết ${limit} lượt mock Writing ${level} hôm nay. Quay lại ngày mai hoặc nâng cấp gói.`;
}

export async function canStartCambridgeWritingPractice(
  userId: string,
  level: ExamLevel
): Promise<{ ok: boolean; error?: string }> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getCambridgeSpeakingLimits(planId);
  const used = await countCambridgeWritingPracticeToday(userId, level);

  if (used >= limits.practiceDaily) {
    return { ok: false, error: practiceLimitError(level, limits.practiceDaily) };
  }
  return { ok: true };
}

export async function canStartCambridgeWritingMock(
  userId: string,
  level: ExamLevel
): Promise<{ ok: boolean; error?: string }> {
  if (await isAdminUserId(userId)) return { ok: true };

  const planId = await getUserPlanId(userId);
  const limits = getCambridgeSpeakingLimits(planId);

  if (limits.mockDaily > 0) {
    const used = await countCambridgeWritingMockToday(userId, level);
    if (used >= limits.mockDaily) {
      return { ok: false, error: mockLimitError(level, limits.mockDaily, "day") };
    }
    return { ok: true };
  }

  const used = await countCambridgeWritingMockThisWeek(userId, level);
  if (used >= limits.mockWeekly) {
    return { ok: false, error: mockLimitError(level, limits.mockWeekly, "week") };
  }
  return { ok: true };
}

export function isCambridgeWritingPracticePaperKey(key: string | null | undefined): boolean {
  return !!key && isCambridgeWritingPracticePoolKey(key);
}
