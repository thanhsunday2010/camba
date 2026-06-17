/**
 * Nâng cấp ngân hàng Reading: xóa câu đoạn ngắn / 1 câu–1 đoạn (nếu không đang dùng),
 * bổ sung bộ đoạn văn mới (nhiều câu/đoạn) theo level.
 *
 * Usage:
 *   npm run content:migrate-reading-pools
 *   npm run content:migrate-reading-pools -- --dry-run
 *   npm run content:migrate-reading-pools -- --level=KET
 *   npm run content:migrate-reading-pools -- --replenish-only
 *   npm run content:migrate-reading-pools -- --prune-only
 */
import "dotenv/config";
import {
  ExamLevel,
  PaperKind,
  PrismaClient,
  QuestionType,
  Skill,
} from "@prisma/client";
import { createMcqs, type McqSeed } from "../prisma/seed/helpers";
import { expandReadingPool } from "../prisma/seed/expand-bank";
import { getCuratedLevelData } from "../prisma/seed/curated/index";
import { PASSAGE_WORD_TARGETS } from "../prisma/seed/generators/reading-passage-sets";
import { computeRequiredPoolSizes } from "../prisma/seed/seed-targets";
import {
  getReadingPassageGroupKey,
  getQuestionDiversityKey,
  getSeedDiversityKey,
  type QuestionPickMeta,
} from "../src/lib/exam/question-diversity";
import {
  buildMockSkillPoolKey,
  buildPracticePoolKey,
  PRACTICE_POOL_SIZE,
} from "../src/lib/exam/practice-pool";

const db = new PrismaClient();

const LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const pruneOnly = args.includes("--prune-only");
const replenishOnly = args.includes("--replenish-only");
const levelArg = args.find((a) => a.startsWith("--level="))?.split("=")[1]?.toUpperCase();

function asRecord(content: unknown): Record<string, unknown> {
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return content as Record<string, unknown>;
  }
  return {};
}

function extractPassage(content: unknown): string {
  const passage = asRecord(content).passage;
  return typeof passage === "string" ? passage.trim() : "";
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function toPickMeta(q: {
  id: string;
  type: QuestionType;
  title: string | null;
  content: unknown;
}): QuestionPickMeta {
  return { id: q.id, type: q.type, title: q.title, content: q.content };
}

function isLegacyUnpublishedPaper(paper: {
  paperKind: PaperKind;
  practicePoolKey: string | null;
  mockPoolKey: string | null;
  published: boolean;
}): boolean {
  if (paper.published) return false;
  if (paper.practicePoolKey || paper.mockPoolKey) return false;
  return (
    paper.paperKind === PaperKind.PRACTICE ||
    paper.paperKind === PaperKind.MOCK_SKILL ||
    paper.paperKind === PaperKind.MOCK_FULL
  );
}

async function getReferencedQuestionIds(questionIds: string[]): Promise<Set<string>> {
  if (questionIds.length === 0) return new Set();

  const [attemptLinks, paperLinks] = await Promise.all([
    db.attemptQuestion.findMany({
      where: { questionId: { in: questionIds } },
      select: { questionId: true },
    }),
    db.paperQuestion.findMany({
      where: { questionId: { in: questionIds } },
      select: {
        questionId: true,
        paper: {
          select: {
            paperKind: true,
            practicePoolKey: true,
            mockPoolKey: true,
            published: true,
          },
        },
      },
    }),
  ]);

  const referenced = new Set<string>();
  for (const link of attemptLinks) referenced.add(link.questionId);
  for (const link of paperLinks) {
    if (isLegacyUnpublishedPaper(link.paper)) continue;
    referenced.add(link.questionId);
  }
  return referenced;
}

/** Câu cũ: đoạn quá ngắn hoặc không đủ câu trong cùng đoạn. */
function shouldRemoveReadingQuestion(
  content: unknown,
  groupSize: number,
  level: ExamLevel
): boolean {
  const passage = extractPassage(content);
  const wc = wordCount(passage);
  const min = PASSAGE_WORD_TARGETS[level].min;

  if (groupSize >= 4 && wc >= Math.floor(min * 0.85)) return false;
  if (groupSize >= 2 && wc >= min) return false;
  return true;
}

type PruneStats = {
  before: number;
  after: number;
  deleted: number;
  skippedReferenced: number;
  groups: number;
  shortPassages: number;
  soloQuestions: number;
};

async function pruneLegacyReadingPool(
  level: ExamLevel,
  dryRun: boolean
): Promise<PruneStats> {
  const questions = await db.question.findMany({
    where: { level, skill: Skill.READING, placementSlug: null },
    select: { id: true, type: true, title: true, content: true },
  });

  const groups = new Map<string, typeof questions>();
  for (const q of questions) {
    const key = getReadingPassageGroupKey(toPickMeta(q));
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }

  const referenced = await getReferencedQuestionIds(questions.map((q) => q.id));

  const toDelete: string[] = [];
  let shortPassages = 0;
  let soloQuestions = 0;

  for (const q of questions) {
    const key = getReadingPassageGroupKey(toPickMeta(q));
    const group = groups.get(key) ?? [q];
    const passage = extractPassage(q.content);
    const wc = wordCount(passage);
    const min = PASSAGE_WORD_TARGETS[level].min;

    if (group.length === 1) soloQuestions++;
    if (wc < min) shortPassages++;

    if (
      shouldRemoveReadingQuestion(q.content, group.length, level) &&
      !referenced.has(q.id)
    ) {
      toDelete.push(q.id);
    }
  }

  const skippedReferenced = questions.filter(
    (q) =>
      !toDelete.includes(q.id) &&
      shouldRemoveReadingQuestion(
        q.content,
        (groups.get(getReadingPassageGroupKey(toPickMeta(q))) ?? [q]).length,
        level
      ) &&
      referenced.has(q.id)
  ).length;

  if (!dryRun && toDelete.length > 0) {
    await db.paperQuestion.deleteMany({ where: { questionId: { in: toDelete } } });
    await db.question.deleteMany({ where: { id: { in: toDelete } } });
  }

  return {
    before: questions.length,
    after: questions.length - toDelete.length,
    deleted: toDelete.length,
    skippedReferenced,
    groups: groups.size,
    shortPassages,
    soloQuestions,
  };
}

type ReplenishStats = { before: number; after: number; created: number; sets: number };

async function replenishReadingPassagePool(
  level: ExamLevel,
  dryRun: boolean,
  effectiveBefore?: number
): Promise<ReplenishStats> {
  const target = computeRequiredPoolSizes(level).reading;

  const existing = await db.question.findMany({
    where: { level, skill: Skill.READING, placementSlug: null },
    select: { id: true, type: true, title: true, content: true },
  });

  const keys = new Set(existing.map((q) => getQuestionDiversityKey(toPickMeta(q))));
  const before = effectiveBefore ?? existing.length;
  if (before >= target) {
    return { before, after: before, created: 0, sets: 0 };
  }

  const need = target - before;
  const batch: McqSeed[] = [];

  const candidates = expandReadingPool(
    getCuratedLevelData(level).reading,
    before + need,
    level
  );

  for (const item of candidates) {
    const key = getSeedDiversityKey(QuestionType.MCQ, item);
    if (keys.has(key)) continue;
    keys.add(key);
    batch.push(item);
    if (batch.length >= need) break;
  }

  const setsAdded = Math.ceil(batch.length / 5);

  if (batch.length < need) {
    console.warn(
      `[migrate-reading] ${level}: chỉ tạo được ${batch.length}/${need} câu mới (hết mẫu).`
    );
  }

  if (!dryRun && batch.length > 0) {
    await createMcqs(db, level, Skill.READING, batch);
  }

  return {
    before,
    after: before + batch.length,
    created: batch.length,
    sets: setsAdded,
  };
}

async function refreshReadingPaperDescriptions(level: ExamLevel, poolCount: number) {
  const practiceKey = buildPracticePoolKey(level, Skill.READING);
  const mockKey = buildMockSkillPoolKey(level, Skill.READING);

  const practiceDesc = `${PRACTICE_POOL_SIZE} câu (1 đoạn văn + nhiều câu hỏi/lần) từ ngân hàng ${poolCount} câu — đa dạng nội dung, không lặp cho đến khi hết pool`;
  const mockDesc = `Ngân hàng ${poolCount} câu — 1 đoạn văn + nhiều câu/lần, chọn ngẫu nhiên mỗi lần thi mock`;

  await db.examPaper.updateMany({
    where: { practicePoolKey: practiceKey },
    data: { description: practiceDesc },
  });

  await db.examPaper.updateMany({
    where: { mockPoolKey: mockKey },
    data: { description: mockDesc },
  });
}

async function main() {
  const levels = levelArg
    ? LEVELS.filter((l) => l === levelArg)
    : LEVELS;

  if (levelArg && levels.length === 0) {
    console.error(`Level không hợp lệ: ${levelArg}`);
    process.exit(1);
  }

  console.log("\n=== Nâng cấp ngân hàng Reading (passage sets) ===");
  if (dryRun) console.log("DRY RUN — không ghi DB\n");
  if (pruneOnly) console.log("Chế độ: chỉ xóa câu cũ\n");
  if (replenishOnly) console.log("Chế độ: chỉ bổ sung\n");

  let totalDeleted = 0;
  let totalCreated = 0;

  for (const level of levels) {
    console.log(`\n── ${level} ──`);

    let projectedAfter = await db.question.count({
      where: { level, skill: Skill.READING, placementSlug: null },
    });

    if (!replenishOnly) {
      const pruned = await pruneLegacyReadingPool(level, dryRun);
      projectedAfter = pruned.after;
      totalDeleted += pruned.deleted;
      console.log(
        `  Xóa cũ: ${pruned.before} → ${pruned.after} (−${pruned.deleted}, ${pruned.groups} nhóm đoạn, ${pruned.soloQuestions} câu solo, ${pruned.shortPassages} đoạn ngắn, bỏ qua ${pruned.skippedReferenced} đang dùng)`
      );
    }

    if (!pruneOnly) {
      const added = await replenishReadingPassagePool(level, dryRun, projectedAfter);
      totalCreated += added.created;
      const target = computeRequiredPoolSizes(level).reading;

      if (added.created > 0) {
        console.log(
          `  Bổ sung: ${added.before} → ${added.after} (+${added.created} câu, ${added.sets} bộ đoạn) · mục tiêu ${target}`
        );
      } else {
        console.log(`  Đủ quota: ${added.before}/${target} câu`);
      }

      if (!dryRun) {
        const poolCount = await db.question.count({
          where: { level, skill: Skill.READING, placementSlug: null },
        });
        await refreshReadingPaperDescriptions(level, poolCount);
      }
    }
  }

  console.log(
    `\n${dryRun ? "Sẽ xóa" : "Đã xóa"} ${totalDeleted} câu cũ · ${dryRun ? "Sẽ tạo" : "Đã tạo"} ${totalCreated} câu mới`
  );

  if (!dryRun && (totalDeleted > 0 || totalCreated > 0)) {
    console.log("Gợi ý: npx tsx scripts/audit-reading-passages.ts — kiểm tra độ dài đoạn văn.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
