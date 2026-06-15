/** Tiền tố title đề placement hiện hành (đồng bộ với prisma/seed/placement-content.ts) */
export const PLACEMENT_TITLE_PREFIX = "Camba Placement —";

export type PlacementTrack = "YLE" | "SECONDARY" | "ADULT" | "IELTS";

export const PLACEMENT_PAPER_TITLES = {
  YLE: `${PLACEMENT_TITLE_PREFIX} YLE (Starters / Movers / Flyers)`,
  SECONDARY: `${PLACEMENT_TITLE_PREFIX} Secondary (KET / PET / FCE)`,
  ADULT: `${PLACEMENT_TITLE_PREFIX} Adult (Giao tiếp hàng ngày & Công sở)`,
  IELTS_ACADEMIC_FULL: `${PLACEMENT_TITLE_PREFIX} IELTS Academic (Full)`,
  IELTS_GT_FULL: `${PLACEMENT_TITLE_PREFIX} IELTS General Training (Full)`,
  IELTS_ACADEMIC_SHORT: `${PLACEMENT_TITLE_PREFIX} IELTS Academic (Rút gọn)`,
  IELTS_GT_SHORT: `${PLACEMENT_TITLE_PREFIX} IELTS General Training (Rút gọn)`,
} as const;

export function isCurrentCambaPlacementTitle(title: string): boolean {
  return title.startsWith(PLACEMENT_TITLE_PREFIX);
}

export function inferTrackFromPaperTitle(title: string): PlacementTrack {
  const lower = title.toLowerCase();
  if (lower.includes("ielts")) return "IELTS";
  if (lower.includes("yle") || lower.includes("starters") || lower.includes("flyers")) {
    return "YLE";
  }
  if (lower.includes("adult")) return "ADULT";
  return "SECONDARY";
}
