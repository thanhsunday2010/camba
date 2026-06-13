import { db } from "@/lib/db";

/** Mark teacher assignments complete when student finishes a paper. */
export async function markAssignmentsComplete(userId: string, paperId: string) {
  await db.assignment.updateMany({
    where: { studentId: userId, paperId, completed: false },
    data: { completed: true },
  });
}
