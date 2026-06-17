/**
 * Bổ sung pool luyện/mock lên tối thiểu MIN câu (mặc định 100) theo kỹ năng / Part / Task.
 *
 * Usage: npm run content:supplement-to-100 [-- --dry-run] [-- --min=100]
 */
import "dotenv/config";
import { ExamLevel, PrismaClient, Skill } from "@prisma/client";
import { generateUoe } from "../prisma/seed/generators/bulk-data";
import { createGaps, createSpeakings, createWritings } from "../prisma/seed/helpers";
import {
  buildSpeakingForPart,
  buildWritingForPart,
} from "../prisma/seed/part-pool-generators";
import { buildIeltsSpeakingSeeds } from "../prisma/seed/ielts-speaking-content";
import { buildIeltsWritingSeeds } from "../prisma/seed/ielts-writing-content";
import {
  CAMBRIDGE_SPEAKING_LEVELS,
  getCambridgeSpeakingParts,
} from "../src/lib/exam/cambridge-speaking-config";
import {
  CAMBRIDGE_WRITING_LEVELS,
  getCambridgeWritingParts,
} from "../src/lib/exam/cambridge-writing-config";
import {
  IELTS_SPEAKING_LEVEL,
  IELTS_SPEAKING_PARTS,
} from "../src/lib/exam/ielts-speaking-config";
import {
  IELTS_WRITING_LEVEL,
  IELTS_WRITING_TASKS,
} from "../src/lib/exam/ielts-writing-config";

const db = new PrismaClient();

const YLE_LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const minArg = args.find((a) => a.startsWith("--min="));
const MIN = minArg ? Number(minArg.split("=")[1]) : 100;

let totalCreated = 0;

async function countUoe(level: ExamLevel) {
  return db.question.count({
    where: { level, skill: Skill.USE_OF_ENGLISH, placementSlug: null },
  });
}

async function countCambridgeSpeakingPart(level: ExamLevel, part: 1 | 2 | 3) {
  return db.question.count({
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
}

async function countCambridgeWritingPart(level: ExamLevel, part: 1 | 2) {
  return db.question.count({
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
}

async function countIeltsSpeakingPart(part: 1 | 2 | 3) {
  return db.question.count({
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
}

async function countIeltsWritingTask(task: 1 | 2) {
  return db.question.count({
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
}

async function supplement(
  label: string,
  current: number,
  need: number,
  create: () => Promise<number>
) {
  if (need <= 0) {
    console.log(`OK  ${label}: ${current} câu`);
    return;
  }
  console.log(`+   ${label}: ${current} → +${need} câu`);
  if (dryRun) {
    totalCreated += need;
    return;
  }
  const added = await create();
  totalCreated += added;
}

async function main() {
  if (!Number.isFinite(MIN) || MIN < 1) {
    console.error("--min phải là số dương");
    process.exit(1);
  }

  console.log(`\n=== Bổ sung pool lên ${MIN} câu ===`);
  if (dryRun) console.log("DRY RUN — không ghi DB\n");

  for (const level of YLE_LEVELS) {
    const current = await countUoe(level);
    const need = Math.max(0, MIN - current);
    await supplement(`${level} UoE`, current, need, async () => {
      const items = generateUoe(level, need, current);
      const ids = await createGaps(db, level, items);
      return ids.length;
    });
  }

  for (const level of CAMBRIDGE_SPEAKING_LEVELS) {
    for (const part of getCambridgeSpeakingParts(level)) {
      const current = await countCambridgeSpeakingPart(level, part);
      const need = Math.max(0, MIN - current);
      await supplement(`${level} Speaking Part ${part}`, current, need, async () => {
        const items = buildSpeakingForPart(level, part, need, current);
        const ids = await createSpeakings(db, level, items, undefined, {
          examTrack: "CAMBRIDGE",
          cambridgePart: part,
          startOrderIndex: current,
        });
        return ids.length;
      });
    }
  }

  for (const part of IELTS_SPEAKING_PARTS) {
    const current = await countIeltsSpeakingPart(part);
    const need = Math.max(0, MIN - current);
    await supplement(`IELTS Speaking Part ${part}`, current, need, async () => {
      const items = buildIeltsSpeakingSeeds(part, need, current);
      const speakingItems = items.map((s) => ({
        title: s.title,
        prompt: s.prompt,
        preparationTime: s.preparationTime,
        speakingTime: s.speakingTime,
      }));
      const ids = await createSpeakings(db, IELTS_SPEAKING_LEVEL, speakingItems, undefined, {
        examTrack: "IELTS",
        ieltsPart: part,
        startOrderIndex: current,
      });
      return ids.length;
    });
  }

  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    for (const part of getCambridgeWritingParts(level)) {
      const current = await countCambridgeWritingPart(level, part);
      const need = Math.max(0, MIN - current);
      await supplement(`${level} Writing Part ${part}`, current, need, async () => {
        const items = buildWritingForPart(level, part, need, current);
        const ids = await createWritings(db, level, items, undefined, {
          examTrack: "CAMBRIDGE",
          cambridgeWritingPart: part,
          startOrderIndex: current,
        });
        return ids.length;
      });
    }
  }

  for (const task of IELTS_WRITING_TASKS) {
    const current = await countIeltsWritingTask(task);
    const need = Math.max(0, MIN - current);
    await supplement(`IELTS Writing Task ${task}`, current, need, async () => {
      const items = buildIeltsWritingSeeds(task, need, current);
      const writingItems = items.map((s) => ({
        title: s.title,
        taskPrompt: s.taskPrompt,
        wordLimit: s.wordLimit,
        instructions: s.instructions,
        difficulty: s.difficulty,
      }));
      const ids = await createWritings(db, IELTS_WRITING_LEVEL, writingItems, undefined, {
        examTrack: "IELTS",
        ieltsWritingTask: task,
        startOrderIndex: current,
      });
      return ids.length;
    });
  }

  console.log(`\n${dryRun ? "Sẽ tạo" : "Đã tạo"}: ${totalCreated} câu mới`);

  if (!dryRun && totalCreated > 0) {
    console.log(
      "\nGợi ý: chạy content:migrate-cambridge-speaking, content:migrate-cambridge-writing,"
    );
    console.log("content:migrate-ielts-speaking, content:migrate-ielts-writing để cập nhật mô tả đề.");
    console.log("audio:generate-speaking cho file MP3 Speaking mới (nếu cần).");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
