/**
 * Gộp đề luyện tập: 1 đề pool / kỹ năng / level, ẩn các đề luyện tập cũ.
 * Usage: npm run content:migrate-practice-pools
 */
import "dotenv/config";
import { PaperKind, PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function buildPracticePoolKey(level, skill) {
  return `${level}:${skill}`;
}

const LEVELS = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
const YLE = new Set(["STARTERS", "MOVERS", "FLYERS"]);

const SKILL_LABEL = {
  READING: "Reading",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
  USE_OF_ENGLISH: "Use of English",
};

const LEVEL_LABEL = {
  STARTERS: "Starters",
  MOVERS: "Movers",
  FLYERS: "Flyers",
  KET: "KET",
  PET: "PET",
  FCE: "FCE",
};

function practiceSkills(level) {
  const base = ["READING", "LISTENING", "WRITING", "SPEAKING"];
  if (!YLE.has(level)) base.push("USE_OF_ENGLISH");
  return base;
}

function practiceTimeLimit(skill) {
  if (skill === "READING") return 900;
  if (skill === "LISTENING") return 600;
  if (skill === "USE_OF_ENGLISH") return 600;
  if (skill === "WRITING") return 900;
  return 300;
}

async function main() {
  let created = 0;
  let updated = 0;
  let unpublished = 0;

  for (const level of LEVELS) {
    for (const skill of practiceSkills(level)) {
      const poolKey = buildPracticePoolKey(level, skill);
      const title = `${SKILL_LABEL[skill]} — ${LEVEL_LABEL[level]} Luyện tập`;

      const poolCount = await db.question.count({
        where: { level, skill, placementSlug: null },
      });

      const existing = await db.examPaper.findUnique({
        where: { practicePoolKey: poolKey },
      });

      if (existing) {
        await db.examPaper.update({
          where: { id: existing.id },
          data: {
            title,
            description: `10 câu ngẫu nhiên từ ngân hàng ${poolCount} câu — không lặp cho đến khi hết pool`,
            published: true,
            isMockTest: false,
            paperKind: PaperKind.PRACTICE,
            timeLimit: practiceTimeLimit(skill),
          },
        });
        updated++;
      } else {
        await db.examPaper.create({
          data: {
            title,
            description: `10 câu ngẫu nhiên từ ngân hàng ${poolCount} câu — không lặp cho đến khi hết pool`,
            level,
            skill,
            paperKind: PaperKind.PRACTICE,
            practicePoolKey: poolKey,
            published: true,
            isMockTest: false,
            timeLimit: practiceTimeLimit(skill),
          },
        });
        created++;
      }

      const result = await db.examPaper.updateMany({
        where: {
          level,
          skill,
          paperKind: PaperKind.PRACTICE,
          practicePoolKey: null,
          isMockTest: false,
        },
        data: { published: false },
      });
      unpublished += result.count;

      console.log(`${poolKey}: ngân hàng ${poolCount} câu`);
    }
  }

  console.log(`\nXong: ${created} đề pool mới · ${updated} cập nhật · ${unpublished} đề cũ ẩn`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
