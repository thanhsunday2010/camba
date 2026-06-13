import { PrismaClient } from "@prisma/client";
import { clearAllPlacementTests } from "../prisma/seed/clear-placement";

const db = new PrismaClient();

async function main() {
  console.log("Xóa toàn bộ placement test cũ...\n");
  await clearAllPlacementTests(db);
}

main()
  .catch((e) => {
    console.error("\nLỗi:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
