import { ExamLevel, Skill } from "@prisma/client";
import type { PaperSection } from "@/lib/exam/paper-sections";
import { isIeltsSpeakingPaper } from "@/lib/exam/ielts-speaking-config";

export type CambridgeSpeakingPart = 1 | 2 | 3;

export const CAMBRIDGE_SPEAKING_LEVELS: ExamLevel[] = [
  "STARTERS",
  "MOVERS",
  "FLYERS",
  "KET",
  "PET",
  "FCE",
];

export const YLE_SPEAKING_LEVELS = new Set<ExamLevel>(["STARTERS", "MOVERS", "FLYERS"]);

export type CambridgePartDef = {
  part: CambridgeSpeakingPart;
  label: string;
  shortLabel: string;
  description: string;
  practiceQuestionCount: number;
  mockQuestionCount: number;
  preparationSeconds: number;
  speakingSeconds: number;
  practiceTimeLimitSeconds: number;
  mockTimeLimitSeconds: number;
};

const YLE_PART_DEFS: Record<1 | 2, CambridgePartDef> = {
  1: {
    part: 1,
    label: "Part 1 — About you",
    shortLabel: "Part 1",
    description: "Câu hỏi ngắn về bản thân, gia đình, sở thích",
    practiceQuestionCount: 1,
    mockQuestionCount: 3,
    preparationSeconds: 10,
    speakingSeconds: 45,
    practiceTimeLimitSeconds: 45 + 60,
    mockTimeLimitSeconds: 3 * 45 + 45,
  },
  2: {
    part: 2,
    label: "Part 2 — Picture & task",
    shortLabel: "Part 2",
    description: "Mô tả tranh hoặc trả lời theo chủ đề hình ảnh",
    practiceQuestionCount: 1,
    mockQuestionCount: 2,
    preparationSeconds: 15,
    speakingSeconds: 60,
    practiceTimeLimitSeconds: 15 + 60 + 30,
    mockTimeLimitSeconds: 2 * (15 + 60) + 30,
  },
};

const STANDARD_PART_DEFS: Record<CambridgeSpeakingPart, CambridgePartDef> = {
  1: {
    part: 1,
    label: "Part 1 — Interview",
    shortLabel: "Part 1",
    description: "Câu hỏi giới thiệu và chủ đề quen thuộc",
    practiceQuestionCount: 1,
    mockQuestionCount: 4,
    preparationSeconds: 0,
    speakingSeconds: 45,
    practiceTimeLimitSeconds: 45 + 60,
    mockTimeLimitSeconds: 4 * 45 + 45,
  },
  2: {
    part: 2,
    label: "Part 2 — Long turn",
    shortLabel: "Part 2",
    description: "Nói dài theo gợi ý / mô tả tranh / thảo luận ngắn",
    practiceQuestionCount: 1,
    mockQuestionCount: 2,
    preparationSeconds: 30,
    speakingSeconds: 90,
    practiceTimeLimitSeconds: 30 + 90 + 30,
    mockTimeLimitSeconds: 2 * (30 + 90) + 30,
  },
  3: {
    part: 3,
    label: "Part 3 — Discussion",
    shortLabel: "Part 3",
    description: "Thảo luận sâu hơn về chủ đề Part 2",
    practiceQuestionCount: 1,
    mockQuestionCount: 3,
    preparationSeconds: 0,
    speakingSeconds: 60,
    practiceTimeLimitSeconds: 60 + 60,
    mockTimeLimitSeconds: 3 * 60 + 45,
  },
};

export function isYleSpeakingLevel(level: ExamLevel): boolean {
  return YLE_SPEAKING_LEVELS.has(level);
}

export function getCambridgeSpeakingParts(level: ExamLevel): CambridgeSpeakingPart[] {
  return isYleSpeakingLevel(level) ? [1, 2] : [1, 2, 3];
}

export function getCambridgePartDef(
  level: ExamLevel,
  part: CambridgeSpeakingPart
): CambridgePartDef {
  if (isYleSpeakingLevel(level)) {
    if (part === 3) throw new Error(`YLE ${level} không có Part 3`);
    return YLE_PART_DEFS[part as 1 | 2];
  }
  return STANDARD_PART_DEFS[part];
}

export function buildCambridgeSpeakingPracticePoolKey(
  level: ExamLevel,
  part: CambridgeSpeakingPart
): string {
  return `${level}:SPK:P${part}`;
}

export function buildCambridgeSpeakingMockPoolKey(level: ExamLevel): string {
  return `${level}:SPK:MOCK`;
}

export function isCambridgeSpeakingPracticePoolKey(key: string): boolean {
  return /^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):SPK:P[123]$/.test(key);
}

export function parseCambridgeSpeakingPracticePoolKey(
  key: string
): { level: ExamLevel; part: CambridgeSpeakingPart } | null {
  const match = key.match(/^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):SPK:P([123])$/);
  if (!match) return null;
  const level = match[1] as ExamLevel;
  const part = Number(match[2]) as CambridgeSpeakingPart;
  if (!getCambridgeSpeakingParts(level).includes(part)) return null;
  return { level, part };
}

export function isCambridgeSpeakingMockPoolKey(key: string): boolean {
  return /^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):SPK:MOCK$/.test(key);
}

export function parseCambridgeSpeakingMockPoolKey(key: string): ExamLevel | null {
  const match = key.match(/^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):SPK:MOCK$/);
  return match ? (match[1] as ExamLevel) : null;
}

export function isCambridgeSpeakingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  const key = paper.practicePoolKey ?? paper.mockPoolKey;
  if (!key) return false;
  return isCambridgeSpeakingPracticePoolKey(key) || isCambridgeSpeakingMockPoolKey(key);
}

export function getCambridgeLevelFromSpeakingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
  level?: ExamLevel;
}): ExamLevel | null {
  const key = paper.practicePoolKey ?? paper.mockPoolKey;
  if (!key) return paper.level ?? null;
  const practice = parseCambridgeSpeakingPracticePoolKey(key);
  if (practice) return practice.level;
  return parseCambridgeSpeakingMockPoolKey(key);
}

export function buildCambridgeSpeakingMockSections(level: ExamLevel): PaperSection[] {
  const parts = getCambridgeSpeakingParts(level);
  let start = 0;
  const sections: PaperSection[] = [];

  for (const part of parts) {
    const def = getCambridgePartDef(level, part);
    const count = def.mockQuestionCount;
    sections.push({
      skill: Skill.SPEAKING,
      label: def.label,
      startIndex: start,
      endIndex: start + count,
      timeLimit: def.mockTimeLimitSeconds,
    });
    start += count;
  }

  return sections;
}

export function buildCambridgeSpeakingMockTimeLimit(level: ExamLevel): number {
  return getCambridgeSpeakingParts(level).reduce(
    (sum, part) => sum + getCambridgePartDef(level, part).mockTimeLimitSeconds,
    0
  );
}

export function getCambridgeSpeakingMockQuestionCount(level: ExamLevel): number {
  return getCambridgeSpeakingParts(level).reduce(
    (sum, part) => sum + getCambridgePartDef(level, part).mockQuestionCount,
    0
  );
}

export function isCambridgeSpeakingQuestionContent(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const c = content as Record<string, unknown>;
  return c.examTrack === "CAMBRIDGE" && [1, 2, 3].includes(Number(c.cambridgePart));
}

export function getCambridgePartFromContent(content: unknown): CambridgeSpeakingPart | null {
  if (!isCambridgeSpeakingQuestionContent(content)) return null;
  return Number((content as Record<string, unknown>).cambridgePart) as CambridgeSpeakingPart;
}

/** Legacy pool keys replaced by part-based Cambridge Speaking hub */
export function isLegacyCambridgeSpeakingPoolKey(key: string | null | undefined): boolean {
  if (!key) return false;
  if (key.startsWith("SKILL:") && key.endsWith(":SPEAKING")) return true;
  const parsed = key.match(/^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):SPEAKING$/);
  return !!parsed;
}

export function isDedicatedSpeakingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  return isIeltsSpeakingPaper(paper) || isCambridgeSpeakingPaper(paper);
}
