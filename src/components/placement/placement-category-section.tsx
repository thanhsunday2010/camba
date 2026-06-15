import { Badge } from "@/components/ui/badge";
import { PlacementStartCard } from "@/components/placement/placement-start-card";
import {
  PLACEMENT_CATEGORIES,
  type PlacementCategoryId,
  type PlacementPaperListItem,
} from "@/lib/placement/categories";

interface PlacementCategorySectionProps {
  categoryId: PlacementCategoryId;
  papers: PlacementPaperListItem[];
  placementRemaining?: number | null;
  placementLimit?: number | null;
}

export function PlacementCategorySection({
  categoryId,
  papers,
  placementRemaining,
  placementLimit,
}: PlacementCategorySectionProps) {
  if (papers.length === 0) return null;

  const meta = PLACEMENT_CATEGORIES[categoryId];

  return (
    <section className={meta.sectionClass}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-extrabold ${meta.titleClass}`}>{meta.title}</h2>
          <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
            {meta.description}
          </p>
        </div>
        <Badge className={meta.badgeClass}>{papers.length} đề</Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {papers.map((paper) => (
          <PlacementStartCard
            key={paper.id}
            paper={{
              id: paper.id,
              title: paper.title,
              description: paper.description,
              timeLimit: paper.timeLimit,
            }}
            theme={categoryId}
            placementRemaining={placementRemaining}
            placementLimit={placementLimit}
          />
        ))}
      </div>
    </section>
  );
}
