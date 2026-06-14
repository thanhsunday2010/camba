import { BillingCycle, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  AI_SKILL_LABELS,
  getPlan,
  type AiGradingSkill,
  type PlanId,
} from "@/lib/subscription/plans";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

type DailyUsageRow = {
  practiceCount: number;
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

const AI_LIMIT_FIELDS: Record<AiGradingSkill, keyof ReturnType<typeof getPlan>["limits"]> = {
  writing: "dailyWritingAiGrading",
  speaking: "dailySpeakingAiGrading",
  reading: "dailyReadingAiGrading",
  listening: "dailyListeningAiGrading",
  useOfEnglish: "dailyUseOfEnglishAiGrading",
};

function getAiCount(usage: DailyUsageRow, skill: AiGradingSkill): number {
  return usage[AI_COUNT_FIELDS[skill]];
}

function getAiLimit(limits: ReturnType<typeof getPlan>["limits"], skill: AiGradingSkill): number {
  return limits[AI_LIMIT_FIELDS[skill]] as number;
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
  const [usage, planId] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanId(userId),
  ]);
  const plan = getPlan(planId);
  const limits = plan.limits;

  return {
    planId,
    planName: plan.name,
    practiceCount: usage.practiceCount,
    practiceLimit: limits.dailyPracticeQuestions,
    writingAiGradingCount: usage.writingAiGradingCount,
    writingAiGradingLimit: limits.dailyWritingAiGrading,
    speakingAiGradingCount: usage.speakingAiGradingCount,
    speakingAiGradingLimit: limits.dailySpeakingAiGrading,
    readingAiGradingCount: usage.readingAiGradingCount,
    readingAiGradingLimit: limits.dailyReadingAiGrading,
    listeningAiGradingCount: usage.listeningAiGradingCount,
    listeningAiGradingLimit: limits.dailyListeningAiGrading,
    useOfEnglishAiGradingCount: usage.useOfEnglishAiGradingCount,
    useOfEnglishAiGradingLimit: limits.dailyUseOfEnglishAiGrading,
    writingWordLimit: limits.writingWordLimit,
    speakingWordLimit: limits.speakingWordLimit,
  };
}

export async function canUsePractice(userId: string, additional = 1): Promise<boolean> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return usage.practiceCount + additional <= limits.dailyPracticeQuestions;
}

export async function recordPracticeUsage(userId: string, count = 1) {
  const allowed = await canUsePractice(userId, count);
  if (!allowed) {
    const limits = await getUserPlanLimits(userId);
    return {
      ok: false as const,
      error: `Đã hết ${limits.dailyPracticeQuestions} câu luyện tập hôm nay. Nâng cấp gói để tiếp tục.`,
    };
  }

  const date = startOfToday();
  await db.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, practiceCount: count },
    update: { practiceCount: { increment: count } },
  });

  return { ok: true as const };
}

export async function canUseAiGrading(userId: string, skill: AiGradingSkill): Promise<boolean> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return getAiCount(usage, skill) < getAiLimit(limits, skill);
}

export async function getAiGradingRemaining(userId: string, skill: AiGradingSkill): Promise<number> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return Math.max(0, getAiLimit(limits, skill) - getAiCount(usage, skill));
}

export async function recordAiGradingUsage(userId: string, skill: AiGradingSkill) {
  const allowed = await canUseAiGrading(userId, skill);
  if (!allowed) {
    const limits = await getUserPlanLimits(userId);
    const limit = getAiLimit(limits, skill);
    return {
      ok: false as const,
      error: `Đã hết ${limit} lượt AI ${AI_SKILL_LABELS[skill]} hôm nay. Nâng cấp gói để tiếp tục.`,
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
