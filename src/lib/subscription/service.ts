import { BillingCycle, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getPlan, type PlanId } from "@/lib/subscription/plans";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
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
  return {
    planId,
    planName: plan.name,
    practiceCount: usage.practiceCount,
    practiceLimit: plan.limits.dailyPracticeQuestions,
    writingAiGradingCount: usage.writingAiGradingCount,
    writingAiGradingLimit: plan.limits.dailyWritingAiGrading,
    speakingAiGradingCount: usage.speakingAiGradingCount,
    speakingAiGradingLimit: plan.limits.dailySpeakingAiGrading,
    writingWordLimit: plan.limits.writingWordLimit,
    speakingWordLimit: plan.limits.speakingWordLimit,
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

export async function canUseWritingAiGrading(userId: string): Promise<boolean> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return usage.writingAiGradingCount < limits.dailyWritingAiGrading;
}

export async function canUseSpeakingAiGrading(userId: string): Promise<boolean> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return usage.speakingAiGradingCount < limits.dailySpeakingAiGrading;
}

export async function getWritingAiGradingRemaining(userId: string): Promise<number> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return Math.max(0, limits.dailyWritingAiGrading - usage.writingAiGradingCount);
}

export async function getSpeakingAiGradingRemaining(userId: string): Promise<number> {
  const [usage, limits] = await Promise.all([
    getOrCreateDailyUsage(userId),
    getUserPlanLimits(userId),
  ]);
  return Math.max(0, limits.dailySpeakingAiGrading - usage.speakingAiGradingCount);
}

export async function recordWritingAiGradingUsage(userId: string) {
  const allowed = await canUseWritingAiGrading(userId);
  if (!allowed) {
    const limits = await getUserPlanLimits(userId);
    return {
      ok: false as const,
      error: `Đã hết ${limits.dailyWritingAiGrading} lượt AI chấm Writing hôm nay. Nâng cấp gói để tiếp tục.`,
    };
  }

  const date = startOfToday();
  await db.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, writingAiGradingCount: 1 },
    update: { writingAiGradingCount: { increment: 1 } },
  });

  return { ok: true as const };
}

export async function recordSpeakingAiGradingUsage(userId: string) {
  const allowed = await canUseSpeakingAiGrading(userId);
  if (!allowed) {
    const limits = await getUserPlanLimits(userId);
    return {
      ok: false as const,
      error: `Đã hết ${limits.dailySpeakingAiGrading} lượt AI chấm Speaking hôm nay. Nâng cấp gói để tiếp tục.`,
    };
  }

  const date = startOfToday();
  await db.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, speakingAiGradingCount: 1 },
    update: { speakingAiGradingCount: { increment: 1 } },
  });

  return { ok: true as const };
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
