import type { LevelBank } from "../types";

export type LevelSupplement = Partial<LevelBank>;

export function mergeLevelBank(base: LevelBank, extra: LevelSupplement): LevelBank {
  return {
    reading: extra.reading?.length ? [...base.reading, ...extra.reading] : base.reading,
    listening: extra.listening?.length ? [...base.listening, ...extra.listening] : base.listening,
    writing: extra.writing?.length ? [...base.writing, ...extra.writing] : base.writing,
    speaking: extra.speaking?.length ? [...base.speaking, ...extra.speaking] : base.speaking,
    uoe: extra.uoe?.length ? [...base.uoe, ...extra.uoe] : base.uoe,
  };
}
