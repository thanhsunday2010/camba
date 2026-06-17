/**
 * Audit độ dài đoạn văn Reading theo level (từ seed).
 * Chạy: npx tsx scripts/audit-reading-passages.ts
 */
import { ExamLevel } from "@prisma/client";
import { BANKS } from "../prisma/seed/curated";
import { getCuratedLevelData } from "../prisma/seed/curated/index";
import { expandLevelBank } from "../prisma/seed/expand-bank";
import { generateReading } from "../prisma/seed/generators/bulk-data";
import { buildReadingPassageSet } from "../prisma/seed/generators/reading-passage-sets";
import type { McqSeed } from "../prisma/seed/helpers";
import { PASSAGE_WORD_TARGETS } from "../prisma/seed/generators/reading-passage-sets";

const LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];

const PASSAGE_WORD_RANGE: Record<
  ExamLevel,
  { min: number; max: number; minQuestions: number }
> = {
  STARTERS: { ...PASSAGE_WORD_TARGETS.STARTERS, minQuestions: 4 },
  MOVERS: { ...PASSAGE_WORD_TARGETS.MOVERS, minQuestions: 4 },
  FLYERS: { ...PASSAGE_WORD_TARGETS.FLYERS, minQuestions: 4 },
  KET: { ...PASSAGE_WORD_TARGETS.KET, minQuestions: 4 },
  PET: { ...PASSAGE_WORD_TARGETS.PET, minQuestions: 4 },
  FCE: { ...PASSAGE_WORD_TARGETS.FCE, minQuestions: 4 },
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function groupByPassage(items: McqSeed[]): Map<string, McqSeed[]> {
  const groups = new Map<string, McqSeed[]>();
  for (const item of items) {
    const key = (item.passage ?? item.title ?? item.question).trim();
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return groups;
}

function auditItems(label: string, level: ExamLevel, items: McqSeed[]) {
  const range = PASSAGE_WORD_RANGE[level];
  const groups = groupByPassage(items);
  let shortPassages = 0;
  let longPassages = 0;
  let soloQuestions = 0;
  let smallSets = 0;

  for (const [, qs] of groups) {
    const passage = qs[0]?.passage ?? "";
    const wc = wordCount(passage);
    if (wc < range.min) shortPassages++;
    if (wc > range.max) longPassages++;
    if (qs.length === 1) soloQuestions++;
    if (qs.length < range.minQuestions) smallSets++;
  }

  const wordCounts = [...groups.keys()].map((p) => wordCount(p));
  const avgWords =
    wordCounts.length > 0
      ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
      : 0;

  console.log(`\n${label} (${level})`);
  console.log(`  Passages: ${groups.size} · Questions: ${items.length}`);
  console.log(`  Avg words/passage: ${avgWords} (target ${range.min}–${range.max})`);
  console.log(
    `  Too short: ${shortPassages} · Too long: ${longPassages} · Solo (1 Q/passage): ${soloQuestions} · Sets <${range.minQuestions} Q: ${smallSets}`
  );
}

console.log("=== Reading passage audit ===");

for (const level of LEVELS) {
  const curated = BANKS[level].reading;
  auditItems("Curated (raw)", level, curated);

  const enriched = getCuratedLevelData(level).reading;
  auditItems("Curated (enriched)", level, enriched);

  const bulkSet = buildReadingPassageSet(level, 0);
  auditItems("Bulk passage set", level, bulkSet);

  const bulkSample = generateReading(level, 30, 0);
  auditItems("Bulk sample (30)", level, bulkSample);
}

const ketExpanded = expandLevelBank("KET", BANKS.KET);
auditItems("Expanded bank", "KET", ketExpanded.reading.slice(0, 120));
