import { PrismaClient } from "@prisma/client";
import { pruneLegacyPlacementPapers } from "../prisma/seed/clear-placement";

const db = new PrismaClient();

async function main() {
  console.log("Xóa placement legacy (giữ đề Camba Placement — hiện hành)...\n");
  await pruneLegacyPlacementPapers(db);
}

main()
  .catch((e) => {
    console.error("\nLỗi:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
