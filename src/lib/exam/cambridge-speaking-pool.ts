import { PrismaClient, QuestionType, Skill } from "@prisma/client";
import {
  buildCambridgeSpeakingMockPoolKey,
  buildCambridgeSpeakingPracticePoolKey,
  getCambridgePartDef,
  getCambridgeSpeakingMockQuestionCount,
  getCambridgeSpeakingParts,
  isCambridgeSpeakingMockPoolKey,
  isCambridgeSpeakingPracticePoolKey,
  parseCambridgeSpeakingPracticePoolKey,
  type CambridgeSpeakingPart,
} from "@/lib/exam/cambridge-speaking-config";
import { getUsedPoolQuestionIds } from "@/lib/exam/practice-pool";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function pickQuestionIds(pool: string[], exclude: Set<string>, count: number): string[] {
  if (pool.length === 0) return [];
  const target = Math.min(count, pool.length);
  let available = pool.filter((id) => !exclude.has(id));
  if (available.length < target) available = [...pool];
  return shuffle(available).slice(0, target);
}

export async function getCambridgeSpeakingPoolQuestionIds(
  db: PrismaClient,
  level: import("@prisma/client").ExamLevel,
  part: CambridgeSpeakingPart
): Promise<string[]> {
  const rows = await db.question.findMany({
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
    select: { id: true },
    orderBy: { id: "asc" },
  });
  return rows.map((r) => r.id);
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

export async function assignCambridgeSpeakingQuestionsForAttempt(
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

  if (!attempt?.userId) throw new Error("Attempt Cambridge Speaking không hợp lệ");
  if (attempt.attemptQuestions.length > 0) return attempt.attemptQuestions.length;

  const practiceKey = attempt.paper.practicePoolKey;
  const mockKey = attempt.paper.mockPoolKey;
  const exclude = await getUsedPoolQuestionIds(db, attempt.userId, attempt.paperId);

  if (practiceKey && isCambridgeSpeakingPracticePoolKey(practiceKey)) {
    const parsed = parseCambridgeSpeakingPracticePoolKey(practiceKey);
    if (!parsed) throw new Error("practicePoolKey Cambridge không hợp lệ");

    const { level, part } = parsed;
    const pool = await getCambridgeSpeakingPoolQuestionIds(db, level, part);
    if (pool.length === 0) {
      throw new Error(`Ngân hàng Speaking ${level} Part ${part} chưa có câu hỏi`);
    }

    const count = getCambridgePartDef(level, part).practiceQuestionCount;
    const picked = pickQuestionIds(pool, exclude, count);
    return createAttemptQuestions(db, attemptId, picked);
  }

  if (mockKey && isCambridgeSpeakingMockPoolKey(mockKey)) {
    const level = attempt.paper.level;
    const orderedIds: string[] = [];

    for (const part of getCambridgeSpeakingParts(level)) {
      const pool = await getCambridgeSpeakingPoolQuestionIds(db, level, part);
      const need = getCambridgePartDef(level, part).mockQuestionCount;
      if (pool.length === 0) {
        throw new Error(`Ngân hàng Speaking ${level} Part ${part} chưa có câu hỏi`);
      }
      const picked = pickQuestionIds(pool, exclude, need);
      for (const id of picked) exclude.add(id);
      orderedIds.push(...picked);
    }

    const expected = getCambridgeSpeakingMockQuestionCount(level);
    if (orderedIds.length !== expected) {
      throw new Error(`Mock Speaking ${level} thiếu câu (${orderedIds.length}/${expected})`);
    }

    if (mockKey !== buildCambridgeSpeakingMockPoolKey(level)) {
      throw new Error("mockPoolKey không khớp level");
    }

    return createAttemptQuestions(db, attemptId, orderedIds);
  }

  throw new Error("Đề không phải Cambridge Speaking pool");
}

export { buildCambridgeSpeakingMockPoolKey, buildCambridgeSpeakingPracticePoolKey };
