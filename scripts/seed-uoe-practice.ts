import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedUoePracticeOnly } from "../prisma/seed/seed-uoe";

config({ override: true });
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const db = new PrismaClient();

async function main() {
  await seedUoePracticeOnly(db);

  for (const level of ["KET", "PET", "FCE"] as const) {
    const count = await db.examPaper.count({
      where: { level, skill: "USE_OF_ENGLISH", paperKind: "PRACTICE" },
    });
    console.log(`  • ${level}: ${count} đề Grammar & UoE practice`);
  }
}

main()
  .catch((e) => {
    console.error("\nLỗi:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
