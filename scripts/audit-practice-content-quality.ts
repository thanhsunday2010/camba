/**
 * Giai đoạn 1: Audit chất lượng ngân hàng luyện tập (seed + DB).
 * Usage: npm run content:audit-quality
 *        npm run content:audit-quality -- --db
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { ExamLevel, Skill } from "@prisma/client";
import { getCuratedLevelData } from "../prisma/seed/curated/index";
import { expandLevelBank } from "../prisma/seed/expand-bank";
import { ALL_LEVELS } from "../prisma/seed/seed-curated-bank";
import { computeRequiredPoolSizes, PRACTICE_QUESTIONS_PER_PAPER } from "../prisma/seed/seed-targets";
import type { McqSeed } from "../prisma/seed/helpers";
import { PASSAGE_WORD_TARGETS } from "../prisma/seed/generators/reading-passage-sets";

config({ override: true });
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const SKILLS: Skill[] = [
  Skill.READING,
  Skill.LISTENING,
  Skill.WRITING,
  Skill.SPEAKING,
  Skill.USE_OF_ENGLISH,
];

const GENERATED_TITLE = /^[A-Z]\d+-?\d*$/;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function groupReadingByPassage(items: McqSeed[]): Map<string, McqSeed[]> {
  const groups = new Map<string, McqSeed[]>();
  for (const item of items) {
    const key = (item.passage ?? item.title ?? item.question).trim();
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return groups;
}

function auditReading(level: ExamLevel, items: McqSeed[]) {
  const range = PASSAGE_WORD_TARGETS[level];
  const groups = groupReadingByPassage(items);
  let short = 0;
  let long = 0;
  let solo = 0;
  let smallSets = 0;
  for (const [, qs] of groups) {
    const wc = wordCount(qs[0]?.passage ?? "");
    if (wc < range.min) short++;
    if (wc > range.max) long++;
    if (qs.length === 1) solo++;
    if (qs.length < 4) smallSets++;
  }
  return { passages: groups.size, questions: items.length, short, long, solo, smallSets };
}

type LevelAudit = {
  level: ExamLevel;
  curated: Record<string, number>;
  expanded: Record<string, number>;
  required: Record<string, number>;
  generatedSharePct: Record<string, number>;
  readingIssues: ReturnType<typeof auditReading>;
  maxPracticeSessions: Record<string, number>;
};

function auditSeedLevel(level: ExamLevel): LevelAudit {
  const curated = getCuratedLevelData(level);
  const expanded = expandLevelBank(level, curated);
  const required = computeRequiredPoolSizes(level);
  const qp = PRACTICE_QUESTIONS_PER_PAPER;

  const keys = ["reading", "listening", "writing", "speaking", "uoe"] as const;
  const curatedCounts: Record<string, number> = {};
  const expandedCounts: Record<string, number> = {};
  const generatedSharePct: Record<string, number> = {};

  for (const k of keys) {
    const c = curated[k].length;
    const e = expanded[k].length;
    curatedCounts[k] = c;
    expandedCounts[k] = e;
    generatedSharePct[k] = e > 0 ? Math.round(((e - c) / e) * 100) : 0;
  }

  return {
    level,
    curated: curatedCounts,
    expanded: expandedCounts,
    required: {
      reading: required.reading,
      listening: required.listening,
      writing: required.writing,
      speaking: required.speaking,
      uoe: required.uoe,
    },
    generatedSharePct,
    readingIssues: auditReading(level, curated.reading),
    maxPracticeSessions: {
      reading: Math.floor(curated.reading.length / qp.reading),
      listening: Math.floor(curated.listening.length / qp.listening),
      writing: Math.floor(curated.writing.length / qp.writing),
      speaking: Math.floor(curated.speaking.length / qp.speaking),
      uoe: curated.uoe.length ? Math.floor(curated.uoe.length / qp.uoe) : 0,
    },
  };
}

async function auditDb() {
  const { PrismaClient, ContentSource } = await import("@prisma/client");
  const db = new PrismaClient();
  try {
    console.log("\n=== DB audit (practice bank) ===\n");
    for (const level of ALL_LEVELS) {
      const rows: string[] = [];
      for (const skill of SKILLS) {
        const [total, curated, generated, untagged] = await Promise.all([
          db.question.count({ where: { level, skill, placementSlug: null } }),
          db.question.count({
            where: { level, skill, placementSlug: null, contentSource: ContentSource.CURATED },
          }),
          db.question.count({
            where: { level, skill, placementSlug: null, contentSource: ContentSource.GENERATED },
          }),
          db.question.count({
            where: { level, skill, placementSlug: null, contentSource: null },
          }),
        ]);
        if (total === 0) continue;
        rows.push(
          `  ${skill}: ${total} total · ${curated} curated · ${generated} generated · ${untagged} untagged`
        );
      }
      if (rows.length) {
        console.log(level);
        for (const r of rows) console.log(r);
      }
    }
  } finally {
    await db.$disconnect();
  }
}

function printReport(audits: LevelAudit[]) {
  console.log("=== Camba practice content audit (Giai đoạn 1) ===\n");
  console.log(
    "Mục tiêu giai đoạn 2: pool luyện tập chỉ dùng CURATED (đã bật PRACTICE_POOL_CURATED_ONLY).\n"
  );

  let totalCurated = 0;
  let totalExpanded = 0;

  for (const a of audits) {
    totalCurated += Object.values(a.curated).reduce((s, n) => s + n, 0);
    totalExpanded += Object.values(a.expanded).reduce((s, n) => s + n, 0);

    console.log(`--- ${a.level} ---`);
    console.log(
      `  Curated pool: R${a.curated.reading} L${a.curated.listening} W${a.curated.writing} S${a.curated.speaking} U${a.curated.uoe}`
    );
    console.log(
      `  Expanded (cũ): R${a.expanded.reading} L${a.expanded.listening} … · generated ~${a.generatedSharePct.reading}% Reading`
    );
    console.log(
      `  Required (100 đề cũ): R${a.required.reading} — thiếu curated ${Math.max(0, a.required.reading - a.curated.reading)} câu Reading`
    );
    console.log(
      `  Lượt luyện pool tối đa (curated): Reading ~${a.maxPracticeSessions.reading} · Listening ~${a.maxPracticeSessions.listening}`
    );
    const ri = a.readingIssues;
    console.log(
      `  Reading curated: ${ri.passages} passages · solo ${ri.solo} · sets<4Q ${ri.smallSets} · too short ${ri.short} · too long ${ri.long}`
    );
    console.log("");
  }

  const genShare = totalExpanded > 0 ? Math.round(((totalExpanded - totalCurated) / totalExpanded) * 100) : 0;
  console.log("=== Tổng kết ===");
  console.log(`  Curated: ${totalCurated} câu · Expanded (legacy): ${totalExpanded} câu`);
  console.log(`  ~${genShare}% expanded là câu generated (template) — không đạt chuẩn Cambridge hand-crafted.`);
  console.log("\nKhuyến nghị: chạy npm run content:reseed-practice rồi content:migrate-practice-pools.");
}

async function main() {
  const withDb = process.argv.includes("--db");
  const audits = ALL_LEVELS.map((level) => auditSeedLevel(level));
  printReport(audits);

  if (withDb) {
    await auditDb();
  }

  const outDir = join(process.cwd(), "scripts", "reports");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "content-audit.json");
  writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), audits }, null, 2));
  console.log(`\nJSON report: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
