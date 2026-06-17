import { ExamLevel } from "@prisma/client";
import { STARTERS_BANK } from "./starters";
import { MOVERS_BANK } from "./movers";
import { FLYERS_BANK } from "./flyers";
import { KET_BANK } from "./ket";
import { PET_BANK } from "./pet";
import { FCE_BANK } from "./fce";
import type { LevelBank } from "./types";
import { enrichCuratedReading } from "../generators/reading-passage-sets";
import { questionCounts } from "../generators/bulk-data";
import { LEVEL_SUPPLEMENTS, mergeLevelBank } from "./supplements";

const BANKS: Record<ExamLevel, LevelBank> = {
  STARTERS: STARTERS_BANK,
  MOVERS: MOVERS_BANK,
  FLYERS: FLYERS_BANK,
  KET: KET_BANK,
  PET: PET_BANK,
  FCE: FCE_BANK,
};

/** Trim to target counts while keeping full curated sets when larger. */
function trimBank(level: ExamLevel, bank: LevelBank): LevelBank {
  const c = questionCounts(level);
  return {
    reading: bank.reading.slice(0, Math.max(c.reading, bank.reading.length)),
    listening: bank.listening.slice(0, Math.max(c.listening, bank.listening.length)),
    writing: bank.writing.slice(0, Math.max(c.writing, bank.writing.length)),
    speaking: bank.speaking.slice(0, Math.max(c.speaking, bank.speaking.length)),
    uoe: bank.uoe.slice(0, Math.max(c.uoe, bank.uoe.length)),
  };
}

export function getCuratedLevelData(level: ExamLevel): LevelBank {
  const merged = mergeLevelBank(BANKS[level], LEVEL_SUPPLEMENTS[level]);
  return {
    reading: enrichCuratedReading(level, merged.reading),
    listening: merged.listening,
    writing: merged.writing,
    speaking: merged.speaking,
    uoe: merged.uoe,
  };
}

export function getCuratedLevelDataTrimmed(level: ExamLevel): LevelBank {
  return trimBank(level, BANKS[level]);
}

export { BANKS, questionCounts };
