import { ExamLevel } from "@prisma/client";
import type { LevelSupplement } from "./merge";
import { STARTERS_SUPPLEMENT } from "./starters";
import { MOVERS_SUPPLEMENT } from "./movers";
import { FLYERS_SUPPLEMENT } from "./flyers";
import { KET_SUPPLEMENT } from "./ket";
import { PET_SUPPLEMENT } from "./pet";
import { FCE_SUPPLEMENT } from "./fce";

export const LEVEL_SUPPLEMENTS: Record<ExamLevel, LevelSupplement> = {
  STARTERS: STARTERS_SUPPLEMENT,
  MOVERS: MOVERS_SUPPLEMENT,
  FLYERS: FLYERS_SUPPLEMENT,
  KET: KET_SUPPLEMENT,
  PET: PET_SUPPLEMENT,
  FCE: FCE_SUPPLEMENT,
};

export { mergeLevelBank } from "./merge";
