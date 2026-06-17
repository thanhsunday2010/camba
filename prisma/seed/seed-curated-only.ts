import { PrismaClient } from "@prisma/client";
import {
  ALL_LEVELS,
  seedCuratedQuestionBank,
  summarizeCuratedBank,
} from "./seed-curated-bank";

export { ALL_LEVELS } from "./seed-curated-bank";

export async function seedAllCuratedContent(db: PrismaClient) {
  console.log("Seeding curated-only practice banks (no generated filler)…\n");

  for (const level of ALL_LEVELS) {
    const stats = await seedCuratedQuestionBank(db, level);
    const total =
      stats.reading +
      stats.listening +
      stats.writing +
      stats.speaking +
      stats.uoe;
    console.log(
      `  ✓ ${level}: ${total} câu curated (R${stats.reading} L${stats.listening} W${stats.writing} S${stats.speaking} U${stats.uoe}) · ~${stats.maxPracticeSessions.reading} lượt Reading pool`
    );
  }
}
