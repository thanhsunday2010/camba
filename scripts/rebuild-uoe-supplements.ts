/**
 * Add UoE supplement rows for KET/PET/FCE (30 base + 70 supplement = 100).
 * Run: npx tsx scripts/rebuild-uoe-supplements.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ExamLevel } from "@prisma/client";
import { buildDiverseUoe } from "../prisma/seed/generators/diverse-templates";
import { getCuratedLevelData } from "../prisma/seed/curated/index";

const LEVELS: ExamLevel[] = ["KET", "PET", "FCE"];
const TARGET = 70;

function titleFromPassage(passage: string, index: number): string {
  const clean = passage.replace(/___.*$/, "").trim().slice(0, 40);
  return clean.length > 5 ? clean : `Grammar ${index + 1}`;
}

function uniqueUoe(level: ExamLevel) {
  const base = getCuratedLevelData(level);
  const seen = new Set(base.uoe.map((g) => g.passage.trim().toLowerCase()));
  const pool = buildDiverseUoe(level, 300, 800);
  const out: { title: string; passage: string; answer: string }[] = [];

  for (const item of pool) {
    const passage = item.passage.includes("___") ? item.passage : `${item.passage} ___`;
    const key = passage.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title: titleFromPassage(passage, out.length),
      passage,
      answer: item.answer,
    });
    if (out.length >= TARGET) break;
  }
  if (out.length < TARGET) throw new Error(`${level}: only ${out.length}/${TARGET} UoE`);
  return out;
}

function patchSupplementFile(level: ExamLevel, uoeRows: [string, string, string][]) {
  const path = join(process.cwd(), `prisma/seed/curated/supplements/${level.toLowerCase()}.ts`);
  let src = readFileSync(path, "utf8");

  const uoeBlock = uoeRows
    .map(([t, p, a]) => `  [${JSON.stringify(t)}, ${JSON.stringify(p)}, ${JSON.stringify(a)}],`)
    .join("\n");

  const uoeSection = `const uoe = gapsFromRows([\n${uoeBlock}\n]);`;

  if (src.includes("const uoe = gapsFromRows")) {
    src = src.replace(/const uoe = gapsFromRows\(\[[\s\S]*?\]\);/, uoeSection);
  } else {
    src = src.replace(
      /const writing = writingsFromRows/,
      `${uoeSection}\n\nconst writing = writingsFromRows`
    );
    src = src.replace(
      /export const \w+_SUPPLEMENT: LevelSupplement = \{\n  reading,/,
      (m) => m.replace("reading,", "reading,\n  uoe,")
    );
  }

  writeFileSync(path, src);
  console.log(`  ${level}: +${uoeRows.length} UoE rows`);
}

console.log("Rebuilding UoE supplements…\n");
for (const level of LEVELS) {
  const rows = uniqueUoe(level);
  patchSupplementFile(
    level,
    rows.map((r) => [r.title, r.passage, r.answer] as [string, string, string])
  );
}
console.log("\nDone.");
