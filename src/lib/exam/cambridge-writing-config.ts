import { ExamLevel, Skill } from "@prisma/client";
import type { PaperSection } from "@/lib/exam/paper-sections";
import { isIeltsWritingPaper } from "@/lib/exam/ielts-writing-config";

export type CambridgeWritingPart = 1 | 2;

export const CAMBRIDGE_WRITING_LEVELS: ExamLevel[] = [
  "STARTERS",
  "MOVERS",
  "FLYERS",
  "KET",
  "PET",
  "FCE",
];

export const YLE_WRITING_LEVELS = new Set<ExamLevel>(["STARTERS", "MOVERS", "FLYERS"]);

export type CambridgeWritingPartDef = {
  part: CambridgeWritingPart;
  label: string;
  shortLabel: string;
  description: string;
  practiceQuestionCount: number;
  mockQuestionCount: number;
  practiceTimeLimitSeconds: number;
  mockTimeLimitSeconds: number;
};

const YLE_PART_DEF: CambridgeWritingPartDef = {
  part: 1,
  label: "Part 1 — Short writing",
  shortLabel: "Part 1",
  description: "Viết câu ngắn hoặc đoạn văn đơn giản",
  practiceQuestionCount: 1,
  mockQuestionCount: 1,
  practiceTimeLimitSeconds: 600,
  mockTimeLimitSeconds: 600,
};

const STANDARD_PART_DEFS: Record<CambridgeWritingPart, CambridgeWritingPartDef> = {
  1: {
    part: 1,
    label: "Part 1 — Short task",
    shortLabel: "Part 1",
    description: "Email, tin nhắn hoặc bài viết ngắn theo format thi",
    practiceQuestionCount: 1,
    mockQuestionCount: 1,
    practiceTimeLimitSeconds: 900,
    mockTimeLimitSeconds: 900,
  },
  2: {
    part: 2,
    label: "Part 2 — Extended writing",
    shortLabel: "Part 2",
    description: "Bài viết dài hơn: essay, article hoặc story",
    practiceQuestionCount: 1,
    mockQuestionCount: 1,
    practiceTimeLimitSeconds: 1200,
    mockTimeLimitSeconds: 1200,
  },
};

export function isYleWritingLevel(level: ExamLevel): boolean {
  return YLE_WRITING_LEVELS.has(level);
}

export function getCambridgeWritingParts(level: ExamLevel): CambridgeWritingPart[] {
  return isYleWritingLevel(level) ? [1] : [1, 2];
}

export function getCambridgeWritingPartDef(
  level: ExamLevel,
  part: CambridgeWritingPart
): CambridgeWritingPartDef {
  if (isYleWritingLevel(level)) {
    if (part !== 1) throw new Error(`YLE ${level} chỉ có Part 1 Writing`);
    return YLE_PART_DEF;
  }
  return STANDARD_PART_DEFS[part];
}

export function buildCambridgeWritingPracticePoolKey(
  level: ExamLevel,
  part: CambridgeWritingPart
): string {
  return `${level}:WRT:P${part}`;
}

export function buildCambridgeWritingMockPoolKey(level: ExamLevel): string {
  return `${level}:WRT:MOCK`;
}

export function isCambridgeWritingPracticePoolKey(key: string): boolean {
  return /^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):WRT:P[12]$/.test(key);
}

export function parseCambridgeWritingPracticePoolKey(
  key: string
): { level: ExamLevel; part: CambridgeWritingPart } | null {
  const match = key.match(/^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):WRT:P([12])$/);
  if (!match) return null;
  const level = match[1] as ExamLevel;
  const part = Number(match[2]) as CambridgeWritingPart;
  if (!getCambridgeWritingParts(level).includes(part)) return null;
  return { level, part };
}

export function isCambridgeWritingMockPoolKey(key: string): boolean {
  return /^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):WRT:MOCK$/.test(key);
}

export function parseCambridgeWritingMockPoolKey(key: string): ExamLevel | null {
  const match = key.match(/^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):WRT:MOCK$/);
  return match ? (match[1] as ExamLevel) : null;
}

export function isCambridgeWritingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  const key = paper.practicePoolKey ?? paper.mockPoolKey;
  if (!key) return false;
  return isCambridgeWritingPracticePoolKey(key) || isCambridgeWritingMockPoolKey(key);
}

export function getCambridgeLevelFromWritingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
  level?: ExamLevel;
}): ExamLevel | null {
  const key = paper.practicePoolKey ?? paper.mockPoolKey;
  if (!key) return paper.level ?? null;
  const practice = parseCambridgeWritingPracticePoolKey(key);
  if (practice) return practice.level;
  return parseCambridgeWritingMockPoolKey(key);
}

export function buildCambridgeWritingMockSections(level: ExamLevel): PaperSection[] {
  const parts = getCambridgeWritingParts(level);
  let start = 0;
  const sections: PaperSection[] = [];

  for (const part of parts) {
    const def = getCambridgeWritingPartDef(level, part);
    sections.push({
      skill: Skill.WRITING,
      label: def.label,
      startIndex: start,
      endIndex: start + def.mockQuestionCount,
      timeLimit: def.mockTimeLimitSeconds,
    });
    start += def.mockQuestionCount;
  }

  return sections;
}

export function buildCambridgeWritingMockTimeLimit(level: ExamLevel): number {
  return getCambridgeWritingParts(level).reduce(
    (sum, part) => sum + getCambridgeWritingPartDef(level, part).mockTimeLimitSeconds,
    0
  );
}

export function getCambridgeWritingMockQuestionCount(level: ExamLevel): number {
  return getCambridgeWritingParts(level).reduce(
    (sum, part) => sum + getCambridgeWritingPartDef(level, part).mockQuestionCount,
    0
  );
}

export function isLegacyCambridgeWritingPoolKey(key: string | null | undefined): boolean {
  if (!key) return false;
  if (key.startsWith("SKILL:") && key.endsWith(":WRITING")) return true;
  const parsed = key.match(/^(STARTERS|MOVERS|FLYERS|KET|PET|FCE):WRITING$/);
  return !!parsed;
}

export function isDedicatedWritingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  return isIeltsWritingPaper(paper) || isCambridgeWritingPaper(paper);
}
