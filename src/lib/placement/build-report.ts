import { PaperKind, Prisma, PrismaClient, Skill } from "@prisma/client";
import { evaluatePlacement, type PlacementReport } from "./evaluate";

export function inferTrackFromPaperTitle(
  title: string
): "YLE" | "SECONDARY" | "ADULT" {
  if (title.includes("YLE")) return "YLE";
  if (title.includes("Adult")) return "ADULT";
  return "SECONDARY";
}

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

  const skillStats = new Map<Skill, { correct: number; total: number }>();

  for (const answer of attempt.answers) {
    const q = answer.question;
    if (q.type === "FREE_TEXT" || q.type === "SPEAKING_PROMPT") continue;

    const stat = skillStats.get(q.skill) ?? { correct: 0, total: 0 };
    stat.total += 1;
    if (answer.isCorrect) stat.correct += 1;
    skillStats.set(q.skill, stat);
  }

  const skillResults = Array.from(skillStats.entries()).map(([skill, s]) => ({
    skill,
    correct: s.correct,
    total: s.total,
    percent: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
  }));

  return evaluatePlacement(
    skillResults,
    inferTrackFromPaperTitle(attempt.paper.title)
  );
}

export async function ensurePlacementReport(
  db: PrismaClient,
  attemptId: string,
  existing: unknown
): Promise<PlacementReport | null> {
  if (existing && typeof existing === "object" && "cefrLevel" in (existing as object)) {
    return existing as PlacementReport;
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
