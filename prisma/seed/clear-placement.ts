import { PaperKind, PrismaClient } from "@prisma/client";

export async function clearAllPlacementTests(db: PrismaClient) {
  const papers = await db.examPaper.findMany({
    where: { paperKind: PaperKind.PLACEMENT },
    include: { questions: { select: { questionId: true } } },
  });

  if (papers.length === 0) {
    console.log("Không có đề placement nào trong DB.");
    return { papers: 0, questions: 0 };
  }

  const questionIds = [
    ...new Set(papers.flatMap((p) => p.questions.map((pq) => pq.questionId))),
  ];

  const deleted = await db.examPaper.deleteMany({
    where: { paperKind: PaperKind.PLACEMENT },
  });

  let removedQuestions = 0;
  for (const questionId of questionIds) {
    const stillUsed = await db.paperQuestion.count({ where: { questionId } });
    if (stillUsed === 0) {
      await db.question.delete({ where: { id: questionId } });
      removedQuestions++;
    }
  }

  console.log(
    `Đã xóa ${deleted.count} đề placement và ${removedQuestions} câu hỏi (kèm mọi attempt liên quan).`
  );

  return { papers: deleted.count, questions: removedQuestions };
}
