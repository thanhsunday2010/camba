import { PlacementRecentAttempts } from "@/components/placement/placement-recent-attempts";
import { PlacementPageClient } from "@/components/placement/placement-page-client";

export const revalidate = 60;

export default function PlacementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PlacementPageClient />
      <PlacementRecentAttempts />
    </div>
  );
}
