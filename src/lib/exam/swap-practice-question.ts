import { PaperKind, PrismaClient } from "@prisma/client";
import {
  isCambridgeSpeakingPracticePoolKey,
  parseCambridgeSpeakingPracticePoolKey,
} from "@/lib/exam/cambridge-speaking-config";
import { getCambridgeSpeakingPoolQuestions } from "@/lib/exam/cambridge-speaking-pool";
import {
  isCambridgeWritingPracticePoolKey,
  parseCambridgeWritingPracticePoolKey,
} from "@/lib/exam/cambridge-writing-config";
import { getCambridgeWritingPoolQuestions } from "@/lib/exam/cambridge-writing-pool";
import {
  isIeltsSpeakingPracticePoolKey,
  parseIeltsSpeakingPracticePoolKey,
} from "@/lib/exam/ielts-speaking-config";
import { getIeltsSpeakingPoolQuestions } from "@/lib/exam/ielts-speaking-pool";
import {
  isIeltsWritingPracticePoolKey,
  parseIeltsWritingPracticePoolKey,
} from "@/lib/exam/ielts-writing-config";
import { getIeltsWritingPoolQuestions } from "@/lib/exam/ielts-writing-pool";
import {
  getPracticePoolQuestionsForPick,
  loadAttemptPracticeQuestions,
  parsePracticePoolKey,
  practiceQuestionSelect,
  shouldIncludeCorrectAnswerForPoolPaper,
  type PracticeQuestionRow,
} from "@/lib/exam/practice-pool";
import {
  pickDiverseQuestionIds,
  type QuestionPickMeta,
} from "@/lib/exam/question-diversity";

async function getPracticeSwapPool(
  db: PrismaClient,
  paper: {
    level: import("@prisma/client").ExamLevel;
    skill: import("@prisma/client").Skill;
    practicePoolKey?: string | null;
  }
): Promise<QuestionPickMeta[]> {
  const key = paper.practicePoolKey;

  if (key && isIeltsSpeakingPracticePoolKey(key)) {
    const part = parseIeltsSpeakingPracticePoolKey(key);
    if (part) return getIeltsSpeakingPoolQuestions(db, part);
  }

  if (key && isIeltsWritingPracticePoolKey(key)) {
    const task = parseIeltsWritingPracticePoolKey(key);
    if (task) return getIeltsWritingPoolQuestions(db, task);
  }

  if (key && isCambridgeSpeakingPracticePoolKey(key)) {
    const parsed = parseCambridgeSpeakingPracticePoolKey(key);
    if (parsed) return getCambridgeSpeakingPoolQuestions(db, parsed.level, parsed.part);
  }

  if (key && isCambridgeWritingPracticePoolKey(key)) {
    const parsed = parseCambridgeWritingPracticePoolKey(key);
    if (parsed) return getCambridgeWritingPoolQuestions(db, parsed.level, parsed.part);
  }

  if (key) {
    const parsed = parsePracticePoolKey(key);
    if (parsed) return getPracticePoolQuestionsForPick(db, parsed.level, parsed.skill);
  }

  return getPracticePoolQuestionsForPick(db, paper.level, paper.skill);
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

  if (!attempt?.userId) {
    throw new Error("Bài làm không hợp lệ");
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Chỉ có thể đổi câu khi đang làm bài");
  }
  if (attempt.paper.paperKind !== PaperKind.PRACTICE) {
    throw new Error("Chỉ áp dụng cho bài luyện tập");
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

  const pool = await getPracticeSwapPool(db, refreshed.paper);
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
