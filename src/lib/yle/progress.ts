import { AttemptStatus, ExamLevel, PaperKind, type Skill } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getPublishedPapersByLevel } from "@/lib/exam/cached-papers";
import { getCompletedPaperIdsForUser } from "@/lib/exam/user-paper-progress";
import { YLE_ORBIT_NODES, type YleLevel } from "@/lib/yle/constants";
import { computeYleMascotRank, type YleMascotRankProgress } from "@/lib/yle/mascot-ranks";

export interface YleSkillProgress {
  completed: number;
  total: number;
  pct: number;
}

export interface YleLevelStats {
  practiceCompleted: number;
  mockCompleted: number;
  totalPapers: number;
  completedPapers: number;
  completionPct: number;
  avgScorePct: number;
  skillProgress: Record<string, YleSkillProgress>;
  ylePoints: number;
}

export interface YleUserProgress {
  stats: YleLevelStats;
  mascotRank: YleMascotRankProgress;
}

function isMockPaper(paperKind: PaperKind, isMockTest: boolean): boolean {
  return (
    paperKind === PaperKind.MOCK_FULL ||
    paperKind === PaperKind.MOCK_SKILL ||
    isMockTest
  );
}

function skillKeyForPaper(skill: Skill | null, paperKind: PaperKind): string {
  if (paperKind === PaperKind.MOCK_FULL) return "MOCK";
  return skill ?? "MOCK";
}

async function fetchYleLevelStats(userId: string, level: YleLevel): Promise<YleLevelStats> {
  const examLevel = level as ExamLevel;

  const [papers, completedIds, attemptAgg] = await Promise.all([
    getPublishedPapersByLevel(examLevel),
    getCompletedPaperIdsForUser(userId, examLevel),
    db.attempt.findMany({
      where: {
        userId,
        status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
        submittedAt: { not: null },
        paper: { level: examLevel, paperKind: { not: PaperKind.PLACEMENT } },
      },
      select: {
        score: true,
        maxScore: true,
        paper: { select: { paperKind: true, isMockTest: true, skill: true } },
      },
    }),
  ]);

  const countable = papers.filter((p) => p.paperKind !== PaperKind.PLACEMENT);
  const totalPapers = countable.length;
  const completedPapers = countable.filter((p) => completedIds.has(p.id)).length;
  const completionPct =
    totalPapers > 0 ? Math.round((completedPapers / totalPapers) * 100) : 0;

  let practiceCompleted = 0;
  let mockCompleted = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  for (const a of attemptAgg) {
    if (isMockPaper(a.paper.paperKind, a.paper.isMockTest)) {
      mockCompleted += 1;
    } else if (a.paper.paperKind === PaperKind.PRACTICE) {
      practiceCompleted += 1;
    }

    if (a.score !== null && a.maxScore && a.maxScore > 0) {
      scoreSum += (a.score / a.maxScore) * 100;
      scoreCount += 1;
    }
  }

  const avgScorePct = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

  const skillTotals = new Map<string, { completed: number; total: number }>();
  for (const node of YLE_ORBIT_NODES) {
    skillTotals.set(node.id, { completed: 0, total: 0 });
  }

  for (const p of countable) {
    const key = skillKeyForPaper(p.skill, p.paperKind);
    const bucket = skillTotals.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (completedIds.has(p.id)) bucket.completed += 1;
  }

  const skillProgress: Record<string, YleSkillProgress> = {};
  for (const [key, { completed, total }] of skillTotals) {
    skillProgress[key] = {
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  const ylePoints =
    practiceCompleted * 10 +
    mockCompleted * 50 +
    Math.round(completionPct * 2) +
    Math.round(avgScorePct * 0.3);

  return {
    practiceCompleted,
    mockCompleted,
    totalPapers,
    completedPapers,
    completionPct,
    avgScorePct,
    skillProgress,
    ylePoints,
  };
}

export async function getYleUserProgress(
  userId: string,
  level: YleLevel
): Promise<YleUserProgress> {
  const stats = await unstable_cache(
    () => fetchYleLevelStats(userId, level),
    [`yle-progress-${userId}-${level}`],
    { revalidate: 120, tags: [`user-progress-${userId}`, `yle-${level}`] }
  )();

  const mascotRank = computeYleMascotRank(
    stats.practiceCompleted,
    stats.mockCompleted,
    stats.completionPct
  );

  return { stats, mascotRank };
}
