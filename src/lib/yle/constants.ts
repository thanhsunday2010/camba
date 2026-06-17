import type { ExamLevelValue } from "@/lib/constants";

export const YLE_LEVELS = ["STARTERS", "MOVERS", "FLYERS"] as const;
export type YleLevel = (typeof YLE_LEVELS)[number];

export function isYleLevel(level: string): level is YleLevel {
  return (YLE_LEVELS as readonly string[]).includes(level);
}

export const YLE_ORBIT_NODES = [
  { id: "READING", label: "Reading", emoji: "📖", skill: "READING" as const },
  { id: "LISTENING", label: "Listening", emoji: "🎧", skill: "LISTENING" as const },
  { id: "USE_OF_ENGLISH", label: "Grammar", emoji: "📝", skill: "USE_OF_ENGLISH" as const },
  { id: "SPEAKING", label: "Speaking", emoji: "🎤", skill: "SPEAKING" as const },
  { id: "WRITING", label: "Writing", emoji: "✏️", skill: "WRITING" as const },
  { id: "MOCK", label: "Mock", emoji: "🏆", skill: null },
] as const;

export type YleOrbitNodeId = (typeof YLE_ORBIT_NODES)[number]["id"];

/** Recommended daily practice order for continuous engagement */
export const YLE_PRACTICE_ORDER: YleOrbitNodeId[] = [
  "READING",
  "LISTENING",
  "USE_OF_ENGLISH",
  "SPEAKING",
  "WRITING",
  "MOCK",
];

export function yleLevelLabel(level: YleLevel): string {
  const labels: Record<YleLevel, string> = {
    STARTERS: "Pre A1 Starters",
    MOVERS: "A1 Movers",
    FLYERS: "A2 Flyers",
  };
  return labels[level];
}

const NODE_SLUGS: Record<YleOrbitNodeId, string> = {
  READING: "reading",
  LISTENING: "listening",
  USE_OF_ENGLISH: "grammar",
  SPEAKING: "speaking",
  WRITING: "writing",
  MOCK: "mock",
};

export function yleSkillPath(level: YleLevel, nodeId: YleOrbitNodeId): string {
  return `/yle/${level}/${NODE_SLUGS[nodeId]}`;
}

export function parseYleSkillSlug(slug: string): YleOrbitNodeId | null {
  const map: Record<string, YleOrbitNodeId> = {
    reading: "READING",
    listening: "LISTENING",
    grammar: "USE_OF_ENGLISH",
    "use-of-english": "USE_OF_ENGLISH",
    speaking: "SPEAKING",
    writing: "WRITING",
    mock: "MOCK",
  };
  return map[slug] ?? null;
}

export function asYleLevel(level: ExamLevelValue | string): YleLevel | null {
  return isYleLevel(level) ? level : null;
}
