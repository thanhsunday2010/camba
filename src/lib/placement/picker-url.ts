import type { PlacementCategoryId } from "@/lib/placement/categories";

export type PlacementPickerPreset = {
  paperId?: string;
  categoryId?: PlacementCategoryId;
};

function isPlacementCategoryId(value: string | undefined): value is PlacementCategoryId {
  return value === "ielts" || value === "cambridge" || value === "general";
}

export function buildPlacementPageUrl(preset?: PlacementPickerPreset): string {
  const params = new URLSearchParams();
  if (preset?.categoryId) params.set("category", preset.categoryId);
  if (preset?.paperId) params.set("paperId", preset.paperId);
  const query = params.toString();
  return query ? `/placement?${query}` : "/placement";
}

/** callbackUrl nội bộ sau đăng nhập / đăng ký — quay lại popup với đề đã chọn */
export function buildPlacementAuthCallbackUrl(preset?: PlacementPickerPreset): string {
  return buildPlacementPageUrl(preset);
}

export function parsePlacementPageSearchParams(searchParams: {
  paperId?: string;
  category?: string;
}): PlacementPickerPreset | undefined {
  const paperId = searchParams.paperId?.trim() || undefined;
  const categoryRaw = searchParams.category?.trim();
  const categoryId = isPlacementCategoryId(categoryRaw) ? categoryRaw : undefined;
  if (!paperId && !categoryId) return undefined;
  return { paperId, categoryId };
}

export function parsePlacementHref(href: string): PlacementPickerPreset | null {
  if (!href.startsWith("/placement")) return null;
  try {
    const url = new URL(href, "https://camba.me");
    return (
      parsePlacementPageSearchParams({
        paperId: url.searchParams.get("paperId") ?? undefined,
        category: url.searchParams.get("category") ?? undefined,
      }) ?? {}
    );
  } catch {
    return {};
  }
}
