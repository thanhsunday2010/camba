/**
 * Liệt kê pool luyện/mock có < MIN câu.
 * Usage: npx tsx scripts/audit-pools-below-100.ts [--min=100]
 */
import "dotenv/config";
import { ExamLevel, PrismaClient, Skill } from "@prisma/client";
import {
  CAMBRIDGE_SPEAKING_LEVELS,
  getCambridgeSpeakingParts,
} from "../src/lib/exam/cambridge-speaking-config";
import {
  CAMBRIDGE_WRITING_LEVELS,
  getCambridgeWritingParts,
} from "../src/lib/exam/cambridge-writing-config";
import {
  IELTS_SPEAKING_PARTS,
  IELTS_SPEAKING_LEVEL,
} from "../src/lib/exam/ielts-speaking-config";
import {
  IELTS_WRITING_TASKS,
  IELTS_WRITING_LEVEL,
} from "../src/lib/exam/ielts-writing-config";

const db = new PrismaClient();

const LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
const SKILLS: Skill[] = [Skill.READING, Skill.LISTENING, Skill.USE_OF_ENGLISH];

const minArg = process.argv.find((a) => a.startsWith("--min="));
const MIN = minArg ? Number(minArg.split("=")[1]) : 100;

type Gap = { key: string; current: number; need: number };

async function main() {
  const gaps: Gap[] = [];

  for (const level of LEVELS) {
    for (const skill of SKILLS) {
      const current = await db.question.count({
        where: { level, skill, placementSlug: null },
      });
      if (current < MIN) {
        gaps.push({ key: `${level} ${skill}`, current, need: MIN - current });
      }
    }
  }

  for (const level of CAMBRIDGE_SPEAKING_LEVELS) {
    for (const part of getCambridgeSpeakingParts(level)) {
      const current = await db.question.count({
        where: {
          level,
          skill: Skill.SPEAKING,
          placementSlug: null,
          AND: [
            { content: { path: ["examTrack"], equals: "CAMBRIDGE" } },
            { content: { path: ["cambridgePart"], equals: part } },
          ],
        },
      });
      if (current < MIN) {
        gaps.push({
          key: `${level} Speaking Part ${part}`,
          current,
          need: MIN - current,
        });
      }
    }
  }

  for (const part of IELTS_SPEAKING_PARTS) {
    const current = await db.question.count({
      where: {
        level: IELTS_SPEAKING_LEVEL,
        skill: Skill.SPEAKING,
        placementSlug: null,
        AND: [
          { content: { path: ["examTrack"], equals: "IELTS" } },
          { content: { path: ["ieltsPart"], equals: part } },
        ],
      },
    });
    if (current < MIN) {
      gaps.push({
        key: `IELTS Speaking Part ${part}`,
        current,
        need: MIN - current,
      });
    }
  }

  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    for (const part of getCambridgeWritingParts(level)) {
      const current = await db.question.count({
        where: {
          level,
          skill: Skill.WRITING,
          placementSlug: null,
          AND: [
            { content: { path: ["examTrack"], equals: "CAMBRIDGE" } },
            { content: { path: ["cambridgeWritingPart"], equals: part } },
          ],
        },
      });
      if (current < MIN) {
        gaps.push({
          key: `${level} Writing Part ${part}`,
          current,
          need: MIN - current,
        });
      }
    }
  }

  for (const task of IELTS_WRITING_TASKS) {
    const current = await db.question.count({
      where: {
        level: IELTS_WRITING_LEVEL,
        skill: Skill.WRITING,
        placementSlug: null,
        AND: [
          { content: { path: ["examTrack"], equals: "IELTS" } },
          { content: { path: ["ieltsWritingTask"], equals: task } },
        ],
      },
    });
    if (current < MIN) {
      gaps.push({
        key: `IELTS Writing Task ${task}`,
        current,
        need: MIN - current,
      });
    }
  }

  console.log(`\n=== Pool dưới ${MIN} câu ===\n`);
  if (gaps.length === 0) {
    console.log("Tất cả pool đã đủ.");
    return;
  }

  let total = 0;
  for (const g of gaps) {
    console.log(`  ${g.key}: ${g.current} → cần +${g.need}`);
    total += g.need;
  }
  console.log(`\nTổng cần tạo: ${total} câu (${gaps.length} pool)\n`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
