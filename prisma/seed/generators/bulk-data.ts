import { ExamLevel } from "@prisma/client";
import type {
  GapSeed,
  ListeningSeed,
  McqSeed,
  SpeakingSeed,
  WritingSeed,
} from "../helpers";
import {
  buildDiverseListening,
  buildDiverseReading,
  buildDiverseSpeaking,
  buildDiverseUoe,
  buildDiverseWriting,
} from "./diverse-templates";

export function isYleLevel(level: ExamLevel): boolean {
  return level === "STARTERS" || level === "MOVERS" || level === "FLYERS";
}

export function questionCounts(level: ExamLevel) {
  if (isYleLevel(level)) {
    return { reading: 55, listening: 25, writing: 10, speaking: 10, uoe: 20 };
  }
  return { reading: 50, listening: 25, writing: 10, speaking: 10, uoe: 30 };
}

export function generateReading(
  level: ExamLevel,
  count: number,
  startOffset = 0
): McqSeed[] {
  return buildDiverseReading(level, count, startOffset);
}

export function generateListening(
  level: ExamLevel,
  count: number,
  startOffset = 0
): ListeningSeed[] {
  return buildDiverseListening(level, count, startOffset);
}

export function generateUoe(
  level: ExamLevel,
  count: number,
  startOffset = 0
): GapSeed[] {
  return buildDiverseUoe(level, count, startOffset);
}

export function generateWriting(
  level: ExamLevel,
  count: number,
  startOffset = 0
): WritingSeed[] {
  return buildDiverseWriting(level, count, startOffset);
}

export function generateSpeaking(
  level: ExamLevel,
  count: number,
  startOffset = 0
): SpeakingSeed[] {
  return buildDiverseSpeaking(level, count, startOffset);
}

/** Mixed-difficulty items for global placement test */
export function generatePlacementPool(): {
  reading: McqSeed[];
  listening: ListeningSeed[];
  uoe: GapSeed[];
} {
  return {
    reading: [
      ...generateReading("STARTERS", 5),
      ...generateReading("MOVERS", 5),
      ...generateReading("FLYERS", 5),
      ...generateReading("KET", 5),
      ...generateReading("PET", 5),
      ...generateReading("FCE", 5),
    ],
    listening: [
      ...generateListening("MOVERS", 5),
      ...generateListening("FLYERS", 5),
      ...generateListening("KET", 5),
      ...generateListening("PET", 5),
      ...generateListening("FCE", 5),
    ],
    uoe: [
      ...generateUoe("KET", 5),
      ...generateUoe("PET", 5),
      ...generateUoe("FCE", 5),
    ],
  };
}

export function generatePlacementPoolYle(): {
  reading: McqSeed[];
  listening: ListeningSeed[];
} {
  return {
    reading: [
      ...generateReading("STARTERS", 8),
      ...generateReading("MOVERS", 8),
      ...generateReading("FLYERS", 9),
    ],
    listening: [
      ...generateListening("STARTERS", 7),
      ...generateListening("MOVERS", 7),
      ...generateListening("FLYERS", 6),
    ],
  };
}
