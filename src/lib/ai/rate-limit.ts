import { db } from "@/lib/db";
import {
  canUseWritingAiGrading,
  canUseSpeakingAiGrading,
  getWritingAiGradingRemaining,
  getSpeakingAiGradingRemaining,
  getUserPlanLimits,
} from "@/lib/subscription/service";

export async function checkWritingAIRateLimit(userId: string): Promise<boolean> {
  return canUseWritingAiGrading(userId);
}

export async function checkSpeakingAIRateLimit(userId: string): Promise<boolean> {
  return canUseSpeakingAiGrading(userId);
}

export async function getWritingAIRateLimitInfo(userId: string) {
  const remaining = await getWritingAiGradingRemaining(userId);
  const limits = await getUserPlanLimits(userId);
  return {
    remaining,
    limit: limits.dailyWritingAiGrading,
  };
}

export async function getSpeakingAIRateLimitInfo(userId: string) {
  const remaining = await getSpeakingAiGradingRemaining(userId);
  const limits = await getUserPlanLimits(userId);
  return {
    remaining,
    limit: limits.dailySpeakingAiGrading,
  };
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
