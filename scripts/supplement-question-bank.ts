/**
 * Bổ sung ngân hàng câu hỏi luyện/mock pool đến tối thiểu MIN_POOL câu / kỹ năng / level.
 * Câu đã >= MIN_POOL giữ nguyên.
 *
 * Usage: npm run content:supplement-bank [-- --dry-run] [-- --min=200]
 */
import "dotenv/config";
import { ExamLevel, PrismaClient, Skill } from "@prisma/client";
import {
  generateListening,
  generateReading,
  generateSpeaking,
  generateUoe,
  generateWriting,
} from "../prisma/seed/generators/bulk-data";
import {
  createGaps,
  createListenings,
  createMcqs,
  createSpeakings,
  createWritings,
} from "../prisma/seed/helpers";
import { buildPracticePoolKey, buildMockSkillPoolKey } from "../src/lib/exam/practice-pool";
import { PRACTICE_POOL_SIZE } from "../src/lib/exam/practice-pool";

const db = new PrismaClient();

const LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
const SKILLS: Skill[] = [
  Skill.READING,
  Skill.LISTENING,
  Skill.WRITING,
  Skill.SPEAKING,
  Skill.USE_OF_ENGLISH,
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const minArg = args.find((a) => a.startsWith("--min="));
const MIN_POOL = minArg ? Number(minArg.split("=")[1]) : 200;

async function countPool(level: ExamLevel, skill: Skill): Promise<number> {
  return db.question.count({
    where: { level, skill, placementSlug: null },
  });
}

async function supplementSkill(
  level: ExamLevel,
  skill: Skill,
  need: number,
  current: number
): Promise<number> {
  if (need <= 0) return 0;

  const offset = current;
  const batchSize = 50;
  let created = 0;

  while (created < need) {
    const chunk = Math.min(batchSize, need - created);
    const start = offset + created;

    if (dryRun) {
      created += chunk;
      continue;
    }

    switch (skill) {
      case Skill.READING: {
        const items = generateReading(level, chunk, start);
        const ids = await createMcqs(db, level, Skill.READING, items);
        created += ids.length;
        continue;
      }
      case Skill.LISTENING: {
        const items = generateListening(level, chunk, start);
        const ids = await createListenings(db, level, items, start);
        created += ids.length;
        continue;
      }
      case Skill.WRITING: {
        const items = generateWriting(level, chunk, start);
        const ids = await createWritings(db, level, items);
        created += ids.length;
        continue;
      }
      case Skill.SPEAKING: {
        const items = generateSpeaking(level, chunk, start);
        const ids = await createSpeakings(db, level, items);
        created += ids.length;
        continue;
      }
      case Skill.USE_OF_ENGLISH: {
        const items = generateUoe(level, chunk, start);
        const ids = await createGaps(db, level, items);
        created += ids.length;
        continue;
      }
    }
  }

  return created;
}

async function refreshPoolPaperDescriptions(level: ExamLevel, skill: Skill, poolCount: number) {
  const practiceKey = buildPracticePoolKey(level, skill);
  const mockKey = buildMockSkillPoolKey(level, skill);

  await db.examPaper.updateMany({
    where: { practicePoolKey: practiceKey },
    data: {
      description: `${PRACTICE_POOL_SIZE} câu ngẫu nhiên từ ngân hàng ${poolCount} câu — không lặp cho đến khi hết pool`,
    },
  });

  await db.examPaper.updateMany({
    where: { mockPoolKey: mockKey },
    data: {
      description: `Ngân hàng ${poolCount} câu — chọn ngẫu nhiên mỗi lần thi mock, không lặp cho đến khi hết pool`,
    },
  });
}

async function main() {
  if (!Number.isFinite(MIN_POOL) || MIN_POOL < 1) {
    console.error("--min phải là số dương");
    process.exit(1);
  }

  console.log(`\n=== Bổ sung ngân hàng (tối thiểu ${MIN_POOL} câu / kỹ năng / level) ===`);
  if (dryRun) console.log("DRY RUN — không ghi DB\n");

  let totalCreated = 0;
  const summary: string[] = [];

  for (const level of LEVELS) {
    for (const skill of SKILLS) {
      const current = await countPool(level, skill);
      const need = Math.max(0, MIN_POOL - current);

      if (need === 0) {
        console.log(`OK  ${level} ${skill}: ${current} câu`);
        continue;
      }

      console.log(`+   ${level} ${skill}: ${current} → +${need} câu`);
      const added = await supplementSkill(level, skill, need, current);
      totalCreated += added;

      if (!dryRun && added > 0) {
        const newCount = current + added;
        await refreshPoolPaperDescriptions(level, skill, newCount);
        summary.push(`${level} ${skill}: ${current} → ${newCount}`);
      }
    }
  }

  console.log(`\n${dryRun ? "Sẽ tạo" : "Đã tạo"}: ${totalCreated} câu mới`);
  if (summary.length > 0) {
    console.log("\nCập nhật pool:");
    for (const line of summary) console.log(`  · ${line}`);
  }

  if (!dryRun && totalCreated > 0) {
    console.log(
      "\nGợi ý: chạy npm run audio:generate cho file MP3 listening mới (nếu cần audio thật)."
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
