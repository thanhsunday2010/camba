import { unstable_cache } from "next/cache";
import { AttemptStatus, type ExamLevel } from "@prisma/client";
import { db } from "@/lib/db";

async function fetchCompletedPaperIds(userId: string, level?: ExamLevel): Promise<string[]> {
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

  return attempts.map((a) => a.paperId);
}

/** Paper IDs the user has submitted at least once (graded or awaiting AI). */
export async function getCompletedPaperIdsForUser(
  userId: string,
  level?: ExamLevel
): Promise<Set<string>> {
  const ids = await unstable_cache(
    () => fetchCompletedPaperIds(userId, level),
    [`user-completed-papers-${userId}-${level ?? "all"}`],
    { revalidate: 120, tags: [`user-progress-${userId}`] }
  )();

  return new Set(ids);
}
