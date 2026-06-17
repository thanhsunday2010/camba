/**
 * Verify curated bank MVP targets and listening uniqueness.
 * Run: npx tsx scripts/verify-curated-bank.ts
 */
import { getCuratedLevelData } from "../prisma/seed/curated/index";

const TARGETS = {
  reading: 100,
  listening: 120,
  writing: 20,
  speaking: 20,
  uoeYle: 20,
  uoeSecondary: 100,
};

const LEVELS = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"] as const;
let failed = false;

for (const level of LEVELS) {
  const b = getCuratedLevelData(level);
  const isYle = level === "STARTERS" || level === "MOVERS" || level === "FLYERS";
  const uoeTarget = isYle ? TARGETS.uoeYle : TARGETS.uoeSecondary;

  const checks: [string, number, number][] = [
    ["reading", b.reading.length, TARGETS.reading],
    ["listening", b.listening.length, TARGETS.listening],
    ["writing", b.writing.length, TARGETS.writing],
    ["speaking", b.speaking.length, TARGETS.speaking],
    ["uoe", b.uoe.length, uoeTarget],
  ];

  const transcripts = b.listening.map((l) => l.transcript.trim().toLowerCase());
  const uniqueTranscripts = new Set(transcripts).size;
  const dupes = transcripts.length - uniqueTranscripts;

  console.log(`\n${level}:`);
  for (const [skill, got, want] of checks) {
    const ok = got >= want;
    if (!ok) failed = true;
    console.log(`  ${ok ? "✓" : "✗"} ${skill}: ${got} (target ${want})`);
  }
  const listenOk = dupes === 0;
  if (!listenOk) failed = true;
  console.log(`  ${listenOk ? "✓" : "✗"} listening unique transcripts: ${uniqueTranscripts}/${transcripts.length} (${dupes} dupes)`);
}

if (failed) {
  console.error("\nVerify FAILED");
  process.exit(1);
}
console.log("\nVerify OK — all levels meet MVP targets.");
