import { BillingCycle, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getPlan,
  isUnlimitedQuota,
  type AiGradingSkill,
  type PlanId,
} from "@/lib/subscription/plans";
import { WRITING_WORD_LIMIT_POLICY_LABEL } from "@/lib/exam/writing-word-limit";
import {
  formatAiGradingQuotaExceededMessage,
  formatPracticeQuotaExceededMessage,
} from "@/lib/subscription/quota-messages";
import { getPlacementWeeklySnapshot } from "@/lib/subscription/placement-limit";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

type DailyUsageRow = {
  practiceCount: number;
  mockSkillCount: number;
  writingAiGradingCount: number;
  speakingAiGradingCount: number;
  readingAiGradingCount: number;
  listeningAiGradingCount: number;
  useOfEnglishAiGradingCount: number;
};

const AI_COUNT_FIELDS: Record<AiGradingSkill, keyof DailyUsageRow> = {
  writing: "writingAiGradingCount",
  speaking: "speakingAiGradingCount",
  reading: "readingAiGradingCount",
  listening: "listeningAiGradingCount",
  useOfEnglish: "useOfEnglishAiGradingCount",
};

export function getTotalAiGradingCount(usage: DailyUsageRow): number {
  return (
    usage.writingAiGradingCount +
    usage.speakingAiGradingCount +
    usage.readingAiGradingCount +
    usage.listeningAiGradingCount +
    usage.useOfEnglishAiGradingCount
  );
}

export async function getActiveSubscription(userId: string) {
  const now = new Date();
  return db.userSubscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserPlanId(userId: string): Promise<PlanId> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return "FREE";
  if (sub.plan === "FREE") return "FREE";
  return sub.plan;
}

export async function getUserPlanLimits(userId: string) {
  const planId = await getUserPlanId(userId);
  return getPlan(planId).limits;
}

export async function getOrCreateDailyUsage(userId: string) {
  const date = startOfToday();
  return db.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date },
    update: {},
  });
}

export async function getDailyUsageSnapshot(userId: string) {
  const [usage, planId, placement] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanId(userId),
    getPlacementWeeklySnapshot(userId),
  ]);
  const plan = getPlan(planId);
  const limits = plan.limits;
  const aiGradingCount = getTotalAiGradingCount(usage);

  return {
    planId,
    planName: plan.name,
    practiceCount: usage.practiceCount,
    practiceLimit: limits.dailyPracticeQuestions,
    placementCount: placement.used,
    placementLimit: placement.limit,
    placementRemaining: placement.remaining,
    aiGradingCount,
    aiGradingLimit: limits.dailyAiGrading,
    mockSkillCount: usage.mockSkillCount,
    mockTestLimit: limits.dailyMockTests,
    allowFullMock: limits.allowFullMock,
    writingAiGradingCount: usage.writingAiGradingCount,
    speakingAiGradingCount: usage.speakingAiGradingCount,
    readingAiGradingCount: usage.readingAiGradingCount,
    listeningAiGradingCount: usage.listeningAiGradingCount,
    useOfEnglishAiGradingCount: usage.useOfEnglishAiGradingCount,
    writingWordLimitPolicy: WRITING_WORD_LIMIT_POLICY_LABEL,
    speakingWordLimit: limits.speakingWordLimit,
  };
}

export async function canUsePractice(userId: string, additional = 1): Promise<boolean> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  if (isUnlimitedQuota(limits.dailyPracticeQuestions)) return true;
  return usage.practiceCount + additional <= limits.dailyPracticeQuestions;
}

export async function recordPracticeUsage(userId: string, count = 1) {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  const unlimited = isUnlimitedQuota(limits.dailyPracticeQuestions);
  if (!unlimited) {
    const allowed = usage.practiceCount + count <= limits.dailyPracticeQuestions;
    if (!allowed) {
      return {
        ok: false as const,
        error: formatPracticeQuotaExceededMessage(),
      };
    }
  }

  const date = startOfToday();
  await db.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, practiceCount: count },
    update: { practiceCount: { increment: count } },
  });

  return { ok: true as const };
}

export async function canUseMockTest(userId: string): Promise<boolean> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  if (isUnlimitedQuota(limits.dailyMockTests)) return true;
  return usage.mockSkillCount < limits.dailyMockTests;
}

/** @deprecated use canUseMockTest */
export const canUseSkillMock = canUseMockTest;

export async function recordMockTestUsage(userId: string) {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  if (!isUnlimitedQuota(limits.dailyMockTests) && usage.mockSkillCount >= limits.dailyMockTests) {
    const { formatMockTestQuotaExceededMessage } = await import("@/lib/subscription/quota-messages");
    return {
      ok: false as const,
      error: formatMockTestQuotaExceededMessage(),
    };
  }

  const date = startOfToday();
  await db.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, mockSkillCount: 1 },
    update: { mockSkillCount: { increment: 1 } },
  });

  return { ok: true as const };
}

/** @deprecated use recordMockTestUsage */
export const recordSkillMockUsage = recordMockTestUsage;

export async function canUseAiGrading(userId: string, _skill: AiGradingSkill): Promise<boolean> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return getTotalAiGradingCount(usage) < limits.dailyAiGrading;
}

export async function getAiGradingRemaining(userId: string, _skill: AiGradingSkill): Promise<number> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return Math.max(0, limits.dailyAiGrading - getTotalAiGradingCount(usage));
}

export async function recordAiGradingUsage(userId: string, skill: AiGradingSkill) {
  const allowed = await canUseAiGrading(userId, skill);
  if (!allowed) {
    return {
      ok: false as const,
      error: formatAiGradingQuotaExceededMessage(),
    };
  }

  const countField = AI_COUNT_FIELDS[skill];
  const date = startOfToday();
  await db.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, [countField]: 1 },
    update: { [countField]: { increment: 1 } },
  });

  return { ok: true as const };
}

export async function canUseWritingAiGrading(userId: string) {
  return canUseAiGrading(userId, "writing");
}

export async function canUseSpeakingAiGrading(userId: string) {
  return canUseAiGrading(userId, "speaking");
}

export async function getWritingAiGradingRemaining(userId: string) {
  return getAiGradingRemaining(userId, "writing");
}

export async function getSpeakingAiGradingRemaining(userId: string) {
  return getAiGradingRemaining(userId, "speaking");
}

export async function recordWritingAiGradingUsage(userId: string) {
  return recordAiGradingUsage(userId, "writing");
}

export async function recordSpeakingAiGradingUsage(userId: string) {
  return recordAiGradingUsage(userId, "speaking");
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export async function activateSubscription(
  userId: string,
  plan: SubscriptionPlan,
  billingCycle: BillingCycle
) {
  const now = new Date();
  const expiresAt =
    billingCycle === "YEARLY" ? addMonths(now, 12) : addMonths(now, 1);

  await db.userSubscription.updateMany({
    where: { userId, status: SubscriptionStatus.ACTIVE },
    data: { status: SubscriptionStatus.EXPIRED },
  });

  return db.userSubscription.create({
    data: {
      userId,
      plan,
      billingCycle,
      status: SubscriptionStatus.ACTIVE,
      startsAt: now,
      expiresAt,
    },
  });
}

export async function getSubscriptionSummary(userId: string) {
  const sub = await getActiveSubscription(userId);
  const planId = sub?.plan ?? "FREE";
  const plan = getPlan(planId);
  const usage = await getDailyUsageSnapshot(userId);

  return {
    subscription: sub,
    plan,
    usage,
    expiresAt: sub?.expiresAt ?? null,
    billingCycle: sub?.billingCycle ?? null,
  };
}
