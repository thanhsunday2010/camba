import { AttemptStatus, ExamLevel, PaperKind } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getPublishedPapersByLevel } from "@/lib/exam/cached-papers";
import { getLevelForXp } from "@/lib/gamification/definitions";
import type { YleLevel } from "@/lib/yle/constants";

export interface YleLeaderboardEntry {
  userId: string;
  name: string | null;
  ylePoints: number;
  practiceCount: number;
  mockCount: number;
  completionPct: number;
  level: ReturnType<typeof getLevelForXp>;
  activeTitle: string | null;
  rank: number;
}

function isMockPaper(paperKind: PaperKind, isMockTest: boolean): boolean {
  return (
    paperKind === PaperKind.MOCK_FULL ||
    paperKind === PaperKind.MOCK_SKILL ||
    isMockTest
  );
}

async function buildYleLeaderboard(level: YleLevel, limit: number): Promise<YleLeaderboardEntry[]> {
  const examLevel = level as ExamLevel;
  const papers = (await getPublishedPapersByLevel(examLevel)).filter(
    (p) => p.paperKind !== PaperKind.PLACEMENT
  );
  const totalPapers = papers.length;

  const attempts = await db.attempt.findMany({
    where: {
      userId: { not: null },
      status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
      submittedAt: { not: null },
      paper: { level: examLevel, paperKind: { not: PaperKind.PLACEMENT } },
      user: { role: "STUDENT" },
    },
    select: {
      userId: true,
      score: true,
      maxScore: true,
      paperId: true,
      paper: { select: { paperKind: true, isMockTest: true } },
      user: { select: { name: true, activeTitle: true, xp: true } },
    },
  });

  type Row = {
    name: string | null;
    activeTitle: string | null;
    xp: number;
    practiceCount: number;
    mockCount: number;
    completedPaperIds: Set<string>;
    scoreSum: number;
    scoreCount: number;
  };

  const byUser = new Map<string, Row>();

  for (const a of attempts) {
    if (!a.userId || !a.user) continue;
    let row = byUser.get(a.userId);
    if (!row) {
      row = {
        name: a.user.name,
        activeTitle: a.user.activeTitle,
        xp: a.user.xp,
        practiceCount: 0,
        mockCount: 0,
        completedPaperIds: new Set(),
        scoreSum: 0,
        scoreCount: 0,
      };
      byUser.set(a.userId, row);
    }

    row.completedPaperIds.add(a.paperId);

    if (isMockPaper(a.paper.paperKind, a.paper.isMockTest)) {
      row.mockCount += 1;
    } else if (a.paper.paperKind === PaperKind.PRACTICE) {
      row.practiceCount += 1;
    }

    if (a.score !== null && a.maxScore && a.maxScore > 0) {
      row.scoreSum += (a.score / a.maxScore) * 100;
      row.scoreCount += 1;
    }
  }

  const entries: Omit<YleLeaderboardEntry, "rank">[] = [];

  for (const [userId, row] of byUser) {
    const completedPapers = row.completedPaperIds.size;
    const completionPct =
      totalPapers > 0 ? Math.round((completedPapers / totalPapers) * 100) : 0;
    const avgScorePct =
      row.scoreCount > 0 ? Math.round(row.scoreSum / row.scoreCount) : 0;
    const ylePoints =
      row.practiceCount * 10 +
      row.mockCount * 50 +
      Math.round(completionPct * 2) +
      Math.round(avgScorePct * 0.3);

    entries.push({
      userId,
      name: row.name,
      ylePoints,
      practiceCount: row.practiceCount,
      mockCount: row.mockCount,
      completionPct,
      level: getLevelForXp(row.xp),
      activeTitle: row.activeTitle,
    });
  }

  entries.sort((a, b) => b.ylePoints - a.ylePoints || b.mockCount - a.mockCount);

  return entries.slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function getYleLevelLeaderboard(
  level: YleLevel,
  limit = 10
): Promise<YleLeaderboardEntry[]> {
  return unstable_cache(
    () => buildYleLeaderboard(level, limit),
    [`yle-leaderboard-${level}-${limit}`],
    { revalidate: 180, tags: [`yle-leaderboard-${level}`] }
  )();
}
