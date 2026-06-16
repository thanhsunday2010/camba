import { ExamLevel, Skill } from "@prisma/client";

/** Số câu mỗi đề mock 1 kỹ năng (pool động) */
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

export function getMockSkillQuestionCount(level: ExamLevel, skill: Skill): number {
  return SKILL_MOCK_QUESTION_COUNTS[level]?.[skill] ?? 0;
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
