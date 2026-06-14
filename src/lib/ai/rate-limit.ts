import {
  canUseAiGrading,
  getAiGradingRemaining,
  getUserPlanId,
} from "@/lib/subscription/service";
import { getAiGradingLimit, type AiGradingSkill } from "@/lib/subscription/plans";
import { db } from "@/lib/db";

export async function checkAiGradingRateLimit(
  userId: string,
  skill: AiGradingSkill
): Promise<boolean> {
  return canUseAiGrading(userId, skill);
}

export async function getAiGradingRateLimitInfo(userId: string, skill: AiGradingSkill) {
  const remaining = await getAiGradingRemaining(userId, skill);
  const planId = await getUserPlanId(userId);
  return {
    remaining,
    limit: getAiGradingLimit(planId),
    skill,
  };
}

export async function checkWritingAIRateLimit(userId: string): Promise<boolean> {
  return checkAiGradingRateLimit(userId, "writing");
}

export async function checkSpeakingAIRateLimit(userId: string): Promise<boolean> {
  return checkAiGradingRateLimit(userId, "speaking");
}

export async function checkReadingAIRateLimit(userId: string): Promise<boolean> {
  return checkAiGradingRateLimit(userId, "reading");
}

export async function checkListeningAIRateLimit(userId: string): Promise<boolean> {
  return checkAiGradingRateLimit(userId, "listening");
}

export async function getWritingAIRateLimitInfo(userId: string) {
  return getAiGradingRateLimitInfo(userId, "writing");
}

export async function getSpeakingAIRateLimitInfo(userId: string) {
  return getAiGradingRateLimitInfo(userId, "speaking");
}

export async function getReadingAIRateLimitInfo(userId: string) {
  return getAiGradingRateLimitInfo(userId, "reading");
}

export async function getListeningAIRateLimitInfo(userId: string) {
  return getAiGradingRateLimitInfo(userId, "listening");
}

export async function updateUserStreak(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const last = user.lastActiveAt;
  let streak = user.streak;

  if (!last) {
    streak = 1;
  } else {
    const diffDays = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
  }

  await db.user.update({
    where: { id: userId },
    data: { streak, lastActiveAt: now },
  });
}
