import { AttemptStatus, type ExamLevel } from "@prisma/client";
import { db } from "@/lib/db";

/** Paper IDs the user has submitted at least once (graded or awaiting AI). */
export async function getCompletedPaperIdsForUser(
  userId: string,
  level?: ExamLevel
): Promise<Set<string>> {
  const attempts = await db.attempt.findMany({
    where: {
      userId,
      status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
      submittedAt: { not: null },
      ...(level ? { paper: { level } } : {}),
    },
    select: { paperId: true },
    distinct: ["paperId"],
  });

  return new Set(attempts.map((a) => a.paperId));
}
