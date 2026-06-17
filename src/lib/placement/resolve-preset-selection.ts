import {
  groupPlacementPapersByCategory,
  PLACEMENT_CATEGORY_ORDER,
  type PlacementCategoryId,
  type PlacementPaperListItem,
} from "@/lib/placement/categories";
import { resolvePlacementSlug } from "@/lib/placement/placement-config";
import type { PlacementPickerPreset } from "@/lib/placement/picker-url";

export function resolvePresetSelection(
  papers: PlacementPaperListItem[],
  preset?: PlacementPickerPreset
): { categoryId: PlacementCategoryId | ""; paperId: string } {
  if (!preset?.paperId && !preset?.categoryId && !preset?.testSlug) {
    return { categoryId: "", paperId: "" };
  }

  const grouped = groupPlacementPapersByCategory(papers);

  if (preset.testSlug) {
    for (const id of PLACEMENT_CATEGORY_ORDER) {
      const match = grouped[id].find(
        (p) => resolvePlacementSlug(p) === preset.testSlug
      );
      if (match) {
        return { categoryId: id, paperId: match.id };
      }
    }
  }

  if (preset.paperId) {
    for (const id of PLACEMENT_CATEGORY_ORDER) {
      const match = grouped[id].find((p) => p.id === preset.paperId);
      if (match) {
        return { categoryId: id, paperId: match.id };
      }
    }
  }

  if (preset.categoryId && grouped[preset.categoryId]?.length) {
    const list = grouped[preset.categoryId];
    return {
      categoryId: preset.categoryId,
      paperId: list.length === 1 ? list[0].id : "",
    };
  }

  return { categoryId: "", paperId: "" };
}
