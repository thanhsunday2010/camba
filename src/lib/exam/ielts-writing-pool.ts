import { PrismaClient, QuestionType, Skill } from "@prisma/client";
import {
  buildIeltsWritingMockSections,
  getIeltsWritingMockQuestionCount,
  IELTS_WRITING_LEVEL,
  IELTS_WRITING_TASK_DEFS,
  IELTS_WRITING_TASKS,
  IeltsWritingTask,
  isIeltsWritingMockPoolKey,
  isIeltsWritingPracticePoolKey,
  parseIeltsWritingPracticePoolKey,
} from "@/lib/exam/ielts-writing-config";
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

export async function getIeltsWritingPoolQuestions(
  db: PrismaClient,
  task: IeltsWritingTask
): Promise<QuestionPickMeta[]> {
  return db.question.findMany({
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

export async function assignIeltsWritingQuestionsForAttempt(
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

  if (!attempt?.userId) throw new Error("Attempt IELTS Writing không hợp lệ");
  if (attempt.attemptQuestions.length > 0) return attempt.attemptQuestions.length;

  const practiceKey = attempt.paper.practicePoolKey;
  const mockKey = attempt.paper.mockPoolKey;
  const exclude = await getUsedPoolQuestionIds(db, attempt.userId, attempt.paperId);

  if (practiceKey && isIeltsWritingPracticePoolKey(practiceKey)) {
    const task = parseIeltsWritingPracticePoolKey(practiceKey);
    if (!task) throw new Error("practicePoolKey IELTS Writing không hợp lệ");

    const pool = await getIeltsWritingPoolQuestions(db, task);
    if (pool.length === 0) {
      throw new Error(`Ngân hàng IELTS Writing Task ${task} chưa có câu hỏi`);
    }

    const count = IELTS_WRITING_TASK_DEFS[task].practiceQuestionCount;
    const picked = pickDiverseQuestionIds(pool, exclude, count);
    return createAttemptQuestions(db, attemptId, picked);
  }

  if (mockKey && isIeltsWritingMockPoolKey(mockKey)) {
    const orderedIds: string[] = [];

    for (const task of IELTS_WRITING_TASKS) {
      const pool = await getIeltsWritingPoolQuestions(db, task);
      const need = IELTS_WRITING_TASK_DEFS[task].mockQuestionCount;
      if (pool.length === 0) {
        throw new Error(`Ngân hàng IELTS Writing Task ${task} chưa có câu hỏi`);
      }
      const picked = pickDiverseQuestionIds(pool, exclude, need);
      for (const id of picked) exclude.add(id);
      orderedIds.push(...picked);
    }

    const expected = getIeltsWritingMockQuestionCount();
    if (orderedIds.length !== expected) {
      throw new Error(`IELTS Writing mock thiếu câu (${orderedIds.length}/${expected})`);
    }

    return createAttemptQuestions(db, attemptId, orderedIds);
  }

  throw new Error("Đề không phải IELTS Writing pool");
}

export { buildIeltsWritingMockSections };
