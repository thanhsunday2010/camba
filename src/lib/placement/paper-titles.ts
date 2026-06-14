/** Tiền tố title đề placement hiện hành (đồng bộ với prisma/seed/placement-content.ts) */
export const PLACEMENT_TITLE_PREFIX = "Camba Placement —";

export const PLACEMENT_PAPER_TITLES = {
  YLE: `${PLACEMENT_TITLE_PREFIX} YLE (Starters / Movers / Flyers)`,
  SECONDARY: `${PLACEMENT_TITLE_PREFIX} Secondary (KET / PET / FCE)`,
  ADULT: `${PLACEMENT_TITLE_PREFIX} Adult (Professional English)`,
} as const;

export function isCurrentCambaPlacementTitle(title: string): boolean {
  return title.startsWith(PLACEMENT_TITLE_PREFIX);
}

export function inferTrackFromPaperTitle(
  title: string
): "YLE" | "SECONDARY" | "ADULT" {
  const lower = title.toLowerCase();
  if (lower.includes("yle") || lower.includes("starters") || lower.includes("flyers")) {
    return "YLE";
  }
  if (lower.includes("adult")) return "ADULT";
  return "SECONDARY";
}
