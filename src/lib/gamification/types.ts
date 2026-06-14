import type { PaperKind } from "@prisma/client";
import type { GamificationLevel } from "@/lib/gamification/definitions";

export interface UnlockedAchievementSnapshot {
  key: string;
  title: string;
  description: string;
  emoji: string;
}

export interface GamificationSnapshot {
  xpEarned: number;
  totalXp: number;
  level: GamificationLevel;
  levelUp: boolean;
  previousLevel: GamificationLevel;
  scorePercent: number;
  unlockedAchievements: UnlockedAchievementSnapshot[];
}

export interface GamificationProfile {
  xp: number;
  streak: number;
  activeTitle: string | null;
  level: GamificationLevel;
  nextLevel: GamificationLevel | null;
  progressPct: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  titleDisplay: UnlockedAchievementSnapshot | null;
  unlockedCount: number;
  totalAchievements: number;
  completedLessons: number;
}

export interface LeaderboardEntry {
  name: string | null;
  xp?: number;
  streak?: number;
  level: GamificationLevel;
  activeTitle: string | null;
}
