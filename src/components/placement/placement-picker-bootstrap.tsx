import { getPublishedPlacementPapers } from "@/lib/exam/cached-papers";
import { getSession } from "@/lib/auth-session";
import { getPlacementWeeklySnapshot } from "@/lib/subscription/placement-limit";
import { PlacementPickerProvider } from "@/components/placement/placement-picker-provider";

export async function PlacementPickerBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const [papers, session] = await Promise.all([
    getPublishedPlacementPapers(),
    getSession(),
  ]);

  const placementUsage = session?.user?.id
    ? await getPlacementWeeklySnapshot(session.user.id)
    : null;

  return (
    <PlacementPickerProvider
      papers={papers}
      placementUsage={placementUsage}
      initialIsLoggedIn={!!session?.user?.id}
    >
      {children}
    </PlacementPickerProvider>
  );
}
