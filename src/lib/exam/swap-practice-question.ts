import { ExamLevel, PaperKind, PrismaClient, Skill } from "@prisma/client";
import type { PlacementPool } from "@/lib/placement/placement-config";
import {
  isCambridgeSpeakingMockPoolKey,
  isCambridgeSpeakingPracticePoolKey,
  parseCambridgeSpeakingMockPoolKey,
  parseCambridgeSpeakingPracticePoolKey,
  type CambridgeSpeakingPart,
} from "@/lib/exam/cambridge-speaking-config";
import { getCambridgeSpeakingPoolQuestions } from "@/lib/exam/cambridge-speaking-pool";
import {
  isCambridgeWritingMockPoolKey,
  isCambridgeWritingPracticePoolKey,
  parseCambridgeWritingMockPoolKey,
  parseCambridgeWritingPracticePoolKey,
  type CambridgeWritingPart,
} from "@/lib/exam/cambridge-writing-config";
import { getCambridgeWritingPoolQuestions } from "@/lib/exam/cambridge-writing-pool";
import {
  isIeltsSpeakingMockPoolKey,
  isIeltsSpeakingPracticePoolKey,
  parseIeltsSpeakingMockPoolKey,
  parseIeltsSpeakingPracticePoolKey,
  type IeltsSpeakingPart,
} from "@/lib/exam/ielts-speaking-config";
import { getIeltsSpeakingPoolQuestions } from "@/lib/exam/ielts-speaking-pool";
import {
  isIeltsWritingMockPoolKey,
  isIeltsWritingPracticePoolKey,
  parseIeltsWritingMockPoolKey,
  parseIeltsWritingPracticePoolKey,
  type IeltsWritingTask,
} from "@/lib/exam/ielts-writing-config";
import { getIeltsWritingPoolQuestions } from "@/lib/exam/ielts-writing-pool";
import {
  getPracticePoolQuestionsForPick,
  loadAttemptPracticeQuestions,
  parseMockFullPoolKey,
  parseMockSkillPoolKey,
  parsePracticePoolKey,
  shouldIncludeCorrectAnswerForPoolPaper,
  type PracticeQuestionRow,
} from "@/lib/exam/practice-pool";
import {
  pickDiverseQuestionIds,
  type QuestionPickMeta,
} from "@/lib/exam/question-diversity";

const poolQuestionPickSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
} as const;

type QuestionPoolContext = {
  skill: Skill;
  level: ExamLevel;
  placementSlug: string | null;
  placementPool: string | null;
  content: unknown;
};

function canSwapPaperKind(paperKind: PaperKind): boolean {
  return (
    paperKind === PaperKind.PRACTICE ||
    paperKind === PaperKind.MOCK_SKILL ||
    paperKind === PaperKind.MOCK_FULL ||
    paperKind === PaperKind.PLACEMENT
  );
}

function readNumberField(content: unknown, field: string): number | null {
  if (!content || typeof content !== "object") return null;
  const value = (content as Record<string, unknown>)[field];
  return typeof value === "number" ? value : null;
}

async function getPlacementSwapPool(
  db: PrismaClient,
  ctx: QuestionPoolContext
): Promise<QuestionPickMeta[]> {
  if (!ctx.placementSlug || !ctx.placementPool) {
    throw new Error("Câu placement không thuộc ngân hàng — không thể đổi");
  }

  return db.question.findMany({
    where: {
      placementSlug: ctx.placementSlug,
      placementPool: ctx.placementPool as PlacementPool,
    },
    select: poolQuestionPickSelect,
    orderBy: { id: "asc" },
  });
}

async function getSwapPool(
  db: PrismaClient,
  paper: {
    level: ExamLevel;
    skill: Skill;
    practicePoolKey?: string | null;
    mockPoolKey?: string | null;
    paperKind: PaperKind;
  },
  ctx: QuestionPoolContext
): Promise<QuestionPickMeta[]> {
  if (paper.paperKind === PaperKind.PLACEMENT) {
    return getPlacementSwapPool(db, ctx);
  }

  const key = paper.practicePoolKey ?? paper.mockPoolKey;

  if (key && isIeltsSpeakingPracticePoolKey(key)) {
    const parsed = parseIeltsSpeakingPracticePoolKey(key);
    if (parsed) return getIeltsSpeakingPoolQuestions(db, parsed.part, parsed.module);
  }

  if (key && isIeltsSpeakingMockPoolKey(key)) {
    const part = readNumberField(ctx.content, "ieltsPart") as IeltsSpeakingPart | null;
    const ieltsModule = parseIeltsSpeakingMockPoolKey(key) ?? "ACADEMIC";
    if (part === 1 || part === 2 || part === 3) {
      return getIeltsSpeakingPoolQuestions(db, part, ieltsModule);
    }
  }

  if (key && isIeltsWritingPracticePoolKey(key)) {
    const parsed = parseIeltsWritingPracticePoolKey(key);
    if (parsed) return getIeltsWritingPoolQuestions(db, parsed.task, parsed.module);
  }

  if (key && isIeltsWritingMockPoolKey(key)) {
    const task = readNumberField(ctx.content, "ieltsWritingTask") as IeltsWritingTask | null;
    const ieltsModule = parseIeltsWritingMockPoolKey(key) ?? "ACADEMIC";
    if (task === 1 || task === 2) {
      return getIeltsWritingPoolQuestions(db, task, ieltsModule);
    }
  }

  if (key && isCambridgeSpeakingPracticePoolKey(key)) {
    const parsed = parseCambridgeSpeakingPracticePoolKey(key);
    if (parsed) return getCambridgeSpeakingPoolQuestions(db, parsed.level, parsed.part);
  }

  if (key && isCambridgeSpeakingMockPoolKey(key)) {
    const level = parseCambridgeSpeakingMockPoolKey(key);
    const part = readNumberField(ctx.content, "cambridgePart") as CambridgeSpeakingPart | null;
    if (level && (part === 1 || part === 2 || part === 3)) {
      return getCambridgeSpeakingPoolQuestions(db, level, part);
    }
  }

  if (key && isCambridgeWritingPracticePoolKey(key)) {
    const parsed = parseCambridgeWritingPracticePoolKey(key);
    if (parsed) return getCambridgeWritingPoolQuestions(db, parsed.level, parsed.part);
  }

  if (key && isCambridgeWritingMockPoolKey(key)) {
    const level = parseCambridgeWritingMockPoolKey(key);
    const part = readNumberField(ctx.content, "cambridgeWritingPart") as CambridgeWritingPart | null;
    if (level && (part === 1 || part === 2)) {
      return getCambridgeWritingPoolQuestions(db, level, part);
    }
  }

  if (key?.startsWith("FULL:")) {
    const level = parseMockFullPoolKey(key);
    if (level) return getPracticePoolQuestionsForPick(db, level, ctx.skill);
  }

  const mockSkill = key ? parseMockSkillPoolKey(key) : null;
  if (mockSkill) {
    return getPracticePoolQuestionsForPick(db, mockSkill.level, mockSkill.skill);
  }

  if (key) {
    const parsed = parsePracticePoolKey(key);
    if (parsed) return getPracticePoolQuestionsForPick(db, parsed.level, parsed.skill);
  }

  return getPracticePoolQuestionsForPick(db, paper.level, ctx.skill);
}

async function ensureAttemptQuestionsFromPaper(
  db: PrismaClient,
  attemptId: string
): Promise<void> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      attemptQuestions: { select: { id: true } },
      paper: {
        include: {
          questions: { orderBy: { orderIndex: "asc" }, select: { questionId: true } },
        },
      },
    },
  });

  if (!attempt || attempt.attemptQuestions.length > 0) return;

  const questionIds = attempt.paper.questions.map((pq) => pq.questionId);
  if (questionIds.length === 0) return;

  await db.attemptQuestion.createMany({
    data: questionIds.map((questionId, orderIndex) => ({
      attemptId,
      questionId,
      orderIndex,
    })),
  });
}

export async function swapPracticeQuestionInAttempt(
  db: PrismaClient,
  attemptId: string,
  questionId: string,
  excludeQuestionIds: string[] = []
): Promise<PracticeQuestionRow> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      attemptQuestions: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!attempt) {
    throw new Error("Bài làm không hợp lệ");
  }
  if (!attempt.userId && attempt.paper.paperKind !== PaperKind.PLACEMENT) {
    throw new Error("Bài làm không hợp lệ");
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Chỉ có thể đổi câu khi đang làm bài");
  }
  if (!canSwapPaperKind(attempt.paper.paperKind)) {
    throw new Error("Loại đề này không hỗ trợ đổi câu");
  }

  await ensureAttemptQuestionsFromPaper(db, attemptId);

  const refreshed = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      attemptQuestions: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!refreshed) throw new Error("Bài làm không hợp lệ");

  const slot = refreshed.attemptQuestions.find((aq) => aq.questionId === questionId);
  if (!slot) {
    throw new Error("Không tìm thấy câu hỏi trong bài làm");
  }

  const currentQuestion = await db.question.findUnique({
    where: { id: questionId },
    select: {
      skill: true,
      level: true,
      placementSlug: true,
      placementPool: true,
      content: true,
    },
  });

  if (!currentQuestion) {
    throw new Error("Không tìm thấy câu hỏi");
  }

  const pool = await getSwapPool(db, refreshed.paper, currentQuestion);
  if (pool.length <= 1) {
    throw new Error("Ngân hàng chỉ có một câu — không thể đổi");
  }

  const inAttempt = new Set(refreshed.attemptQuestions.map((aq) => aq.questionId));
  const exclude = new Set([...inAttempt, ...excludeQuestionIds]);
  const picked = pickDiverseQuestionIds(pool, exclude, 1);
  if (picked.length === 0) {
    throw new Error("Không còn câu khác trong cùng phần — bạn đã xem hết ngân hàng");
  }

  const newQuestionId = picked[0]!;

  await db.$transaction([
    db.attemptQuestion.update({
      where: { id: slot.id },
      data: { questionId: newQuestionId },
    }),
    db.attemptAnswer.deleteMany({
      where: { attemptId, questionId },
    }),
  ]);

  const includeAnswers = shouldIncludeCorrectAnswerForPoolPaper(refreshed.paper);
  const rows = await loadAttemptPracticeQuestions(db, attemptId, includeAnswers);
  const replacement = rows.find((q) => q.id === newQuestionId);
  if (!replacement) {
    throw new Error("Không thể tải câu hỏi mới");
  }

  return replacement;
}

export function practiceUsesAttemptQuestions(
  paper: { paperKind: PaperKind },
  attemptQuestionCount: number
): boolean {
  return paper.paperKind === PaperKind.PRACTICE && attemptQuestionCount > 0;
}

export function supportsQuestionSwap(paperKind: PaperKind): boolean {
  return canSwapPaperKind(paperKind);
}
