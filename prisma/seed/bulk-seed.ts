import { PrismaClient, ExamLevel } from "@prisma/client";
import {
  generateListening,
  generateReading,
  generateSpeaking,
  generateUoe,
  generateWriting,
  questionCounts,
} from "./generators/bulk-data";
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
    await seedBulkLevel(db, level, {
      reading: generateReading(level, counts.reading),
      listening: generateListening(level, counts.listening),
      writing: generateWriting(level, counts.writing),
      speaking: generateSpeaking(level, counts.speaking),
      uoe: generateUoe(level, counts.uoe),
    });
  }

  // Placement tests: import via `npm run content:import-placement`
}
