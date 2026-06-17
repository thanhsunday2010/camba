import type { PlacementCategoryId } from "@/lib/placement/categories";
import type { PlacementSlug } from "@/lib/placement/placement-config";

export type PlacementPickerPreset = {
  paperId?: string;
  categoryId?: PlacementCategoryId;
  /** Slug đề placement (yle, secondary, ielts-academic-full, …) — dùng trong URL chia sẻ */
  testSlug?: PlacementSlug | string;
};

const PLACEMENT_SLUGS = new Set<string>([
  "yle",
  "secondary",
  "adult",
  "ielts-academic-full",
  "ielts-gt-full",
  "ielts-academic-short",
  "ielts-gt-short",
]);

function isPlacementCategoryId(value: string | undefined): value is PlacementCategoryId {
  return value === "ielts" || value === "cambridge" || value === "general";
}

function isPlacementTestSlug(value: string | undefined): value is PlacementSlug {
  return Boolean(value && PLACEMENT_SLUGS.has(value));
}

export function buildPlacementPageUrl(preset?: PlacementPickerPreset): string {
  const params = new URLSearchParams();
  if (preset?.categoryId) params.set("category", preset.categoryId);
  if (preset?.testSlug) params.set("test", preset.testSlug);
  else if (preset?.paperId) params.set("paperId", preset.paperId);
  const query = params.toString();
  return query ? `/placement?${query}` : "/placement";
}

export function buildPlacementShareUrl(
  preset?: PlacementPickerPreset,
  origin = typeof window !== "undefined" ? window.location.origin : "https://camba.me"
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${buildPlacementPageUrl(preset)}`;
}

/** callbackUrl nội bộ sau đăng nhập / đăng ký — quay lại popup với đề đã chọn */
export function buildPlacementAuthCallbackUrl(preset?: PlacementPickerPreset): string {
  return buildPlacementPageUrl(preset);
}

export function parsePlacementPageSearchParams(searchParams: {
  paperId?: string;
  category?: string;
  test?: string;
}): PlacementPickerPreset | undefined {
  const paperId = searchParams.paperId?.trim() || undefined;
  const categoryRaw = searchParams.category?.trim();
  const categoryId = isPlacementCategoryId(categoryRaw) ? categoryRaw : undefined;
  const testSlug = isPlacementTestSlug(searchParams.test?.trim())
    ? searchParams.test.trim()
    : undefined;
  if (!paperId && !categoryId && !testSlug) return undefined;
  return { paperId, categoryId, testSlug };
}

export function parsePlacementHref(href: string): PlacementPickerPreset | null {
  if (!href.startsWith("/placement")) return null;
  try {
    const url = new URL(href, "https://camba.me");
    return (
      parsePlacementPageSearchParams({
        paperId: url.searchParams.get("paperId") ?? undefined,
        category: url.searchParams.get("category") ?? undefined,
        test: url.searchParams.get("test") ?? undefined,
      }) ?? {}
    );
  } catch {
    return {};
  }
}

export function presetFromPaperSelection(
  categoryId: PlacementCategoryId | "",
  paper: { id: string; placementSlug: string | null; title: string } | undefined,
  resolveSlug: (paper: { placementSlug: string | null; title: string }) => string | null
): PlacementPickerPreset | undefined {
  if (!categoryId && !paper) return undefined;
  const testSlug = paper ? resolveSlug(paper) : null;
  return {
    categoryId: categoryId || undefined,
    paperId: paper?.id,
    testSlug: testSlug ?? undefined,
  };
}
