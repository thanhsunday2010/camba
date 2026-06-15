import { ExamLevel, Skill } from "@prisma/client";
import { getCambridgeMockFormat } from "../../src/lib/exam/cambridge-mock-formats";
import { isYleLevel } from "./generators/bulk-data";

export type RequiredPoolSizes = {
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  uoe: number;
};

export const PRACTICE_PAPERS_PER_LEVEL = 100;
export const MOCK_SKILL_PAPERS_PER_SKILL = 5;
export const MOCK_FULL_PAPERS_PER_LEVEL = 5;

export const PRACTICE_QUESTIONS_PER_PAPER = {
  reading: 10,
  listening: 12,
  uoe: 10,
  writing: 1,
  speaking: 1,
} as const;

/** Phân bổ 100 đề luyện tập / level (tổng = 100) */
export function getPracticePaperCounts(level: ExamLevel) {
  if (isYleLevel(level)) {
    return { reading: 30, listening: 30, writing: 20, speaking: 20, uoe: 0 };
  }
  return { reading: 25, listening: 25, writing: 20, speaking: 15, uoe: 15 };
}

/** Số câu mỗi đề mock 1 kỹ năng */
export const SKILL_MOCK_QUESTION_COUNTS: Record<
  ExamLevel,
  Partial<Record<Skill, number>>
> = {
  STARTERS: {
    [Skill.READING]: 15,
    [Skill.LISTENING]: 20,
    [Skill.WRITING]: 1,
    [Skill.SPEAKING]: 1,
  },
  MOVERS: {
    [Skill.READING]: 28,
    [Skill.LISTENING]: 25,
    [Skill.WRITING]: 2,
    [Skill.SPEAKING]: 1,
  },
  FLYERS: {
    [Skill.READING]: 32,
    [Skill.LISTENING]: 25,
    [Skill.WRITING]: 2,
    [Skill.SPEAKING]: 1,
  },
  KET: {
    [Skill.READING]: 30,
    [Skill.LISTENING]: 25,
    [Skill.WRITING]: 2,
    [Skill.SPEAKING]: 1,
    [Skill.USE_OF_ENGLISH]: 15,
  },
  PET: {
    [Skill.READING]: 25,
    [Skill.LISTENING]: 25,
    [Skill.WRITING]: 2,
    [Skill.SPEAKING]: 1,
    [Skill.USE_OF_ENGLISH]: 15,
  },
  FCE: {
    [Skill.READING]: 30,
    [Skill.LISTENING]: 25,
    [Skill.WRITING]: 2,
    [Skill.SPEAKING]: 1,
    [Skill.USE_OF_ENGLISH]: 15,
  },
};

function fullMockPerSkill(level: ExamLevel): Partial<Record<Skill, number>> {
  const format = getCambridgeMockFormat(level);
  const totals: Partial<Record<Skill, number>> = {};
  for (const section of format.sections) {
    for (const slice of section.slices) {
      totals[slice.skill] = (totals[slice.skill] ?? 0) + slice.count;
    }
  }
  return totals;
}

export function computeRequiredPoolSizes(level: ExamLevel): RequiredPoolSizes {
  const practice = getPracticePaperCounts(level);
  const mockSizes = SKILL_MOCK_QUESTION_COUNTS[level];
  const fullPerSkill = fullMockPerSkill(level);

  const reading =
    practice.reading * PRACTICE_QUESTIONS_PER_PAPER.reading +
    MOCK_SKILL_PAPERS_PER_SKILL * (mockSizes[Skill.READING] ?? 0) +
    MOCK_FULL_PAPERS_PER_LEVEL * (fullPerSkill[Skill.READING] ?? 0);

  const listening =
    practice.listening * PRACTICE_QUESTIONS_PER_PAPER.listening +
    MOCK_SKILL_PAPERS_PER_SKILL * (mockSizes[Skill.LISTENING] ?? 0) +
    MOCK_FULL_PAPERS_PER_LEVEL * (fullPerSkill[Skill.LISTENING] ?? 0);

  const writing =
    practice.writing * PRACTICE_QUESTIONS_PER_PAPER.writing +
    MOCK_SKILL_PAPERS_PER_SKILL * (mockSizes[Skill.WRITING] ?? 0) +
    MOCK_FULL_PAPERS_PER_LEVEL * (fullPerSkill[Skill.WRITING] ?? 0);

  const speaking =
    practice.speaking * PRACTICE_QUESTIONS_PER_PAPER.speaking +
    MOCK_SKILL_PAPERS_PER_SKILL * (mockSizes[Skill.SPEAKING] ?? 0) +
    MOCK_FULL_PAPERS_PER_LEVEL * (fullPerSkill[Skill.SPEAKING] ?? 0);

  const uoe =
    practice.uoe * PRACTICE_QUESTIONS_PER_PAPER.uoe +
    MOCK_SKILL_PAPERS_PER_SKILL * (mockSizes[Skill.USE_OF_ENGLISH] ?? 0) +
    MOCK_FULL_PAPERS_PER_LEVEL * (fullPerSkill[Skill.USE_OF_ENGLISH] ?? 0);

  return { reading, listening, writing, speaking, uoe };
}

export function skillMockTimeLimit(level: ExamLevel, skill: Skill): number {
  if (skill === Skill.READING) {
    if (level === "FCE") return 3600;
    if (level === "PET") return 2700;
    return 1800;
  }
  if (skill === Skill.LISTENING) return 900;
  if (skill === Skill.USE_OF_ENGLISH) return 1200;
  if (skill === Skill.WRITING) return 1200;
  return 300;
}
