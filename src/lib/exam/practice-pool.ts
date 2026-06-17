import {
  ExamLevel,
  PaperKind,
  PrismaClient,
  QuestionType,
  Skill,
} from "@prisma/client";
import {
  buildFullMockPaperSections,
  getCambridgeMockFormat,
} from "@/lib/exam/cambridge-mock-formats";
import { getMockSkillQuestionCount } from "@/lib/exam/mock-config";
import {
  pickDiverseQuestionIds,
  pickReadingPassageQuestionIds,
  type QuestionPickMeta,
} from "@/lib/exam/question-diversity";

/** Số câu mỗi lần luyện tập (pool động) */
export const PRACTICE_POOL_SIZE = 10;

export function buildPracticePoolKey(level: ExamLevel, skill: Skill): string {
  return `${level}:${skill}`;
}

export function buildMockSkillPoolKey(level: ExamLevel, skill: Skill): string {
  return `SKILL:${level}:${skill}`;
}

export function buildMockFullPoolKey(level: ExamLevel): string {
  return `FULL:${level}`;
}

export function parsePracticePoolKey(key: string): { level: ExamLevel; skill: Skill } | null {
  const [level, skill] = key.split(":");
  const levels: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
  const skills: Skill[] = [
    "READING",
    "LISTENING",
    "WRITING",
    "SPEAKING",
    "USE_OF_ENGLISH",
  ];
  if (!levels.includes(level as ExamLevel) || !skills.includes(skill as Skill)) {
    return null;
  }
  return { level: level as ExamLevel, skill: skill as Skill };
}

export function parseMockSkillPoolKey(key: string): { level: ExamLevel; skill: Skill } | null {
  if (!key.startsWith("SKILL:")) return null;
  return parsePracticePoolKey(key.slice("SKILL:".length));
}

export function parseMockFullPoolKey(key: string): ExamLevel | null {
  if (!key.startsWith("FULL:")) return null;
  const level = key.slice("FULL:".length);
  const levels: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
  return levels.includes(level as ExamLevel) ? (level as ExamLevel) : null;
}

export function isDynamicPracticePaper(paper: {
  paperKind: PaperKind;
  practicePoolKey?: string | null;
}): boolean {
  return paper.paperKind === PaperKind.PRACTICE && !!paper.practicePoolKey;
}

export function isDynamicMockPaper(paper: {
  paperKind: PaperKind;
  mockPoolKey?: string | null;
}): boolean {
  return (
    (paper.paperKind === PaperKind.MOCK_SKILL || paper.paperKind === PaperKind.MOCK_FULL) &&
    !!paper.mockPoolKey
  );
}

export function isDynamicPoolPaper(paper: {
  paperKind: PaperKind;
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  return isDynamicPracticePaper(paper) || isDynamicMockPaper(paper);
}

const poolQuestionPickSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
} as const;

export async function getPracticePoolQuestionsForPick(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill
): Promise<QuestionPickMeta[]> {
  return db.question.findMany({
    where: {
      level,
      skill,
      placementSlug: null,
    },
    select: poolQuestionPickSelect,
    orderBy: { id: "asc" },
  });
}

/** @deprecated use getPracticePoolQuestionsForPick */
export async function getPracticePoolQuestionIds(
  db: PrismaClient,
  level: ExamLevel,
  skill: Skill
): Promise<string[]> {
  const rows = await getPracticePoolQuestionsForPick(db, level, skill);
  return rows.map((r) => r.id);
}

export async function getUsedPoolQuestionIds(
  db: PrismaClient,
  userId: string,
  paperId: string
): Promise<Set<string>> {
  const rows = await db.attemptQuestion.findMany({
    where: {
      attempt: {
        userId,
        paperId,
        status: { in: ["SUBMITTED", "GRADED"] },
      },
    },
    select: { questionId: true },
    distinct: ["questionId"],
  });
  return new Set(rows.map((r) => r.questionId));
}

/** @deprecated use getUsedPoolQuestionIds */
export const getUsedPracticeQuestionIds = getUsedPoolQuestionIds;

async function createAttemptQuestions(
  db: PrismaClient,
  attemptId: string,
  questionIds: string[]
): Promise<number> {
  if (questionIds.length === 0) return 0;

  await db.attemptQuestion.createMany({
    data: questionIds.map((questionId, orderIndex) => ({
      attemptId,
      questionId,
      orderIndex,
    })),
  });

  return questionIds.length;
}

export async function assignPracticeQuestionsForAttempt(
  db: PrismaClient,
  attemptId: string
): Promise<number> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      attemptQuestions: { select: { id: true } },
    },
  });

  if (!attempt?.paper.practicePoolKey || !attempt.userId) {
    throw new Error("Attempt pool luyện tập không hợp lệ");
  }

  if (attempt.attemptQuestions.length > 0) {
    return attempt.attemptQuestions.length;
  }

  const parsed = parsePracticePoolKey(attempt.paper.practicePoolKey);
  if (!parsed) throw new Error("practicePoolKey không hợp lệ");

  const pool = await getPracticePoolQuestionsForPick(db, parsed.level, parsed.skill);
  if (pool.length === 0) {
    throw new Error(`Ngân hàng ${parsed.level}/${parsed.skill} chưa có câu hỏi luyện tập`);
  }

  const used = await getUsedPoolQuestionIds(db, attempt.userId, attempt.paperId);
  const picked =
    parsed.skill === Skill.READING
      ? pickReadingPassageQuestionIds(pool, used, PRACTICE_POOL_SIZE)
      : pickDiverseQuestionIds(pool, used, PRACTICE_POOL_SIZE);

  return createAttemptQuestions(db, attemptId, picked);
}

export async function assignMockSkillQuestionsForAttempt(
  db: PrismaClient,
  attemptId: string
): Promise<number> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      attemptQuestions: { select: { id: true } },
    },
  });

  if (!attempt?.paper.mockPoolKey || !attempt.userId) {
    throw new Error("Attempt mock kỹ năng không hợp lệ");
  }

  if (attempt.attemptQuestions.length > 0) {
    return attempt.attemptQuestions.length;
  }

  const parsed = parseMockSkillPoolKey(attempt.paper.mockPoolKey);
  if (!parsed) throw new Error("mockPoolKey mock kỹ năng không hợp lệ");

  const count = getMockSkillQuestionCount(parsed.level, parsed.skill);
  if (count === 0) {
    throw new Error(`Mock ${parsed.level}/${parsed.skill} chưa được cấu hình`);
  }

  const pool = await getPracticePoolQuestionsForPick(db, parsed.level, parsed.skill);
  if (pool.length === 0) {
    throw new Error(`Ngân hàng ${parsed.level}/${parsed.skill} chưa có câu hỏi mock`);
  }

  const used = await getUsedPoolQuestionIds(db, attempt.userId, attempt.paperId);
  const picked = pickDiverseQuestionIds(pool, used, count);

  return createAttemptQuestions(db, attemptId, picked);
}

export async function assignMockFullQuestionsForAttempt(
  db: PrismaClient,
  attemptId: string
): Promise<number> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      attemptQuestions: { select: { id: true } },
    },
  });

  if (!attempt?.paper.mockPoolKey || !attempt.userId) {
    throw new Error("Attempt full mock không hợp lệ");
  }

  if (attempt.attemptQuestions.length > 0) {
    return attempt.attemptQuestions.length;
  }

  const level = parseMockFullPoolKey(attempt.paper.mockPoolKey);
  if (!level) throw new Error("mockPoolKey full mock không hợp lệ");

  const format = getCambridgeMockFormat(level);
  const exclude = await getUsedPoolQuestionIds(db, attempt.userId, attempt.paperId);
  const orderedIds: string[] = [];

  for (const spec of format.sections) {
    for (const slice of spec.slices) {
      const pool = await getPracticePoolQuestionsForPick(db, level, slice.skill);
      if (pool.length === 0) {
        throw new Error(`Ngân hàng ${level}/${slice.skill} chưa có câu hỏi full mock`);
      }

      const picked = pickDiverseQuestionIds(pool, exclude, slice.count);
      if (picked.length < slice.count && pool.length >= slice.count) {
        throw new Error(`Không đủ câu ${level}/${slice.skill} cho full mock`);
      }

      for (const id of picked) exclude.add(id);
      orderedIds.push(...picked);
    }
  }

  const expectedSections = buildFullMockPaperSections(level);
  const expectedTotal = expectedSections[expectedSections.length - 1]?.endIndex ?? 0;
  if (orderedIds.length !== expectedTotal) {
    throw new Error(`Full mock ${level}: thiếu câu hỏi (${orderedIds.length}/${expectedTotal})`);
  }

  return createAttemptQuestions(db, attemptId, orderedIds);
}

export async function assignDynamicExamQuestionsForAttempt(
  db: PrismaClient,
  attemptId: string
): Promise<number> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { paper: true, attemptQuestions: { select: { id: true } } },
  });

  if (!attempt) throw new Error("Attempt không tồn tại");
  if (attempt.attemptQuestions.length > 0) return attempt.attemptQuestions.length;

  const poolKey = attempt.paper.practicePoolKey ?? attempt.paper.mockPoolKey ?? "";
  if (poolKey.startsWith("IELTS:SPK:")) {
    const { assignIeltsSpeakingQuestionsForAttempt } = await import(
      "@/lib/exam/ielts-speaking-pool"
    );
    return assignIeltsSpeakingQuestionsForAttempt(db, attemptId);
  }

  if (poolKey.startsWith("IELTS:WRT:")) {
    const { assignIeltsWritingQuestionsForAttempt } = await import(
      "@/lib/exam/ielts-writing-pool"
    );
    return assignIeltsWritingQuestionsForAttempt(db, attemptId);
  }

  if (/:SPK:/.test(poolKey)) {
    const { assignCambridgeSpeakingQuestionsForAttempt } = await import(
      "@/lib/exam/cambridge-speaking-pool"
    );
    return assignCambridgeSpeakingQuestionsForAttempt(db, attemptId);
  }

  if (/:WRT:/.test(poolKey)) {
    const { assignCambridgeWritingQuestionsForAttempt } = await import(
      "@/lib/exam/cambridge-writing-pool"
    );
    return assignCambridgeWritingQuestionsForAttempt(db, attemptId);
  }

  if (attempt.paper.practicePoolKey) {
    return assignPracticeQuestionsForAttempt(db, attemptId);
  }

  if (attempt.paper.mockPoolKey?.startsWith("SKILL:")) {
    return assignMockSkillQuestionsForAttempt(db, attemptId);
  }

  if (attempt.paper.mockPoolKey?.startsWith("FULL:")) {
    return assignMockFullQuestionsForAttempt(db, attemptId);
  }

  throw new Error("Đề không dùng pool động");
}

export const practiceQuestionSelect = {
  id: true,
  type: true,
  content: true,
  audioUrl: true,
  points: true,
  skill: true,
  title: true,
  correctAnswer: true,
} as const;

export type PracticeQuestionRow = {
  id: string;
  type: QuestionType;
  content: unknown;
  audioUrl: string | null;
  points: number;
  skill: Skill;
  title: string | null;
  correctAnswer?: unknown;
};

export async function loadAttemptPracticeQuestions(
  db: PrismaClient,
  attemptId: string,
  includeCorrectAnswer: boolean
): Promise<PracticeQuestionRow[]> {
  const rows = await db.attemptQuestion.findMany({
    where: { attemptId },
    orderBy: { orderIndex: "asc" },
    select: {
      question: { select: practiceQuestionSelect },
    },
  });

  return rows.map(({ question }) => ({
    id: question.id,
    type: question.type,
    content: question.content,
    audioUrl: question.audioUrl,
    points: question.points,
    skill: question.skill,
    title: question.title,
    ...(includeCorrectAnswer ? { correctAnswer: question.correctAnswer } : {}),
  }));
}

export function usesAttemptQuestionSet(paper: {
  paperKind: PaperKind;
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  return paper.paperKind === PaperKind.PLACEMENT || isDynamicPoolPaper(paper);
}

export function shouldIncludeCorrectAnswerForPoolPaper(paper: {
  paperKind: PaperKind;
  practicePoolKey?: string | null;
}): boolean {
  return paper.paperKind === PaperKind.PRACTICE;
}

