import { PrismaClient } from "@prisma/client";
import { clearAllPlacementTests } from "../prisma/seed/clear-placement";
import { seedPlacementTests } from "../prisma/seed/helpers";

const db = new PrismaClient();

async function main() {
  console.log("Xóa placement test cũ và tạo lại...\n");
  await clearAllPlacementTests(db);
  await seedPlacementTests(db);

  const papers = await db.examPaper.findMany({
    where: { paperKind: "PLACEMENT", published: true },
    select: { title: true, timeLimit: true, _count: { select: { questions: true } } },
    orderBy: { title: "asc" },
  });

  console.log("\nHoàn tất:");
  for (const paper of papers) {
    console.log(
      `  • ${paper.title} — ${paper._count.questions} câu · ${(paper.timeLimit ?? 0) / 60} phút`
    );
  }
}

main()
  .catch((e) => {
    console.error("\nLỗi:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
