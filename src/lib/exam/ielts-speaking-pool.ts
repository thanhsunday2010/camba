import { PrismaClient, QuestionType, Skill } from "@prisma/client";
import {
  buildIeltsSpeakingMockSections,
  getIeltsSpeakingMockQuestionCount,
  IELTS_SPEAKING_LEVEL,
  IELTS_SPEAKING_PART_DEFS,
  IELTS_SPEAKING_PARTS,
  IeltsSpeakingPart,
  isIeltsSpeakingMockPoolKey,
  isIeltsSpeakingPracticePoolKey,
  parseIeltsSpeakingPracticePoolKey,
} from "@/lib/exam/ielts-speaking-config";
import { getUsedPoolQuestionIds } from "@/lib/exam/practice-pool";
import {
  pickDiverseQuestionIds,
  type QuestionPickMeta,
} from "@/lib/exam/question-diversity";

const speakingPoolPickSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
} as const;

export async function getIeltsSpeakingPoolQuestions(
  db: PrismaClient,
  part: IeltsSpeakingPart
): Promise<QuestionPickMeta[]> {
  return db.question.findMany({
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
    select: speakingPoolPickSelect,
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

export async function assignIeltsSpeakingQuestionsForAttempt(
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

  if (!attempt?.userId) throw new Error("Attempt IELTS Speaking không hợp lệ");
  if (attempt.attemptQuestions.length > 0) return attempt.attemptQuestions.length;

  const practiceKey = attempt.paper.practicePoolKey;
  const mockKey = attempt.paper.mockPoolKey;
  const exclude = await getUsedPoolQuestionIds(db, attempt.userId, attempt.paperId);

  if (practiceKey && isIeltsSpeakingPracticePoolKey(practiceKey)) {
    const part = parseIeltsSpeakingPracticePoolKey(practiceKey);
    if (!part) throw new Error("practicePoolKey IELTS không hợp lệ");

    const pool = await getIeltsSpeakingPoolQuestions(db, part);
    if (pool.length === 0) {
      throw new Error(`Ngân hàng IELTS Speaking Part ${part} chưa có câu hỏi`);
    }

    const count = IELTS_SPEAKING_PART_DEFS[part].practiceQuestionCount;
    const picked = pickDiverseQuestionIds(pool, exclude, count);
    return createAttemptQuestions(db, attemptId, picked);
  }

  if (mockKey && isIeltsSpeakingMockPoolKey(mockKey)) {
    const orderedIds: string[] = [];

    for (const part of IELTS_SPEAKING_PARTS) {
      const pool = await getIeltsSpeakingPoolQuestions(db, part);
      const need = IELTS_SPEAKING_PART_DEFS[part].mockQuestionCount;
      if (pool.length === 0) {
        throw new Error(`Ngân hàng IELTS Speaking Part ${part} chưa có câu hỏi`);
      }
      const picked = pickDiverseQuestionIds(pool, exclude, need);
      for (const id of picked) exclude.add(id);
      orderedIds.push(...picked);
    }

    const expected = getIeltsSpeakingMockQuestionCount();
    if (orderedIds.length !== expected) {
      throw new Error(`IELTS mock thiếu câu hỏi (${orderedIds.length}/${expected})`);
    }

    return createAttemptQuestions(db, attemptId, orderedIds);
  }

  throw new Error("Đề không phải IELTS Speaking pool");
}

export { buildIeltsSpeakingMockSections };
