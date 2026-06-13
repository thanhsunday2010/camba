import { PrismaClient, ExamLevel } from "@prisma/client";
import { getCuratedLevelData } from "./curated";
import { questionCounts } from "./generators/bulk-data";
import { seedBulkLevel } from "./helpers";

export const ALL_LEVELS: ExamLevel[] = [
  "STARTERS",
  "MOVERS",
  "FLYERS",
  "KET",
  "PET",
  "FCE",
];

export async function seedAllBulkContent(db: PrismaClient) {
  for (const level of ALL_LEVELS) {
    const counts = questionCounts(level);
    console.log(
      `  → ${level} (${counts.reading + counts.listening + counts.writing + counts.speaking + counts.uoe} câu)...`
    );
    const curated = getCuratedLevelData(level);
    await seedBulkLevel(db, level, {
      reading: curated.reading,
      listening: curated.listening,
      writing: curated.writing,
      speaking: curated.speaking,
      uoe: curated.uoe,
    });
  }

  // Placement tests: import via `npm run content:import-placement`
}
