import { ExamLevel } from "@prisma/client";
import type { LevelBank } from "./curated/types";
import {
  generateListening,
  generateReading,
  generateSpeaking,
  generateUoe,
  generateWriting,
} from "./generators/bulk-data";
import { computeRequiredPoolSizes } from "./seed-targets";

function expandPool<T>(
  base: T[],
  target: number,
  generate: (count: number, offset: number) => T[]
): T[] {
  if (target <= 0) return [];
  const out = [...base];
  let offset = base.length;
  while (out.length < target) {
    const need = target - out.length;
    const batch = generate(Math.min(need, 50), offset);
    if (batch.length === 0) break;
    out.push(...batch.slice(0, need));
    offset += batch.length;
  }
  return out.slice(0, target);
}

export function expandLevelBank(level: ExamLevel, curated: LevelBank): LevelBank {
  const required = computeRequiredPoolSizes(level);

  return {
    reading: expandPool(curated.reading, required.reading, (count, offset) =>
      generateReading(level, count, offset)
    ),
    listening: expandPool(curated.listening, required.listening, (count, offset) =>
      generateListening(level, count, offset)
    ),
    writing: expandPool(curated.writing, required.writing, (count, offset) =>
      generateWriting(level, count, offset)
    ),
    speaking: expandPool(curated.speaking, required.speaking, (count, offset) =>
      generateSpeaking(level, count, offset)
    ),
    uoe: expandPool(curated.uoe, required.uoe, (count, offset) =>
      generateUoe(level, count, offset)
    ),
  };
}
