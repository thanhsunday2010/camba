import type { PlacementSlug } from "@/lib/placement/placement-config";
import { resolvePlacementSlug } from "@/lib/placement/placement-config";
import { PLACEMENT_TITLE_PREFIX } from "@/lib/placement/paper-titles";

export const PLACEMENT_SLUG_LABELS: Record<PlacementSlug, string> = {
  yle: "YLE (Starters / Movers / Flyers) (6-12 tuổi)",
  secondary: "Secondary (KET / PET / FCE) (13-17 tuổi)",
  adult: "Giao tiếp hàng ngày & Công sở (Người lớn)",
  "ielts-academic-full": "IELTS Academic — Full (4 kỹ năng)",
  "ielts-gt-full": "IELTS General Training — Full (4 kỹ năng)",
  "ielts-academic-short": "IELTS Academic — Rút gọn",
  "ielts-gt-short": "IELTS General Training — Rút gọn",
};

export function getPlacementPaperLabel(paper: {
  placementSlug: string | null;
  title: string;
}): string {
  const slug = resolvePlacementSlug(paper);
  if (slug && slug in PLACEMENT_SLUG_LABELS) {
    return PLACEMENT_SLUG_LABELS[slug];
  }
  const stripped = paper.title.replace(PLACEMENT_TITLE_PREFIX, "").trim();
  return stripped || paper.title;
}
