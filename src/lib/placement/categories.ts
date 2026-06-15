import type { PlacementSlug } from "@/lib/placement/placement-config";
import { resolvePlacementSlug } from "@/lib/placement/placement-config";
import { inferTrackFromPaperTitle } from "@/lib/placement/paper-titles";

export type PlacementCategoryId = "ielts" | "cambridge" | "general";

export type PlacementCategoryTheme = PlacementCategoryId;

export const PLACEMENT_CATEGORY_ORDER: PlacementCategoryId[] = [
  "ielts",
  "cambridge",
  "general",
];

export const PLACEMENT_CATEGORIES: Record<
  PlacementCategoryId,
  {
    title: string;
    description: string;
    sectionClass: string;
    titleClass: string;
    badgeClass: string;
  }
> = {
  ielts: {
    title: "IELTS Placement Test",
    description:
      "Đánh giá 4 kỹ năng IELTS (Listening → Reading → Writing → Speaking) — kết quả theo band.",
    sectionClass:
      "rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 p-6 shadow-sm",
    titleClass: "text-rose-900",
    badgeClass: "bg-rose-500 text-white",
  },
  cambridge: {
    title: "Cambridge Placement Test",
    description:
      "YLE (Starters / Movers / Flyers) và Secondary (KET / PET / FCE) — kết quả CEFR & Cambridge shields.",
    sectionClass:
      "rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-sky-50/40 p-6 shadow-sm",
    titleClass: "text-blue-900",
    badgeClass: "bg-blue-600 text-white",
  },
  general: {
    title: "General English Placement Test",
    description:
      "Giao tiếp hàng ngày & công sở — kết quả theo khung CEFR (A1–C1).",
    sectionClass:
      "rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 p-6 shadow-sm",
    titleClass: "text-emerald-900",
    badgeClass: "bg-emerald-600 text-white",
  },
};

const SLUG_CATEGORY: Record<PlacementSlug, PlacementCategoryId> = {
  yle: "cambridge",
  secondary: "cambridge",
  adult: "general",
  "ielts-academic-full": "ielts",
  "ielts-gt-full": "ielts",
  "ielts-academic-short": "ielts",
  "ielts-gt-short": "ielts",
};

const SLUG_SORT: Record<PlacementSlug, number> = {
  yle: 0,
  secondary: 1,
  adult: 0,
  "ielts-academic-full": 0,
  "ielts-gt-full": 1,
  "ielts-academic-short": 2,
  "ielts-gt-short": 3,
};

export function resolvePlacementCategory(paper: {
  placementSlug: string | null;
  title: string;
}): PlacementCategoryId {
  const slug = resolvePlacementSlug(paper);
  if (slug && slug in SLUG_CATEGORY) {
    return SLUG_CATEGORY[slug as PlacementSlug];
  }

  const track = inferTrackFromPaperTitle(paper.title);
  if (track === "IELTS") return "ielts";
  if (track === "ADULT") return "general";
  return "cambridge";
}

export function placementPaperSortKey(paper: {
  placementSlug: string | null;
  title: string;
}): number {
  const slug = resolvePlacementSlug(paper);
  if (slug && slug in SLUG_SORT) return SLUG_SORT[slug as PlacementSlug];
  return 99;
}

export type PlacementPaperListItem = {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  placementSlug: string | null;
};

export function groupPlacementPapersByCategory(
  papers: PlacementPaperListItem[]
): Record<PlacementCategoryId, PlacementPaperListItem[]> {
  const groups: Record<PlacementCategoryId, PlacementPaperListItem[]> = {
    ielts: [],
    cambridge: [],
    general: [],
  };

  for (const paper of papers) {
    groups[resolvePlacementCategory(paper)].push(paper);
  }

  for (const id of PLACEMENT_CATEGORY_ORDER) {
    groups[id].sort(
      (a, b) => placementPaperSortKey(a) - placementPaperSortKey(b)
    );
  }

  return groups;
}

export const PLACEMENT_CARD_THEMES: Record<
  PlacementCategoryTheme,
  { cardClass: string; badgeClass: string }
> = {
  ielts: {
    cardClass: "border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white",
    badgeClass: "bg-rose-500",
  },
  cambridge: {
    cardClass: "border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white",
    badgeClass: "bg-blue-600",
  },
  general: {
    cardClass: "border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
    badgeClass: "bg-emerald-600",
  },
};
