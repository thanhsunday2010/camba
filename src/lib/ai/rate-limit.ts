import { db } from "@/lib/db";
import { AI_DAILY_LIMIT } from "@/lib/ai/schemas";

export async function checkAIRateLimit(userId: string): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await db.aIFeedback.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  });

  return count < AI_DAILY_LIMIT;
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
