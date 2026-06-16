import { ExamLevel, PaperKind, PrismaClient, QuestionType, Skill } from "@prisma/client";
import {
  getCambridgeSpeakingParts,
  type CambridgeSpeakingPart,
} from "@/lib/exam/cambridge-speaking-config";
import {
  getCambridgeWritingParts,
  type CambridgeWritingPart,
} from "@/lib/exam/cambridge-writing-config";
import {
  IELTS_SPEAKING_LEVEL,
  IELTS_SPEAKING_PARTS,
  type IeltsSpeakingPart,
} from "@/lib/exam/ielts-speaking-config";
import {
  IELTS_WRITING_LEVEL,
  IELTS_WRITING_TASKS,
  type IeltsWritingTask,
} from "@/lib/exam/ielts-writing-config";

export type BankStats = {
  questionCount: number;
  paperCount: number;
};

export function formatBankStatsLine(stats: BankStats): string {
  const paperWord = stats.paperCount === 1 ? "đề" : "đề";
  return `${stats.questionCount} câu · ${stats.paperCount} ${paperWord} trong ngân hàng`;
}

async function countPublishedPapers(
  db: PrismaClient,
  where: {
    practicePoolKey?: string | { in: string[] } | { startsWith: string };
    mockPoolKey?: string;
    level?: ExamLevel;
    skill?: Skill;
    paperKind?: PaperKind;
  }
): Promise<number> {
  return db.examPaper.count({
    where: { published: true, ...where },
  });
}

export async function countSkillPoolQuestions(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill
): Promise<number> {
  return db.question.count({
    where: { level, skill, placementSlug: null },
  });
}

export async function getSkillPracticeBankStats(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill,
  practicePoolKey: string,
  mockPoolKey: string
): Promise<{ practice: BankStats; mock: BankStats }> {
  const questionCount = await countSkillPoolQuestions(db, level, skill);
  const [practicePaperCount, mockPaperCount] = await Promise.all([
    countPublishedPapers(db, { practicePoolKey, paperKind: PaperKind.PRACTICE }),
    countPublishedPapers(db, { mockPoolKey, paperKind: PaperKind.MOCK_SKILL }),
  ]);
  return {
    practice: { questionCount, paperCount: practicePaperCount },
    mock: { questionCount, paperCount: mockPaperCount },
  };
}

export async function countCambridgeSpeakingPartQuestions(
  db: PrismaClient,
  level: ExamLevel,
  part: CambridgeSpeakingPart
): Promise<number> {
  return db.question.count({
    where: {
      level,
      skill: Skill.SPEAKING,
      type: QuestionType.SPEAKING_PROMPT,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "CAMBRIDGE" } },
        { content: { path: ["cambridgePart"], equals: part } },
      ],
    },
  });
}

export async function countCambridgeWritingPartQuestions(
  db: PrismaClient,
  level: ExamLevel,
  part: CambridgeWritingPart
): Promise<number> {
  return db.question.count({
    where: {
      level,
      skill: Skill.WRITING,
      type: QuestionType.FREE_TEXT,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "CAMBRIDGE" } },
        { content: { path: ["cambridgeWritingPart"], equals: part } },
      ],
    },
  });
}

export async function countCambridgeSpeakingMockBankQuestions(
  db: PrismaClient,
  level: ExamLevel
): Promise<number> {
  const parts = getCambridgeSpeakingParts(level);
  const counts = await Promise.all(
    parts.map((part) => countCambridgeSpeakingPartQuestions(db, level, part))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

export async function countCambridgeWritingMockBankQuestions(
  db: PrismaClient,
  level: ExamLevel
): Promise<number> {
  const parts = getCambridgeWritingParts(level);
  const counts = await Promise.all(
    parts.map((part) => countCambridgeWritingPartQuestions(db, level, part))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

export async function countIeltsSpeakingPartQuestions(
  db: PrismaClient,
  part: IeltsSpeakingPart
): Promise<number> {
  return db.question.count({
    where: {
      level: IELTS_SPEAKING_LEVEL,
      skill: Skill.SPEAKING,
      type: QuestionType.SPEAKING_PROMPT,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "IELTS" } },
        { content: { path: ["ieltsPart"], equals: part } },
      ],
    },
  });
}

export async function countIeltsWritingTaskQuestions(
  db: PrismaClient,
  task: IeltsWritingTask
): Promise<number> {
  return db.question.count({
    where: {
      level: IELTS_WRITING_LEVEL,
      skill: Skill.WRITING,
      type: QuestionType.FREE_TEXT,
      placementSlug: null,
      AND: [
        { content: { path: ["examTrack"], equals: "IELTS" } },
        { content: { path: ["ieltsWritingTask"], equals: task } },
      ],
    },
  });
}

export async function countIeltsSpeakingMockBankQuestions(db: PrismaClient): Promise<number> {
  const counts = await Promise.all(
    IELTS_SPEAKING_PARTS.map((part) => countIeltsSpeakingPartQuestions(db, part))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

export async function countIeltsWritingMockBankQuestions(db: PrismaClient): Promise<number> {
  const counts = await Promise.all(
    IELTS_WRITING_TASKS.map((task) => countIeltsWritingTaskQuestions(db, task))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

export async function countFullMockBankQuestions(
  db: PrismaClient,
  level: ExamLevel
): Promise<number> {
  const skills = [
    Skill.READING,
    Skill.LISTENING,
    Skill.WRITING,
    Skill.SPEAKING,
    Skill.USE_OF_ENGLISH,
  ] as const;
  const counts = await Promise.all(
    skills.map((skill) => countSkillPoolQuestions(db, level, skill))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

export async function getPartPracticeBankStats(
  db: PrismaClient,
  questionCount: number,
  practicePoolKey: string
): Promise<BankStats> {
  const paperCount = await countPublishedPapers(db, {
    practicePoolKey,
    paperKind: PaperKind.PRACTICE,
  });
  return { questionCount, paperCount };
}

export async function getMockBankStats(
  db: PrismaClient,
  questionCount: number,
  mockPoolKey: string
): Promise<BankStats> {
  const paperCount = await db.examPaper.count({
    where: {
      published: true,
      mockPoolKey,
      OR: [{ paperKind: PaperKind.MOCK_SKILL }, { paperKind: PaperKind.MOCK_FULL }],
    },
  });
  return { questionCount, paperCount };
}
