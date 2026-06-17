import { PlacementRecentAttempts } from "@/components/placement/placement-recent-attempts";
import { PlacementPageClient } from "@/components/placement/placement-page-client";
import { parsePlacementPageSearchParams } from "@/lib/placement/picker-url";

export const revalidate = 60;

export default async function PlacementPage({
  searchParams,
}: {
  searchParams: Promise<{ paperId?: string; category?: string }>;
}) {
  const params = await searchParams;
  const initialPreset = parsePlacementPageSearchParams(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <PlacementPageClient initialPreset={initialPreset} />
      <PlacementRecentAttempts />
    </div>
  );
}
