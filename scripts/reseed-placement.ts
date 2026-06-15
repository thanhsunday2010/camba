import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { clearAllPlacementTests } from "../prisma/seed/clear-placement";
import { seedPlacementTests } from "../prisma/seed/helpers";

// Shell env (e.g. local stub) must not override project .env for seed scripts
config({ override: true });
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const db = new PrismaClient();

async function main() {
  console.log("Xóa placement test cũ và tạo lại...\n");
  await clearAllPlacementTests(db);
  await seedPlacementTests(db);

  const papers = await db.examPaper.findMany({
    where: { paperKind: "PLACEMENT", published: true },
    select: { title: true, timeLimit: true, placementSlug: true },
    orderBy: { title: "asc" },
  });

  console.log("\nHoàn tất:");
  for (const paper of papers) {
    const bankCount = paper.placementSlug
      ? await db.question.count({ where: { placementSlug: paper.placementSlug } })
      : 0;
    console.log(
      `  • ${paper.title} — bank ${bankCount} câu · ${(paper.timeLimit ?? 0) / 60} phút/lượt`
    );
  }
}

main()
  .catch((e) => {
    console.error("\nLỗi:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
