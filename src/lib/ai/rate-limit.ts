import { db } from "@/lib/db";
import { canUseAiGrading, getAiGradingRemaining } from "@/lib/subscription/service";

export async function checkAIRateLimit(userId: string): Promise<boolean> {
  return canUseAiGrading(userId);
}

export async function getAIRateLimitInfo(userId: string) {
  const remaining = await getAiGradingRemaining(userId);
  const { getUserPlanLimits } = await import("@/lib/subscription/service");
  const limits = await getUserPlanLimits(userId);
  return {
    remaining,
    limit: limits.dailyAiGrading,
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
