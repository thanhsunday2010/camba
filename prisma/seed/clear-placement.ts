import { PaperKind, PrismaClient } from "@prisma/client";

type DeletePlacementOpts = {
  /** Xóa đề có title chứa một trong các chuỗi này */
  titleIncludes?: string[];
  /** Giữ lại đề có title chứa một trong các chuỗi này */
  titleExcludes?: string[];
};

export async function deletePlacementPapers(
  db: PrismaClient,
  opts: DeletePlacementOpts
): Promise<{ papers: number; questions: number }> {
  const all = await db.examPaper.findMany({
    where: { paperKind: PaperKind.PLACEMENT },
    include: { questions: { select: { questionId: true } } },
  });

  const toDelete = all.filter((paper) => {
    const title = paper.title;
    if (opts.titleExcludes?.some((ex) => title.includes(ex))) return false;
    if (!opts.titleIncludes?.length) return true;
    return opts.titleIncludes.some((inc) => title.includes(inc));
  });

  if (toDelete.length === 0) {
    console.log("Không có đề placement nào khớp điều kiện xóa.");
    return { papers: 0, questions: 0 };
  }

  const questionIds = [
    ...new Set(toDelete.flatMap((p) => p.questions.map((pq) => pq.questionId))),
  ];

  const deleted = await db.examPaper.deleteMany({
    where: { id: { in: toDelete.map((p) => p.id) } },
  });

  let removedQuestions = 0;
  for (const questionId of questionIds) {
    const stillUsed = await db.paperQuestion.count({ where: { questionId } });
    if (stillUsed === 0) {
      await db.question.delete({ where: { id: questionId } });
      removedQuestions++;
    }
  }

  for (const p of toDelete) {
    console.log(`  ✗ ${p.title}`);
  }
  console.log(
    `Đã xóa ${deleted.count} đề placement và ${removedQuestions} câu hỏi.`
  );

  return { papers: deleted.count, questions: removedQuestions };
}

/** Xóa bản YLE/Secondary cũ, giữ production v1 + Adult */
export async function pruneLegacyPlacementPapers(db: PrismaClient) {
  return deletePlacementPapers(db, {
    titleIncludes: ["Secondary", "YLE Comprehensive", "Starters - Movers - Flyers"],
    titleExcludes: ["Cambridge YLE Placement Test"],
  });
}

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
