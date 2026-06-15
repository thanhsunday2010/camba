import { PrismaClient, ExamLevel } from "@prisma/client";
import { getCuratedLevelData } from "./curated";
import { expandLevelBank } from "./expand-bank";
import {
  computeRequiredPoolSizes,
  getPracticePaperCounts,
  MOCK_FULL_PAPERS_PER_LEVEL,
  MOCK_SKILL_PAPERS_PER_SKILL,
  PRACTICE_PAPERS_PER_LEVEL,
} from "./seed-targets";
import { seedBulkLevel } from "./helpers";

export const ALL_LEVELS: ExamLevel[] = [
  "STARTERS",
  "MOVERS",
  "FLYERS",
  "KET",
  "PET",
  "FCE",
];

function mockPaperCount(level: ExamLevel) {
  const practice = getPracticePaperCounts(level);
  const skillMocks =
    MOCK_SKILL_PAPERS_PER_SKILL *
    (practice.uoe > 0 ? 5 : 4);
  return PRACTICE_PAPERS_PER_LEVEL + skillMocks + MOCK_FULL_PAPERS_PER_LEVEL;
}

export async function seedAllBulkContent(db: PrismaClient) {
  for (const level of ALL_LEVELS) {
    const curated = getCuratedLevelData(level);
    const expanded = expandLevelBank(level, curated);
    const required = computeRequiredPoolSizes(level);
    const totalQuestions =
      required.reading +
      required.listening +
      required.writing +
      required.speaking +
      required.uoe;

    console.log(
      `  → ${level} (${totalQuestions} câu · ${mockPaperCount(level)} đề: 100 luyện tập + mock kỹ năng + ${MOCK_FULL_PAPERS_PER_LEVEL} full)...`
    );

    await seedBulkLevel(db, level, expanded);
  }

  // Placement tests: `npm run content:reseed-placement` hoặc tự seed trong db:seed
}
