import { ExamLevel, QuestionType } from "@prisma/client";
import type { LevelBank } from "./curated/types";
import {
  generateListening,
  generateReading,
  generateSpeaking,
  generateUoe,
  generateWriting,
} from "./generators/bulk-data";
import { expandPoolDeduped } from "./generators/expand-pool";
import { computeRequiredPoolSizes } from "./seed-targets";

export function expandLevelBank(level: ExamLevel, curated: LevelBank): LevelBank {
  const required = computeRequiredPoolSizes(level);

  return {
    reading: expandPoolDeduped(
      curated.reading,
      required.reading,
      QuestionType.MCQ,
      (offset) => generateReading(level, 1, offset)[0] ?? null
    ),
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
