import { ExamLevel, PaperKind, Skill } from "@prisma/client";
import { auth } from "@/auth";
import { formatExamLevel } from "@/lib/constants";
import { getPublishedPapersByLevel } from "@/lib/exam/cached-papers";
import { getCompletedPaperIdsForUser } from "@/lib/exam/user-paper-progress";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { getDailyUsageSnapshot } from "@/lib/subscription/service";
import { isUnlimitedQuota } from "@/lib/subscription/plans";
import {
  YLE_ORBIT_NODES,
  yleLevelLabel,
  yleSkillPath,
  type YleLevel,
} from "@/lib/yle/constants";
import { getYleLevelLeaderboard } from "@/lib/yle/leaderboard";
import { getYleUserProgress } from "@/lib/yle/progress";
import { suggestYleContinue } from "@/lib/yle/practice-path";
import type { YleSkillNodeData } from "@/lib/yle/types";

export async function loadYleLevelHub(level: YleLevel) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const examLevel = level as ExamLevel;
  const theme = LEVEL_THEMES[level]!;
  const userId = session.user.id;

  const [progress, leaderboard, papers, completedPaperIds, usage] = await Promise.all([
    getYleUserProgress(userId, level),
    getYleLevelLeaderboard(level, 10),
    getPublishedPapersByLevel(examLevel),
    getCompletedPaperIdsForUser(userId, examLevel),
    getDailyUsageSnapshot(userId),
  ]);

  const mockTestUsedUp =
    !isUnlimitedQuota(usage.mockTestLimit) && usage.mockSkillCount >= usage.mockTestLimit;

  const nodes: YleSkillNodeData[] = YLE_ORBIT_NODES.map((def) => {
    const skillProgress = progress.stats.skillProgress[def.id] ?? {
      completed: 0,
      total: 0,
      pct: 0,
    };

    const locked = def.id === "MOCK" && mockTestUsedUp;

    return {
      id: def.id,
      label: def.label,
      emoji: def.emoji,
      href: yleSkillPath(level, def.id),
      progressPct: skillProgress.pct,
      completed: skillProgress.completed,
      total: skillProgress.total,
      locked,
    };
  });

  return {
    userId,
    level,
    levelLabel: yleLevelLabel(level),
    formatLabel: formatExamLevel(level),
    theme,
    progress,
    leaderboard,
    nodes,
    continueSuggestion: suggestYleContinue(level, nodes),
    usage,
    papers,
    completedPaperIds,
    mockTestUsedUp,
  };
}

export async function loadYleSkillPage(level: YleLevel, nodeId: (typeof YLE_ORBIT_NODES)[number]["id"]) {
  const hub = await loadYleLevelHub(level);
  if (!hub) return null;

  const examLevel = level as ExamLevel;
  const nodeDef = YLE_ORBIT_NODES.find((n) => n.id === nodeId);
  if (!nodeDef) return null;

  const { papers, completedPaperIds, mockTestUsedUp } = hub;

  if (nodeId === "MOCK") {
    const fullMocks = papers.filter((p) => p.paperKind === PaperKind.MOCK_FULL);
    return {
      ...hub,
      nodeId,
      nodeDef,
      fullMocks,
      skillPapers: [],
    };
  }

  const skill = nodeDef.skill as Skill;
  const skillPapers = papers.filter(
    (p) =>
      p.skill === skill &&
      p.paperKind !== PaperKind.MOCK_FULL &&
      p.paperKind !== PaperKind.PLACEMENT
  );

  return {
    ...hub,
    nodeId,
    nodeDef,
    skill,
    skillPapers,
    fullMocks: [],
  };
}
