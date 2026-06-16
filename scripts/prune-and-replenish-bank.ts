/**
 * Cắt ~2/3 câu trùng nội dung/cấu trúc trong pool luyện/mock, rồi bổ sung đến quota.
 *
 * Usage:
 *   npm run content:prune-replenish-bank
 *   npm run content:prune-replenish-bank -- --dry-run
 *   npm run content:prune-replenish-bank -- --prune-only
 *   npm run content:prune-replenish-bank -- --replenish-only
 */
import "dotenv/config";
import { ExamLevel, PrismaClient, Skill } from "@prisma/client";
import {
  countDifficultyMix,
  pruneSimilarPoolQuestions,
  replenishPoolToTarget,
} from "../prisma/seed/bank-curation";
import { buildMockSkillPoolKey, buildPracticePoolKey } from "../src/lib/exam/practice-pool";
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
const pruneOnly = args.includes("--prune-only");
const replenishOnly = args.includes("--replenish-only");

async function refreshPoolDescriptions(level: ExamLevel, skill: Skill, poolCount: number) {
  const practiceKey = buildPracticePoolKey(level, skill);
  const mockKey = buildMockSkillPoolKey(level, skill);

  await db.examPaper.updateMany({
    where: { practicePoolKey: practiceKey },
    data: {
      description: `${PRACTICE_POOL_SIZE} câu ngẫu nhiên từ ngân hàng ${poolCount} câu — đa dạng nội dung, không lặp cho đến khi hết pool`,
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
  console.log("\n=== Cắt câu trùng & bổ sung ngân hàng theo level ===");
  if (dryRun) console.log("DRY RUN — không ghi DB\n");
  if (pruneOnly) console.log("Chế độ: chỉ cắt trùng\n");
  if (replenishOnly) console.log("Chế độ: chỉ bổ sung\n");

  let totalDeleted = 0;
  let totalCreated = 0;

  for (const level of LEVELS) {
    console.log(`\n── ${level} ──`);

    for (const skill of SKILLS) {
      if (!replenishOnly) {
        const pruned = await pruneSimilarPoolQuestions(db, level, skill, dryRun);
        totalDeleted += pruned.deleted;
        if (pruned.deleted > 0 || pruned.before > 0) {
          console.log(
            `  ${skill} cắt trùng: ${pruned.before} → ${pruned.after} (−${pruned.deleted}, ${pruned.groups} nhóm, bỏ qua ${pruned.skippedReferenced} đang dùng)`
          );
        }
      }

      if (!pruneOnly) {
        const added = await replenishPoolToTarget(db, level, skill, dryRun);
        totalCreated += added.created;
        const mix = dryRun ? null : await countDifficultyMix(db, level, skill);
        const mixLabel = mix
          ? ` · dễ ${mix.easy}/vừa ${mix.medium}/khó ${mix.hard}`
          : "";

        if (added.created > 0) {
          console.log(
            `  ${skill} bổ sung: ${added.before} → ${added.after} (+${added.created})${mixLabel}`
          );
        } else if (added.before > 0) {
          console.log(`  ${skill} đủ quota: ${added.before} câu${mixLabel}`);
        }

        if (!dryRun) {
          const poolCount = await db.question.count({
            where: { level, skill, placementSlug: null },
          });
          await refreshPoolDescriptions(level, skill, poolCount);
        }
      }
    }
  }

  console.log(
    `\n${dryRun ? "Sẽ xóa" : "Đã xóa"} ${totalDeleted} câu trùng · ${dryRun ? "Sẽ tạo" : "Đã tạo"} ${totalCreated} câu mới`
  );

  if (!dryRun && totalCreated > 0) {
    console.log("Gợi ý: npm run audio:generate — MP3 listening cho câu mới (nếu cần).");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
