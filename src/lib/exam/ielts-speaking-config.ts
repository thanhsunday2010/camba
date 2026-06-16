import { ExamLevel, Skill } from "@prisma/client";
import type { PaperSection } from "@/lib/exam/paper-sections";

export type IeltsSpeakingPart = 1 | 2 | 3;

/** Proxy level trong schema — câu hỏi IELTS Speaking dùng FCE + examTrack trong content */
export const IELTS_SPEAKING_LEVEL: ExamLevel = "FCE";

export const IELTS_SPEAKING_MOCK_POOL_KEY = "IELTS:SPK:MOCK";

export function buildIeltsSpeakingPracticePoolKey(part: IeltsSpeakingPart): string {
  return `IELTS:SPK:P${part}`;
}

export function isIeltsSpeakingPracticePoolKey(key: string): boolean {
  return /^IELTS:SPK:P[123]$/.test(key);
}

export function parseIeltsSpeakingPracticePoolKey(key: string): IeltsSpeakingPart | null {
  const match = key.match(/^IELTS:SPK:P([123])$/);
  if (!match) return null;
  return Number(match[1]) as IeltsSpeakingPart;
}

export function isIeltsSpeakingMockPoolKey(key: string): boolean {
  return key === IELTS_SPEAKING_MOCK_POOL_KEY;
}

export function isIeltsSpeakingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  const key = paper.practicePoolKey ?? paper.mockPoolKey;
  if (!key) return false;
  return isIeltsSpeakingPracticePoolKey(key) || isIeltsSpeakingMockPoolKey(key);
}

export const IELTS_SPEAKING_PART_DEFS: Record<
  IeltsSpeakingPart,
  {
    part: IeltsSpeakingPart;
    label: string;
    shortLabel: string;
    description: string;
    practiceQuestionCount: number;
    mockQuestionCount: number;
    preparationSeconds: number;
    speakingSeconds: number;
    practiceTimeLimitSeconds: number;
    mockTimeLimitSeconds: number;
  }
> = {
  1: {
    part: 1,
    label: "Part 1 — Introduction & Interview",
    shortLabel: "Part 1",
    description: "8 câu hỏi ngắn về chủ đề quen thuộc (~4–5 phút)",
    practiceQuestionCount: 1,
    mockQuestionCount: 8,
    preparationSeconds: 0,
    speakingSeconds: 45,
    practiceTimeLimitSeconds: 45 + 60,
    mockTimeLimitSeconds: 8 * 45 + 60,
  },
  2: {
    part: 2,
    label: "Part 2 — Long turn (Cue card)",
    shortLabel: "Part 2",
    description: "1 cue card — 1 phút chuẩn bị, nói 1–2 phút",
    practiceQuestionCount: 1,
    mockQuestionCount: 1,
    preparationSeconds: 60,
    speakingSeconds: 120,
    practiceTimeLimitSeconds: 60 + 120 + 30,
    mockTimeLimitSeconds: 60 + 120 + 30,
  },
  3: {
    part: 3,
    label: "Part 3 — Two-way discussion",
    shortLabel: "Part 3",
    description: "5 câu thảo luận sâu hơn (~4–5 phút)",
    practiceQuestionCount: 1,
    mockQuestionCount: 5,
    preparationSeconds: 0,
    speakingSeconds: 90,
    practiceTimeLimitSeconds: 90 + 60,
    mockTimeLimitSeconds: 5 * 90 + 60,
  },
};

export const IELTS_SPEAKING_PARTS: IeltsSpeakingPart[] = [1, 2, 3];

export function buildIeltsSpeakingMockSections(): PaperSection[] {
  const p1 = IELTS_SPEAKING_PART_DEFS[1].mockQuestionCount;
  const p2 = IELTS_SPEAKING_PART_DEFS[2].mockQuestionCount;
  const p3 = IELTS_SPEAKING_PART_DEFS[3].mockQuestionCount;

  return [
    {
      skill: Skill.SPEAKING,
      label: IELTS_SPEAKING_PART_DEFS[1].label,
      startIndex: 0,
      endIndex: p1,
      timeLimit: IELTS_SPEAKING_PART_DEFS[1].mockTimeLimitSeconds,
    },
    {
      skill: Skill.SPEAKING,
      label: IELTS_SPEAKING_PART_DEFS[2].label,
      startIndex: p1,
      endIndex: p1 + p2,
      timeLimit: IELTS_SPEAKING_PART_DEFS[2].mockTimeLimitSeconds,
    },
    {
      skill: Skill.SPEAKING,
      label: IELTS_SPEAKING_PART_DEFS[3].label,
      startIndex: p1 + p2,
      endIndex: p1 + p2 + p3,
      timeLimit: IELTS_SPEAKING_PART_DEFS[3].mockTimeLimitSeconds,
    },
  ];
}

export function buildIeltsSpeakingMockTimeLimit(): number {
  return IELTS_SPEAKING_PARTS.reduce(
    (sum, part) => sum + IELTS_SPEAKING_PART_DEFS[part].mockTimeLimitSeconds,
    0
  );
}

export function getIeltsSpeakingMockQuestionCount(): number {
  return IELTS_SPEAKING_PARTS.reduce(
    (sum, part) => sum + IELTS_SPEAKING_PART_DEFS[part].mockQuestionCount,
    0
  );
}

export function isIeltsSpeakingQuestionContent(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const c = content as Record<string, unknown>;
  return c.examTrack === "IELTS" && [1, 2, 3].includes(Number(c.ieltsPart));
}

export function getIeltsPartFromContent(content: unknown): IeltsSpeakingPart | null {
  if (!isIeltsSpeakingQuestionContent(content)) return null;
  return Number((content as Record<string, unknown>).ieltsPart) as IeltsSpeakingPart;
}
