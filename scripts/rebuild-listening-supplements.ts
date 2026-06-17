/**
 * Rebuild FLYERS/KET/PET/FCE listening supplements with unique transcripts
 * (replaces rotating 5-template batches).
 * Run: npx tsx scripts/rebuild-listening-supplements.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { ExamLevel } from "@prisma/client";
import { buildDiverseListening } from "../prisma/seed/generators/diverse-templates";
import { getCuratedLevelData } from "../prisma/seed/curated/index";
import type { ListeningSeed } from "../prisma/seed/helpers";

const LEVELS: ExamLevel[] = ["MOVERS", "FLYERS", "KET", "PET", "FCE"];
const SUPPLEMENT_TARGET = 95;
const OUT = join(process.cwd(), "prisma/seed/curated/supplements/data");

function titleFromTranscript(transcript: string, index: number): string {
  const speaker = transcript.match(/^([A-Za-z]+):/);
  if (speaker) return `${speaker[1]} — ${transcript.slice(0, 40).trim()}…`.slice(0, 48);
  return `Listening ${index + 1}`;
}

function toRow(item: ListeningSeed, index: number): [string, string, string, [string, string, string, string], string] {
  const opts = item.options as [string, string, string, string];
  return [titleFromTranscript(item.transcript, index), item.transcript, item.question, opts, item.answer];
}

function uniqueSupplementListening(level: ExamLevel): ListeningSeed[] {
  const base = getCuratedLevelData(level);
  const baseTranscripts = new Set(
    base.listening.slice(0, 25).map((l) => l.transcript.trim().toLowerCase())
  );

  const pool = buildDiverseListening(level, 400, 500);
  const seen = new Set<string>();
  const out: ListeningSeed[] = [];

  for (const item of pool) {
    const key = item.transcript.trim().toLowerCase();
    if (baseTranscripts.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...item,
      title: titleFromTranscript(item.transcript, out.length),
    });
    if (out.length >= SUPPLEMENT_TARGET) break;
  }

  if (out.length < SUPPLEMENT_TARGET) {
    throw new Error(`${level}: only ${out.length}/${SUPPLEMENT_TARGET} unique listening items`);
  }
  return out;
}

function emitFile(level: ExamLevel, items: ListeningSeed[]) {
  const rows = items.map((item, i) => toRow(item, i));
  const lines = rows
    .map(
      ([title, tr, q, o, a]) =>
        `  [${JSON.stringify(title)}, ${JSON.stringify(tr)}, ${JSON.stringify(q)}, ${JSON.stringify(o)}, ${JSON.stringify(a)}],`
    )
    .join("\n");

  writeFileSync(
    join(OUT, `${level.toLowerCase()}-listening.ts`),
    `import type { ListenRow } from "../helpers";

/** ${rows.length} unique supplement listening items for ${level} */
export const ${level}_LISTENING_ROWS: ListenRow[] = [
${lines}
];
`
  );
  console.log(`  ${level}: ${rows.length} unique listening rows`);
}

mkdirSync(OUT, { recursive: true });

console.log("Rebuilding listening supplement data…\n");
for (const level of LEVELS) {
  emitFile(level, uniqueSupplementListening(level));
}
console.log("\nDone. Run: npm run content:reseed-practice && npm run audio:generate");
