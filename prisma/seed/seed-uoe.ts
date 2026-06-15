import { ExamLevel, PaperKind, PrismaClient, Skill } from "@prisma/client";
import { expandLevelBank } from "./expand-bank";
import { getCuratedLevelData } from "./curated";
import {
  createGaps,
  createPaper,
} from "./helpers";
import {
  getPracticePaperCounts,
  PRACTICE_QUESTIONS_PER_PAPER,
} from "./seed-targets";

const UOE_LEVELS: ExamLevel[] = ["KET", "PET", "FCE"];

function takeFromPool<T>(pool: T[], cursor: number, count: number): T[] {
  return pool.slice(cursor, cursor + count);
}

/** Seed chỉ đề Grammar & UoE practice (bỏ qua nếu level đã có đủ). */
export async function seedUoePracticeForLevels(db: PrismaClient, levels = UOE_LEVELS) {
  for (const level of levels) {
    const existing = await db.examPaper.count({
      where: {
        level,
        skill: Skill.USE_OF_ENGLISH,
        paperKind: PaperKind.PRACTICE,
      },
    });

    const target = getPracticePaperCounts(level).uoe;
    if (target === 0) continue;
    if (existing >= target) {
      console.log(`  → ${level} UoE: đã có ${existing} đề practice, bỏ qua.`);
      continue;
    }

    const curated = getCuratedLevelData(level);
    const expanded = expandLevelBank(level, curated);
    let cursor = 0;

    for (let i = existing; i < target; i++) {
      const items = takeFromPool(
        expanded.uoe,
        cursor,
        PRACTICE_QUESTIONS_PER_PAPER.uoe
      );
      if (items.length < PRACTICE_QUESTIONS_PER_PAPER.uoe) {
        throw new Error(`${level} UoE: thiếu câu trong bank (${items.length})`);
      }
      cursor += items.length;
      const ids = await createGaps(db, level, items);
      await createPaper(
        db,
        level,
        Skill.USE_OF_ENGLISH,
        `${level} Grammar & UoE Practice ${i + 1}`,
        ids,
        { description: "Ngữ pháp & Use of English", timeLimit: 900 }
      );
    }

    console.log(`  ✓ ${level} UoE: thêm ${target - existing} đề practice (tổng ${target}).`);
  }
}

export async function seedUoePracticeOnly(db: PrismaClient) {
  console.log("Seed Grammar & UoE practice (KET / PET / FCE)…\n");
  await seedUoePracticeForLevels(db);
}
