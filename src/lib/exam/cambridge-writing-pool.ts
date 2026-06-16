import { PrismaClient, QuestionType, Skill } from "@prisma/client";
import {
  buildCambridgeWritingMockPoolKey,
  buildCambridgeWritingPracticePoolKey,
  getCambridgeWritingPartDef,
  getCambridgeWritingMockQuestionCount,
  getCambridgeWritingParts,
  isCambridgeWritingMockPoolKey,
  isCambridgeWritingPracticePoolKey,
  parseCambridgeWritingPracticePoolKey,
  type CambridgeWritingPart,
} from "@/lib/exam/cambridge-writing-config";
import { getUsedPoolQuestionIds } from "@/lib/exam/practice-pool";
import {
  pickDiverseQuestionIds,
  type QuestionPickMeta,
} from "@/lib/exam/question-diversity";

const writingPoolPickSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
} as const;

export async function getCambridgeWritingPoolQuestions(
  db: PrismaClient,
  level: import("@prisma/client").ExamLevel,
  part: CambridgeWritingPart
): Promise<QuestionPickMeta[]> {
  return db.question.findMany({
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
    select: writingPoolPickSelect,
    orderBy: { id: "asc" },
  });
}

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

export async function assignCambridgeWritingQuestionsForAttempt(
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

  if (!attempt?.userId) throw new Error("Attempt Cambridge Writing không hợp lệ");
  if (attempt.attemptQuestions.length > 0) return attempt.attemptQuestions.length;

  const practiceKey = attempt.paper.practicePoolKey;
  const mockKey = attempt.paper.mockPoolKey;
  const exclude = await getUsedPoolQuestionIds(db, attempt.userId, attempt.paperId);

  if (practiceKey && isCambridgeWritingPracticePoolKey(practiceKey)) {
    const parsed = parseCambridgeWritingPracticePoolKey(practiceKey);
    if (!parsed) throw new Error("practicePoolKey Cambridge Writing không hợp lệ");

    const { level, part } = parsed;
    const pool = await getCambridgeWritingPoolQuestions(db, level, part);
    if (pool.length === 0) {
      throw new Error(`Ngân hàng Writing ${level} Part ${part} chưa có câu hỏi`);
    }

    const count = getCambridgeWritingPartDef(level, part).practiceQuestionCount;
    const picked = pickDiverseQuestionIds(pool, exclude, count);
    return createAttemptQuestions(db, attemptId, picked);
  }

  if (mockKey && isCambridgeWritingMockPoolKey(mockKey)) {
    const level = attempt.paper.level;
    const orderedIds: string[] = [];

    for (const part of getCambridgeWritingParts(level)) {
      const pool = await getCambridgeWritingPoolQuestions(db, level, part);
      const need = getCambridgeWritingPartDef(level, part).mockQuestionCount;
      if (pool.length === 0) {
        throw new Error(`Ngân hàng Writing ${level} Part ${part} chưa có câu hỏi`);
      }
      const picked = pickDiverseQuestionIds(pool, exclude, need);
      for (const id of picked) exclude.add(id);
      orderedIds.push(...picked);
    }

    const expected = getCambridgeWritingMockQuestionCount(level);
    if (orderedIds.length !== expected) {
      throw new Error(`Mock Writing ${level} thiếu câu (${orderedIds.length}/${expected})`);
    }

    if (mockKey !== buildCambridgeWritingMockPoolKey(level)) {
      throw new Error("mockPoolKey không khớp level");
    }

    return createAttemptQuestions(db, attemptId, orderedIds);
  }

  throw new Error("Đề không phải Cambridge Writing pool");
}

export { buildCambridgeWritingMockPoolKey, buildCambridgeWritingPracticePoolKey };
