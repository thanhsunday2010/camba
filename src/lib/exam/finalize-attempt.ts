import { db } from "@/lib/db";
import { AttemptStatus } from "@prisma/client";
import { markAssignmentsComplete } from "@/lib/exam/assignments";
import { updateUserStreak } from "@/lib/ai/rate-limit";

export async function finalizeAttemptGrading(attemptId: string) {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: { include: { question: true } },
    },
  });

  if (!attempt) return;

  const allGraded = attempt.answers.every((a) => a.score !== null);
  const totalScore = attempt.answers.reduce((s, a) => s + (a.score ?? 0), 0);
  const maxScore = attempt.answers.reduce((s, a) => s + a.question.points, 0);

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      score: totalScore,
      maxScore,
      status: allGraded ? AttemptStatus.GRADED : AttemptStatus.SUBMITTED,
    },
  });

  if (allGraded && attempt.userId) {
    await markAssignmentsComplete(attempt.userId, attempt.paperId);
    await updateUserStreak(attempt.userId);
  }
}
