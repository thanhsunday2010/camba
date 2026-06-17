import { ContentSource, ExamLevel, PrismaClient, Skill } from "@prisma/client";
import { getCuratedLevelData } from "./curated";
import {
  createGaps,
  createListenings,
  createMcqs,
  createSpeakings,
  createWritings,
} from "./helpers";
import { PRACTICE_QUESTIONS_PER_PAPER } from "./seed-targets";

export const ALL_LEVELS: ExamLevel[] = [
  "STARTERS",
  "MOVERS",
  "FLYERS",
  "KET",
  "PET",
  "FCE",
];

const CURATED = ContentSource.CURATED;

export type CuratedBankStats = {
  level: ExamLevel;
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  uoe: number;
  maxPracticeSessions: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
    uoe: number;
  };
};

export function summarizeCuratedBank(
  level: ExamLevel,
  bank = getCuratedLevelData(level)
): CuratedBankStats {
  const qp = PRACTICE_QUESTIONS_PER_PAPER;
  return {
    level,
    reading: bank.reading.length,
    listening: bank.listening.length,
    writing: bank.writing.length,
    speaking: bank.speaking.length,
    uoe: bank.uoe.length,
    maxPracticeSessions: {
      reading: Math.floor(bank.reading.length / qp.reading),
      listening: Math.floor(bank.listening.length / qp.listening),
      writing: Math.floor(bank.writing.length / qp.writing),
      speaking: Math.floor(bank.speaking.length / qp.speaking),
      uoe: bank.uoe.length > 0 ? Math.floor(bank.uoe.length / qp.uoe) : 0,
    },
  };
}

/** Chỉ seed ngân hàng curated — không sinh câu generated, không tạo 100 đề tĩnh. */
export async function seedCuratedQuestionBank(
  db: PrismaClient,
  level: ExamLevel
): Promise<CuratedBankStats> {
  const bank = getCuratedLevelData(level);
  const stats = summarizeCuratedBank(level, bank);

  if (bank.reading.length > 0) {
    await createMcqs(db, level, Skill.READING, bank.reading, undefined, { contentSource: CURATED });
  }
  if (bank.listening.length > 0) {
    await createListenings(db, level, bank.listening, 0, undefined, { contentSource: CURATED });
  }
  if (bank.uoe.length > 0) {
    await createGaps(db, level, bank.uoe, undefined, { contentSource: CURATED });
  }
  if (bank.writing.length > 0) {
    await createWritings(db, level, bank.writing, undefined, { contentSource: CURATED });
  }
  if (bank.speaking.length > 0) {
    await createSpeakings(db, level, bank.speaking, undefined, { contentSource: CURATED });
  }

  return stats;
}
