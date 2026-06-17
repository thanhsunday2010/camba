import type { ExamLevel, PaperKind } from "@prisma/client";
import { PaperKind as PK } from "@prisma/client";
import { isYleLevel, yleSkillPath, type YleLevel, type YleOrbitNodeId } from "@/lib/yle/constants";
import { getNextYleSkillAfter } from "@/lib/yle/practice-path";

const SKILL_TO_NODE: Record<string, YleOrbitNodeId> = {
  READING: "READING",
  LISTENING: "LISTENING",
  USE_OF_ENGLISH: "USE_OF_ENGLISH",
  SPEAKING: "SPEAKING",
  WRITING: "WRITING",
};

export interface ObjectivePracticeContinueMeta {
  hubHref: string;
  retryHref: string;
  nextSkillHref: string | null;
  nextSkillLabel: string | null;
  skillLabel: string;
}

export function getObjectivePracticeContinueMeta(paper: {
  id: string;
  level: ExamLevel | string;
  skill: string;
  paperKind?: PaperKind | string;
}): ObjectivePracticeContinueMeta | null {
  const kind = paper.paperKind;
  if (kind === PK.PLACEMENT) return null;

  const level = paper.level as string;
  const isYle = isYleLevel(level);
  const nodeId = SKILL_TO_NODE[paper.skill];
  if (!nodeId) return null;

  const hubHref = isYle
    ? yleSkillPath(level as YleLevel, nodeId)
    : kind === PK.MOCK_FULL
      ? `/exams/${level}`
      : `/exams/${level}`;

  let nextSkillHref: string | null = null;
  let nextSkillLabel: string | null = null;

  if (isYle) {
    const next = getNextYleSkillAfter(level as YleLevel, nodeId);
    if (next) {
      nextSkillHref = next.href;
      nextSkillLabel = `${next.emoji} ${next.label}`;
    }
  }

  const skillLabels: Record<string, string> = {
    READING: "Reading",
    LISTENING: "Listening",
    USE_OF_ENGLISH: "Grammar",
    SPEAKING: "Speaking",
    WRITING: "Writing",
  };

  return {
    hubHref: isYle ? yleSkillPath(level as YleLevel, nodeId) : `/exams/${level}`,
    retryHref: `/practice/${paper.id}`,
    nextSkillHref,
    nextSkillLabel,
    skillLabel: skillLabels[paper.skill] ?? paper.skill,
  };
}
