import { AttemptStatus, PaperKind, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  ACHIEVEMENTS,
  getLevelForXp,
  xpProgressInLevel,
  getActiveTitleDisplay,
} from "@/lib/gamification/definitions";
import type {
  GamificationProfile,
  GamificationSnapshot,
  LeaderboardEntry,
  UnlockedAchievementSnapshot,
} from "@/lib/gamification/types";

function baseXpForAttempt(paperKind: PaperKind, isMockTest: boolean): number {
  if (paperKind === PaperKind.PLACEMENT) return 40;
  if (paperKind === PaperKind.MOCK_FULL || paperKind === PaperKind.MOCK_SKILL || isMockTest) {
    return 55;
  }
  return 25;
}

function scoreBonusXp(percent: number): number {
  if (percent >= 100) return 50;
  if (percent >= 90) return 35;
  if (percent >= 80) return 20;
  if (percent >= 60) return 10;
  return 0;
}

async function countCompletedLessons(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
      submittedAt: { not: null },
    },
  });
}

async function countMockCompleted(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
      submittedAt: { not: null },
      OR: [
        { paper: { paperKind: { in: [PaperKind.MOCK_FULL, PaperKind.MOCK_SKILL] } } },
        { paper: { isMockTest: true } },
      ],
    },
  });
}

async function countPlacementCompleted(userId: string): Promise<number> {
  return db.attempt.count({
    where: {
      userId,
      status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
      paper: { paperKind: PaperKind.PLACEMENT },
    },
  });
}

function achievementToSnapshot(key: string): UnlockedAchievementSnapshot {
  const def = ACHIEVEMENTS[key]!;
  return {
    key: def.key,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
  };
}

function evaluateAchievementKeys(
  _userId: string,
  ctx: {
    streak: number;
    xp: number;
    completedLessons: number;
    mockCount: number;
    placementCount: number;
    scorePercent: number;
    paperKind: PaperKind;
    isMockTest: boolean;
  }
): string[] {
  const keys: string[] = [];

  if (ctx.completedLessons >= 1) keys.push("first_lesson");
  if (ctx.completedLessons >= 5) keys.push("lessons_5");
  if (ctx.completedLessons >= 25) keys.push("lessons_25");
  if (ctx.completedLessons >= 100) keys.push("lessons_100");

  if (ctx.streak >= 3) keys.push("streak_3");
  if (ctx.streak >= 7) keys.push("streak_7");
  if (ctx.streak >= 30) keys.push("streak_30");

  if (ctx.scorePercent >= 60) keys.push("score_60");
  if (ctx.scorePercent >= 80) keys.push("score_80");
  if (ctx.scorePercent >= 90) keys.push("score_90");
  if (ctx.scorePercent >= 100) keys.push("perfect_100");

  if (ctx.mockCount >= 1) keys.push("mock_first");
  if (ctx.placementCount >= 1) keys.push("placement_done");

  const level = getLevelForXp(ctx.xp).level;
  if (level >= 3) keys.push("level_3");
  if (level >= 5) keys.push("level_5");

  return keys;
}

async function unlockAchievements(
  userId: string,
  candidateKeys: string[],
  activeTitle: string | null
): Promise<{ unlocked: UnlockedAchievementSnapshot[]; newActiveTitle: string | null }> {
  const existing = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementKey: true },
  });
  const existingSet = new Set(existing.map((e) => e.achievementKey));

  const unlocked: UnlockedAchievementSnapshot[] = [];
  let newActiveTitle = activeTitle;

  for (const key of candidateKeys) {
    if (existingSet.has(key) || !ACHIEVEMENTS[key]) continue;

    await db.userAchievement.create({
      data: { userId, achievementKey: key },
    });
    existingSet.add(key);
    unlocked.push(achievementToSnapshot(key));

    const def = ACHIEVEMENTS[key]!;
    if (!newActiveTitle && def.autoEquip) {
      newActiveTitle = key;
    }
  }

  if (!newActiveTitle && unlocked.length > 0) {
    newActiveTitle = unlocked[unlocked.length - 1]!.key;
  }

  return { unlocked, newActiveTitle };
}

export async function processAttemptGamification(
  attemptId: string
): Promise<GamificationSnapshot | null> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { paper: true },
  });

  if (
    !attempt?.userId ||
    attempt.gamificationProcessed ||
    attempt.status !== AttemptStatus.GRADED
  ) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: attempt.userId },
    select: { xp: true, streak: true, activeTitle: true },
  });
  if (!user) return null;

  const scorePercent =
    attempt.score !== null && attempt.maxScore && attempt.maxScore > 0
      ? Math.round((attempt.score / attempt.maxScore) * 100)
      : 0;

  const xpEarned =
    baseXpForAttempt(attempt.paper.paperKind, attempt.paper.isMockTest) +
    scoreBonusXp(scorePercent);

  const previousLevel = getLevelForXp(user.xp);
  const totalXp = user.xp + xpEarned;
  const level = getLevelForXp(totalXp);
  const levelUp = level.level > previousLevel.level;

  const [completedLessons, mockCount, placementCount] = await Promise.all([
    countCompletedLessons(attempt.userId),
    countMockCompleted(attempt.userId),
    countPlacementCompleted(attempt.userId),
  ]);

  await db.user.update({
    where: { id: attempt.userId },
    data: { xp: totalXp },
  });

  const candidateKeys = evaluateAchievementKeys(attempt.userId, {
    streak: user.streak,
    xp: totalXp,
    completedLessons,
    mockCount,
    placementCount,
    scorePercent,
    paperKind: attempt.paper.paperKind,
    isMockTest: attempt.paper.isMockTest,
  });

  const { unlocked, newActiveTitle } = await unlockAchievements(
    attempt.userId,
    candidateKeys,
    user.activeTitle
  );

  if (newActiveTitle && newActiveTitle !== user.activeTitle) {
    await db.user.update({
      where: { id: attempt.userId },
      data: { activeTitle: newActiveTitle },
    });
  }

  const snapshot: GamificationSnapshot = {
    xpEarned,
    totalXp,
    level,
    levelUp,
    previousLevel,
    scorePercent,
    unlockedAchievements: unlocked,
  };

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      gamificationProcessed: true,
      gamificationSnapshot: snapshot as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/results/${attemptId}`);

  return snapshot;
}

export async function getGamificationProfile(userId: string): Promise<GamificationProfile> {
  const [user, completedLessons, unlockedCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { xp: true, streak: true, activeTitle: true },
    }),
    countCompletedLessons(userId),
    db.userAchievement.count({ where: { userId } }),
  ]);

  const xp = user?.xp ?? 0;
  const progress = xpProgressInLevel(xp);
  const titleDef = getActiveTitleDisplay(user?.activeTitle);

  return {
    xp,
    streak: user?.streak ?? 0,
    activeTitle: user?.activeTitle ?? null,
    level: progress.current,
    nextLevel: progress.next,
    progressPct: progress.progressPct,
    xpIntoLevel: progress.xpIntoLevel,
    xpNeededForNext: progress.xpNeededForNext,
    titleDisplay: titleDef
      ? {
          key: titleDef.key,
          title: titleDef.title,
          description: titleDef.description,
          emoji: titleDef.emoji,
        }
      : null,
    unlockedCount,
    totalAchievements: Object.keys(ACHIEVEMENTS).length,
    completedLessons,
  };
}

export async function getXpLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const users = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ xp: "desc" }, { streak: "desc" }],
    take: limit,
    select: { name: true, xp: true, streak: true, activeTitle: true },
  });

  return users.map((u) => ({
    name: u.name,
    xp: u.xp,
    streak: u.streak,
    level: getLevelForXp(u.xp),
    activeTitle: u.activeTitle,
  }));
}

export async function getUserAchievements(userId: string): Promise<UnlockedAchievementSnapshot[]> {
  const rows = await db.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "asc" },
  });
  return rows
    .map((r) => ACHIEVEMENTS[r.achievementKey])
    .filter(Boolean)
    .map((def) => ({
      key: def!.key,
      title: def!.title,
      description: def!.description,
      emoji: def!.emoji,
    }));
}

export function parseGamificationSnapshot(raw: unknown): GamificationSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as GamificationSnapshot;
  if (typeof s.xpEarned !== "number" || !s.level) return null;
  return s;
}
