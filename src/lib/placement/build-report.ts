import { PaperKind, Prisma, PrismaClient, QuestionType, Skill } from "@prisma/client";
import { evaluatePlacement, type PlacementReport } from "./evaluate";
import { IELTS_SKILLS } from "./ielts-formats";
import { inferTrackFromPaperTitle } from "./paper-titles";

export { inferTrackFromPaperTitle } from "./paper-titles";

export async function buildPlacementReportForAttempt(
  db: PrismaClient,
  attemptId: string
): Promise<PlacementReport | null> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      answers: { include: { question: true } },
    },
  });

  if (!attempt || attempt.paper.paperKind !== PaperKind.PLACEMENT) {
    return null;
  }

  const track = inferTrackFromPaperTitle(attempt.paper.title);
  const aiFeedbacks = await db.aIFeedback.findMany({
    where: { attemptId },
    select: { questionId: true, overallScore: true },
  });
  const feedbackByQuestion = new Map(
    aiFeedbacks.map((f) => [f.questionId, f.overallScore ?? 0])
  );

  const skillStats = new Map<Skill, { correct: number; total: number }>();

  for (const answer of attempt.answers) {
    const q = answer.question;

    if (q.type === QuestionType.FREE_TEXT || q.type === QuestionType.SPEAKING_PROMPT) {
      const aiScore = feedbackByQuestion.get(q.id);
      const percent =
        aiScore ??
        (answer.score !== null && q.points > 0
          ? Math.round((answer.score / q.points) * 100)
          : null);
      if (percent === null) continue;

      const stat = skillStats.get(q.skill) ?? { correct: 0, total: 0 };
      stat.total += 1;
      stat.correct += percent;
      skillStats.set(q.skill, stat);
      continue;
    }

    const stat = skillStats.get(q.skill) ?? { correct: 0, total: 0 };
    stat.total += 1;
    if (answer.isCorrect) stat.correct += 1;
    skillStats.set(q.skill, stat);
  }

  const skillResults = Array.from(skillStats.entries()).map(([skill, s]) => {
    const isAiAverage = skill === Skill.WRITING || skill === Skill.SPEAKING;
    const percent =
      s.total > 0
        ? isAiAverage
          ? Math.round(s.correct / s.total)
          : Math.round((s.correct / s.total) * 100)
        : 0;
    return {
      skill,
      correct: s.correct,
      total: s.total,
      percent,
    };
  });

  return evaluatePlacement(skillResults, track);
}

export async function ensurePlacementReport(
  db: PrismaClient,
  attemptId: string,
  existing: unknown
): Promise<PlacementReport | null> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { paper: true },
  });
  if (!attempt) return null;

  const track = inferTrackFromPaperTitle(attempt.paper.title);
  const cached =
    existing && typeof existing === "object" && "cefrLevel" in (existing as object)
      ? (existing as PlacementReport)
      : null;

  if (track !== "IELTS" && track !== "YLE" && track !== "SECONDARY" && cached) {
    return cached;
  }

  if (track === "IELTS" && cached) {
    const hasAllSkills = IELTS_SKILLS.every((sk) =>
      cached.skills.some((s) => s.skill === sk && s.total > 0)
    );
    if (hasAllSkills) return cached;
  }

  const report = await buildPlacementReportForAttempt(db, attemptId);
  if (!report) return null;

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      placementReport: report as unknown as Prisma.InputJsonValue,
    },
  });

  return report;
}
