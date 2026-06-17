import { ExamLevel, QuestionType } from "@prisma/client";
import type { LevelBank } from "./curated/types";
import {
  generateListening,
  generateSpeaking,
  generateUoe,
  generateWriting,
} from "./generators/bulk-data";
import {
  buildReadingPassageSet,
  enrichCuratedReading,
} from "./generators/reading-passage-sets";
import { expandPoolDeduped } from "./generators/expand-pool";
import { computeRequiredPoolSizes } from "./seed-targets";
import type { McqSeed } from "./helpers";
import { getSeedDiversityKey } from "../../src/lib/exam/question-diversity";

function expandReadingPool(
  base: McqSeed[],
  target: number,
  level: ExamLevel
): McqSeed[] {
  const enrichedBase = enrichCuratedReading(level, base);
  const keys = new Set(
    enrichedBase.map((item) =>
      getSeedDiversityKey(QuestionType.MCQ, item as McqSeed & Record<string, unknown>)
    )
  );
  const out = [...enrichedBase];
  let setIdx = 0;
  const maxAttempts = Math.max(target * 8, 800);

  for (let attempt = 0; out.length < target && attempt < maxAttempts; attempt++) {
    const set = buildReadingPassageSet(level, setIdx++);
    for (const item of set) {
      const key = getSeedDiversityKey(
        QuestionType.MCQ,
        item as McqSeed & Record<string, unknown>
      );
      if (keys.has(key)) continue;
      keys.add(key);
      out.push(item);
      if (out.length >= target) break;
    }
  }

  if (out.length < target) {
    console.warn(
      `[expand-reading] ${level}: only ${out.length}/${target} questions after dedupe.`
    );
  }

  return out.slice(0, target);
}

export function expandLevelBank(level: ExamLevel, curated: LevelBank): LevelBank {
  const required = computeRequiredPoolSizes(level);

  return {
    reading: expandReadingPool(curated.reading, required.reading, level),
    listening: expandPoolDeduped(
      curated.listening,
      required.listening,
      QuestionType.MCQ,
      (offset) => generateListening(level, 1, offset)[0] ?? null
    ),
    writing: expandPoolDeduped(
      curated.writing,
      required.writing,
      QuestionType.FREE_TEXT,
      (offset) => generateWriting(level, 1, offset)[0] ?? null
    ),
    speaking: expandPoolDeduped(
      curated.speaking,
      required.speaking,
      QuestionType.SPEAKING_PROMPT,
      (offset) => generateSpeaking(level, 1, offset)[0] ?? null
    ),
    uoe: expandPoolDeduped(
      curated.uoe,
      required.uoe,
      QuestionType.GAP_FILL,
      (offset) => generateUoe(level, 1, offset)[0] ?? null
    ),
  };
}
