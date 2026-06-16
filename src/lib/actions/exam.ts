"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { gradeObjectiveAnswer } from "@/lib/exam/scoring";
import { updateUserStreak } from "@/lib/ai/rate-limit";
import { processAttemptGamification } from "@/lib/gamification/service";
import { markAssignmentsComplete } from "@/lib/exam/assignments";
import {
  assignDynamicExamQuestionsForAttempt,
  isDynamicPoolPaper,
  isDynamicPracticePaper,
  loadAttemptPracticeQuestions,
  PRACTICE_POOL_SIZE,
  shouldIncludeCorrectAnswerForPoolPaper,
  usesAttemptQuestionSet,
} from "@/lib/exam/practice-pool";
import {
  formatFullMockUpgradeMessage,
  formatPracticeQuotaExceededMessage,
  formatMockTestQuotaExceededMessage,
} from "@/lib/subscription/quota-messages";
import { hasFullMockAccess } from "@/lib/subscription/plans";
import { evaluatePlacement } from "@/lib/placement/evaluate";
import { inferTrackFromPaperTitle } from "@/lib/placement/build-report";
import { QuestionType, ExamLevel, Skill, PaperKind, Prisma } from "@prisma/client";
import { requireAdminPermission } from "@/lib/admin/access";

const questionSchema = z.object({
  type: z.enum(["MCQ", "GAP_FILL", "FREE_TEXT", "SPEAKING_PROMPT"]),
  level: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
  skill: z.enum(["READING", "WRITING", "LISTENING", "SPEAKING", "USE_OF_ENGLISH"]),
  title: z.string().optional(),
  content: z.string(),
  correctAnswer: z.string().optional(),
  points: z.coerce.number().min(1).optional(),
  audioUrl: z.string().optional(),
});

const paperSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  level: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
  skill: z.enum(["READING", "WRITING", "LISTENING", "SPEAKING", "USE_OF_ENGLISH"]),
  timeLimit: z.coerce.number().min(60).optional(),
  isMockTest: z.boolean().optional(),
  published: z.boolean().optional(),
  paperKind: z.enum(["PRACTICE", "MOCK_SKILL", "MOCK_FULL", "PLACEMENT"]).optional(),
  sections: z.string().optional(),
});

function parsePaperFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    level: formData.get("level"),
    skill: formData.get("skill"),
    timeLimit: formData.get("timeLimit") || undefined,
    isMockTest: formData.get("isMockTest") === "on",
    published: formData.get("published") === "on",
    paperKind: formData.get("paperKind") || "PRACTICE",
    sections: formData.get("sections") || undefined,
  };
}

function paperKindDefaults(kind: PaperKind) {
  return {
    isMockTest: kind !== PaperKind.PRACTICE,
  };
}

function parseSectionsJson(
  raw?: string
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (raw === undefined) return undefined;
  if (!raw.trim()) return Prisma.JsonNull;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Prisma.JsonNull;
    return parsed as Prisma.InputJsonValue;
  } catch {
    return Prisma.JsonNull;
  }
}

function parseQuestionJsonField(
  raw: string | undefined,
  fieldName: string
): { ok: true; value: Prisma.InputJsonValue } | { ok: false; error: string } {
  if (!raw?.trim()) {
    return { ok: false, error: `${fieldName} không được để trống` };
  }
  try {
    return { ok: true, value: JSON.parse(raw) as Prisma.InputJsonValue };
  } catch {
    return { ok: false, error: `${fieldName} JSON không hợp lệ` };
  }
}

function revalidatePaperCache(level?: ExamLevel) {
  revalidateTag("papers");
  revalidateTag("placement-papers");
  if (level) revalidateTag(`papers-${level}`);
}

async function revalidateQuestionPaths(questionId: string) {
  revalidatePath("/admin/questions");
  revalidatePath("/admin/papers");
  revalidatePath("/placement");
  revalidatePath("/exams", "layout");
  revalidatePath("/dashboard");
  revalidateTag("papers");

  const links = await db.paperQuestion.findMany({
    where: { questionId },
    select: { paperId: true },
  });
  for (const { paperId } of links) {
    revalidatePath(`/practice/${paperId}`);
    revalidatePath(`/placement/take/${paperId}`);
  }
}

export async function createQuestionAction(formData: FormData) {
  const { error: authError } = await requireAdminPermission("questions.manage");
  if (authError) return { error: authError };

  const parsed = questionSchema.safeParse({
    type: formData.get("type"),
    level: formData.get("level"),
    skill: formData.get("skill"),
    title: formData.get("title") || undefined,
    content: formData.get("content"),
    correctAnswer: formData.get("correctAnswer") || undefined,
    points: formData.get("points") || undefined,
    audioUrl: formData.get("audioUrl") || undefined,
  });

  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const contentResult = parseQuestionJsonField(parsed.data.content, "Nội dung");
  if (!contentResult.ok) return { error: contentResult.error };

  let correctAnswer: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull;
  const correctAnswerRaw = (formData.get("correctAnswer") as string | null)?.trim() ?? "";
  if (correctAnswerRaw) {
    try {
      correctAnswer = JSON.parse(correctAnswerRaw) as Prisma.InputJsonValue;
    } catch {
      return { error: "Đáp án JSON không hợp lệ" };
    }
  }

  const audioUrlRaw = (formData.get("audioUrl") as string | null)?.trim();

  try {
    const question = await db.question.create({
      data: {
        type: parsed.data.type as QuestionType,
        level: parsed.data.level as ExamLevel,
        skill: parsed.data.skill as Skill,
        title: parsed.data.title?.trim() || null,
        content: contentResult.value,
        correctAnswer,
        points: parsed.data.points ?? 1,
        audioUrl: audioUrlRaw || null,
      },
    });
    await revalidateQuestionPaths(question.id);
    return { success: true };
  } catch {
    return { error: "Không thể tạo câu hỏi. Kiểm tra JSON content." };
  }
}

export async function deleteQuestionAction(id: string) {
  const { error: authError } = await requireAdminPermission("questions.manage");
  if (authError) return { error: authError };

  await db.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
  return { success: true };
}

export async function getQuestionByIdAction(id: string) {
  const { error: authError } = await requireAdminPermission("questions.manage");
  if (authError) return { error: authError };

  const question = await db.question.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      level: true,
      skill: true,
      title: true,
      points: true,
      content: true,
      correctAnswer: true,
      audioUrl: true,
    },
  });

  if (!question) return { error: "Không tìm thấy câu hỏi" as const };
  return { success: true as const, question };
}

export async function updateQuestionAction(formData: FormData) {
  const { error: authError } = await requireAdminPermission("questions.manage");
  if (authError) return { error: authError };

  const id = formData.get("id") as string;
  if (!id) return { error: "Thiếu ID câu hỏi" };

  const existing = await db.question.findUnique({ where: { id } });
  if (!existing) return { error: "Không tìm thấy câu hỏi" };

  const parsed = questionSchema.safeParse({
    type: formData.get("type"),
    level: formData.get("level"),
    skill: formData.get("skill"),
    title: formData.get("title") || undefined,
    content: formData.get("content"),
    correctAnswer: formData.get("correctAnswer") || undefined,
    points: formData.get("points") || undefined,
    audioUrl: formData.get("audioUrl") || undefined,
  });

  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const contentResult = parseQuestionJsonField(parsed.data.content, "Nội dung");
  if (!contentResult.ok) return { error: contentResult.error };

  const correctAnswerRaw = (formData.get("correctAnswer") as string | null)?.trim() ?? "";
  let correctAnswer: Prisma.InputJsonValue | typeof Prisma.JsonNull =
    existing.correctAnswer ?? Prisma.JsonNull;
  if (correctAnswerRaw) {
    try {
      correctAnswer = JSON.parse(correctAnswerRaw) as Prisma.InputJsonValue;
    } catch {
      return { error: "Đáp án JSON không hợp lệ" };
    }
  }

  const audioUrlRaw = formData.get("audioUrl") as string | null;
  const audioUrl =
    audioUrlRaw !== null && audioUrlRaw.trim() !== ""
      ? audioUrlRaw.trim()
      : audioUrlRaw !== null && audioUrlRaw.trim() === ""
        ? null
        : existing.audioUrl;

  const titleRaw = formData.get("title") as string | null;
  const title =
    titleRaw !== null ? titleRaw.trim() || null : existing.title;

  try {
    await db.question.update({
      where: { id },
      data: {
        type: parsed.data.type as QuestionType,
        level: parsed.data.level as ExamLevel,
        skill: parsed.data.skill as Skill,
        title,
        content: contentResult.value,
        correctAnswer,
        points: parsed.data.points ?? existing.points,
        audioUrl,
      },
    });
    await revalidateQuestionPaths(id);
    return { success: true };
  } catch {
    return { error: "Không thể cập nhật câu hỏi. Kiểm tra JSON content." };
  }
}

export async function startAttemptAction(paperId: string) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const paper = await db.examPaper.findUnique({
    where: { id: paperId, published: true },
  });
  if (!paper) return { error: "Không tìm thấy đề" };

  const isPool = isDynamicPoolPaper(paper);
  const includeAnswers = shouldIncludeCorrectAnswerForPoolPaper(paper);

  const existing = await db.attempt.findFirst({
    where: {
      userId: session.user.id,
      paperId,
      status: "IN_PROGRESS",
    },
    include: { answers: true },
    orderBy: { startedAt: "desc" },
  });

  if (paper.paperKind === PaperKind.PRACTICE && session.user.id && !existing) {
    const { canUsePractice } = await import("@/lib/subscription/service");
    const additional = isDynamicPracticePaper(paper) ? PRACTICE_POOL_SIZE : 1;
    const allowed = await canUsePractice(session.user.id, additional);
    if (!allowed) {
      return { error: formatPracticeQuotaExceededMessage() };
    }
  }

  if (paper.paperKind === PaperKind.MOCK_FULL && session.user.id && !existing) {
    const { getUserPlanId } = await import("@/lib/subscription/service");
    const planId = await getUserPlanId(session.user.id);
    if (!hasFullMockAccess(planId)) {
      return { error: formatFullMockUpgradeMessage() };
    }
    const { canUseMockTest } = await import("@/lib/subscription/service");
    const allowed = await canUseMockTest(session.user.id);
    if (!allowed) {
      return { error: formatMockTestQuotaExceededMessage() };
    }
  }

  if (paper.paperKind === PaperKind.MOCK_SKILL && session.user.id && !existing) {
    const { canUseMockTest } = await import("@/lib/subscription/service");
    const allowed = await canUseMockTest(session.user.id);
    if (!allowed) {
      return { error: formatMockTestQuotaExceededMessage() };
    }
  }

  if (existing) {
    const savedAnswers: Record<string, unknown> = {};
    for (const a of existing.answers) {
      savedAnswers[a.questionId] = a.answer;
    }

    if (isPool) {
      try {
        await assignDynamicExamQuestionsForAttempt(db, existing.id);
        const questions = await loadAttemptPracticeQuestions(db, existing.id, includeAnswers);
        return { attemptId: existing.id, resumed: true, savedAnswers, questions };
      } catch {
        return { error: "Không thể tải câu hỏi cho bài thi" };
      }
    }

    return { attemptId: existing.id, resumed: true, savedAnswers };
  }

  const attempt = await db.attempt.create({
    data: {
      userId: session.user.id,
      paperId,
      status: "IN_PROGRESS",
    },
  });

  if (
    (paper.paperKind === PaperKind.MOCK_SKILL || paper.paperKind === PaperKind.MOCK_FULL) &&
    session.user.id
  ) {
    const { recordMockTestUsage } = await import("@/lib/subscription/service");
    const recorded = await recordMockTestUsage(session.user.id);
    if (!recorded.ok) {
      await db.attempt.delete({ where: { id: attempt.id } });
      return { error: recorded.error };
    }
  }

  await updateUserStreak(session.user.id);

  if (isPool) {
    try {
      await assignDynamicExamQuestionsForAttempt(db, attempt.id);
      const questions = await loadAttemptPracticeQuestions(db, attempt.id, includeAnswers);
      return { attemptId: attempt.id, resumed: false, savedAnswers: {}, questions };
    } catch (e) {
      await db.attempt.delete({ where: { id: attempt.id } });
      const msg = e instanceof Error ? e.message : "Không thể bắt đầu bài thi";
      return { error: msg };
    }
  }

  return { attemptId: attempt.id, resumed: false, savedAnswers: {} };
}

export async function submitAttemptAction(
  attemptId: string,
  answers: Record<string, unknown>,
  timeSpent?: number
) {
  const session = await auth();

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: {
        include: {
          questions: {
            include: { question: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      attemptQuestions: {
        include: { question: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!attempt) {
    return { error: "Bài làm không hợp lệ" };
  }

  const earlyFinalized =
    (attempt.status === "SUBMITTED" || attempt.status === "GRADED") && !attempt.submittedAt;

  if (attempt.status !== "IN_PROGRESS" && !earlyFinalized) {
    if (
      attempt.userId &&
      session?.user?.id === attempt.userId &&
      (attempt.status === "SUBMITTED" || attempt.status === "GRADED")
    ) {
      return { attemptId, alreadySubmitted: true };
    }
    return { error: "Bài làm không hợp lệ" };
  }

  if (attempt.userId) {
    if (!session || session.user.id !== attempt.userId) {
      return { error: "Không có quyền nộp bài này" };
    }
  } else if (attempt.paper.paperKind !== PaperKind.PLACEMENT) {
    return { error: "Bài làm khách chỉ áp dụng cho placement test" };
  }

  let totalScore = 0;
  let maxScore = 0;
  const needsAI: string[] = [];
  const skillStats = new Map<Skill, { correct: number; total: number }>();

  const questionRows =
    usesAttemptQuestionSet(attempt.paper) && attempt.attemptQuestions.length > 0
      ? attempt.attemptQuestions.map((aq) => aq.question)
      : attempt.paper.questions.map((pq) => pq.question);

  for (const q of questionRows) {
    const studentAnswer = answers[q.id];
    maxScore += q.points;

    if (q.type === "FREE_TEXT" || q.type === "SPEAKING_PROMPT") {
      needsAI.push(q.id);
      await db.attemptAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: q.id } },
        create: {
          attemptId,
          questionId: q.id,
          answer: studentAnswer ?? "",
          isCorrect: null,
          score: null,
        },
        update: { answer: studentAnswer ?? "" },
      });
      continue;
    }

    const result = gradeObjectiveAnswer(q.type, q.correctAnswer, studentAnswer);
    const score = result.score * q.points;
    totalScore += score;

    const stat = skillStats.get(q.skill) ?? { correct: 0, total: 0 };
    stat.total += 1;
    if (result.isCorrect) stat.correct += 1;
    skillStats.set(q.skill, stat);

    await db.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: q.id } },
      create: {
        attemptId,
        questionId: q.id,
        answer: studentAnswer ?? "",
        isCorrect: result.isCorrect,
        score,
      },
      update: {
        answer: studentAnswer ?? "",
        isCorrect: result.isCorrect,
        score,
      },
    });
  }

  const status = needsAI.length > 0 ? "SUBMITTED" : "GRADED";

  let placementReport = undefined;
  if (attempt.paper.paperKind === PaperKind.PLACEMENT) {
    const skillResults = Array.from(skillStats.entries()).map(([skill, s]) => ({
      skill,
      correct: s.correct,
      total: s.total,
      percent: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }));
    const track = inferTrackFromPaperTitle(attempt.paper.title);
    placementReport = evaluatePlacement(skillResults, track);
  }

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      status,
      score: totalScore,
      maxScore,
      submittedAt: new Date(),
      timeSpent,
      ...(attempt.paper.paperKind === PaperKind.PLACEMENT && placementReport
        ? { placementReport: placementReport as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });

  if (status === "GRADED" && session?.user?.id) {
    await markAssignmentsComplete(session.user.id, attempt.paperId);
    await updateUserStreak(session.user.id);
  }

  let gamification = null;
  if (status === "GRADED" && attempt.userId) {
    gamification = await processAttemptGamification(attemptId);
  }

  revalidatePath("/dashboard");
  revalidatePath("/placement");
  revalidatePath("/admin/placement");
  revalidatePath(`/placement/results/${attemptId}`);
  revalidatePath("/exams", "layout");
  if (attempt.userId) {
    revalidateTag(`user-progress-${attempt.userId}`);
  }
  return { attemptId, needsAI, score: totalScore, maxScore, placementReport, gamification };
}

export async function assignPaperAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || !["TEACHER", "ADMIN"].includes(session.user.role)) {
    return;
  }

  const paperId = formData.get("paperId") as string;
  const studentId = formData.get("studentId") as string;
  const dueDate = formData.get("dueDate") as string;

  await db.assignment.create({
    data: {
      paperId,
      teacherId: session.user.id,
      studentId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/teacher");
}

export async function createPaperAction(formData: FormData) {
  const { error: authError } = await requireAdminPermission("papers.manage");
  if (authError) return { error: authError };

  const parsed = paperSchema.safeParse(parsePaperFormData(formData));

  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const paperKind = (parsed.data.paperKind ?? "PRACTICE") as PaperKind;
  const defaults = paperKindDefaults(paperKind);
  const sections = parseSectionsJson(parsed.data.sections);

  const paper = await db.examPaper.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      level: parsed.data.level as ExamLevel,
      skill: parsed.data.skill as Skill,
      timeLimit: parsed.data.timeLimit,
      isMockTest: parsed.data.isMockTest ?? defaults.isMockTest,
      published: parsed.data.published ?? true,
      paperKind,
      sections,
    },
  });

  revalidatePath("/admin/papers");
  revalidatePath("/placement");
  revalidatePath("/exams", "layout");
  revalidatePath("/dashboard");
  revalidatePaperCache(parsed.data.level as ExamLevel);
  return { success: true, paperId: paper.id };
}

export async function updatePaperAction(formData: FormData) {
  const { error: authError } = await requireAdminPermission("papers.manage");
  if (authError) return { error: authError };

  const id = formData.get("id") as string;
  if (!id) return { error: "Thiếu ID đề thi" };

  const existing = await db.examPaper.findUnique({ where: { id } });
  if (!existing) return { error: "Không tìm thấy đề thi" };

  const parsed = paperSchema.safeParse(parsePaperFormData(formData));
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const paperKind = (parsed.data.paperKind ?? existing.paperKind) as PaperKind;
  const defaults = paperKindDefaults(paperKind);

  const sectionsRaw = (formData.get("sections") as string | null)?.trim() ?? "";
  const sectionsUpdate = sectionsRaw ? parseSectionsJson(sectionsRaw) : undefined;

  await db.examPaper.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      level: parsed.data.level as ExamLevel,
      skill: parsed.data.skill as Skill,
      timeLimit: parsed.data.timeLimit ?? existing.timeLimit,
      isMockTest: parsed.data.isMockTest ?? defaults.isMockTest,
      published: parsed.data.published ?? existing.published,
      paperKind,
      ...(sectionsUpdate !== undefined && { sections: sectionsUpdate }),
    },
  });

  revalidatePath("/admin/papers");
  revalidatePath("/placement");
  revalidatePath("/exams", "layout");
  revalidatePath("/dashboard");
  revalidatePaperCache(existing.level);
  if (parsed.data.level !== existing.level) {
    revalidatePaperCache(parsed.data.level as ExamLevel);
  }
  return { success: true };
}

export async function addQuestionToPaperAction(paperId: string, questionId: string) {
  const { error: authError } = await requireAdminPermission("papers.manage");
  if (authError) return { error: authError };

  const count = await db.paperQuestion.count({ where: { paperId } });
  await db.paperQuestion.upsert({
    where: { paperId_questionId: { paperId, questionId } },
    create: { paperId, questionId, orderIndex: count },
    update: {},
  });

  revalidatePath("/admin/papers");
  return { success: true };
}

export async function removeQuestionFromPaperAction(paperQuestionId: string) {
  const { error: authError } = await requireAdminPermission("papers.manage");
  if (authError) return { error: authError };

  await db.paperQuestion.delete({ where: { id: paperQuestionId } });
  revalidatePath("/admin/papers");
  return { success: true };
}

export async function movePaperQuestionAction(
  paperQuestionId: string,
  direction: "up" | "down"
) {
  const { error: authError } = await requireAdminPermission("papers.manage");
  if (authError) return { error: authError };

  const current = await db.paperQuestion.findUnique({
    where: { id: paperQuestionId },
  });
  if (!current) return { error: "Không tìm thấy câu trong đề" };

  const siblings = await db.paperQuestion.findMany({
    where: { paperId: current.paperId },
    orderBy: { orderIndex: "asc" },
  });

  const idx = siblings.findIndex((s) => s.id === paperQuestionId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

  const other = siblings[swapIdx];
  await db.$transaction([
    db.paperQuestion.update({
      where: { id: current.id },
      data: { orderIndex: other.orderIndex },
    }),
    db.paperQuestion.update({
      where: { id: other.id },
      data: { orderIndex: current.orderIndex },
    }),
  ]);

  revalidatePath("/admin/papers");
  return { success: true };
}

export async function deletePaperAction(paperId: string) {
  const { error: authError } = await requireAdminPermission("papers.manage");
  if (authError) return { error: authError };

  const paper = await db.examPaper.findUnique({
    where: { id: paperId },
    select: { level: true },
  });

  await db.examPaper.delete({ where: { id: paperId } });
  revalidatePath("/admin/papers");
  revalidatePath("/exams", "layout");
  if (paper) revalidatePaperCache(paper.level);
  return { success: true };
}
