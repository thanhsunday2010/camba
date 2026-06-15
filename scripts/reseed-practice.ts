import { PrismaClient, PaperKind } from "@prisma/client";
import { seedAllBulkContent } from "../prisma/seed/bulk-seed";

const db = new PrismaClient();

async function main() {
  console.log("Reseeding practice & mock content (keeping PLACEMENT papers)...\n");

  const placementPapers = await db.examPaper.findMany({
    where: { paperKind: PaperKind.PLACEMENT },
    select: { id: true },
  });
  const placementIds = new Set(placementPapers.map((p) => p.id));

  const placementQuestionLinks = await db.paperQuestion.findMany({
    where: { paperId: { in: [...placementIds] } },
    select: { questionId: true },
  });
  const keepQuestionIds = new Set(placementQuestionLinks.map((l) => l.questionId));

  // Placement bank: câu gắn placementSlug (không qua PaperQuestion trên template)
  const placementBankQuestions = await db.question.findMany({
    where: { placementSlug: { not: null } },
    select: { id: true },
  });
  for (const q of placementBankQuestions) {
    keepQuestionIds.add(q.id);
  }

  // Giữ câu đang gắn attempt placement (kể cả IN_PROGRESS)
  const activePlacementAttemptQuestions = await db.attemptQuestion.findMany({
    where: {
      attempt: {
        paper: { paperKind: PaperKind.PLACEMENT },
      },
    },
    select: { questionId: true },
  });
  for (const aq of activePlacementAttemptQuestions) {
    keepQuestionIds.add(aq.questionId);
  }

  const nonPlacementPapers = await db.examPaper.findMany({
    where: { paperKind: { not: PaperKind.PLACEMENT } },
    select: { id: true },
  });
  const deletePaperIds = nonPlacementPapers.map((p) => p.id);

  if (deletePaperIds.length > 0) {
    await db.assignment.deleteMany({ where: { paperId: { in: deletePaperIds } } });
    await db.attempt.deleteMany({ where: { paperId: { in: deletePaperIds } } });
    await db.paperQuestion.deleteMany({ where: { paperId: { in: deletePaperIds } } });
    await db.examPaper.deleteMany({ where: { id: { in: deletePaperIds } } });
  }

  const allQuestions = await db.question.findMany({ select: { id: true } });
  const orphanIds = allQuestions.map((q) => q.id).filter((id) => !keepQuestionIds.has(id));
  if (orphanIds.length > 0) {
    await db.question.deleteMany({ where: { id: { in: orphanIds } } });
  }

  console.log(`Removed ${deletePaperIds.length} practice/mock papers, ${orphanIds.length} questions.`);
  console.log(
    `Kept ${placementPapers.length} placement papers, ${keepQuestionIds.size} câu placement (bank + attempt).\n`
  );

  await seedAllBulkContent(db);

  const [papers, questions] = await Promise.all([
    db.examPaper.count({ where: { paperKind: { not: PaperKind.PLACEMENT } } }),
    db.question.count(),
  ]);

  console.log(`\nDone. ${papers} practice/mock papers, ${questions} total questions in DB.`);
  console.log("Chạy: npm run audio:generate — cập nhật file MP3 listening nếu cần.");
}

main()
  .catch((e) => {
    console.error("\nReseed failed:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
