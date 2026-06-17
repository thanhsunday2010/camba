"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PlacementPaperListItem } from "@/lib/placement/categories";
import type { PlacementWeeklySnapshot } from "@/lib/subscription/placement-limit";
import type { PlacementPickerPreset } from "@/lib/placement/picker-url";
import { PlacementPickerDialog } from "@/components/placement/placement-picker-dialog";

export type PlacementUsageSnapshot = PlacementWeeklySnapshot | null;

type PlacementPickerContextValue = {
  openPlacementPicker: (preset?: PlacementPickerPreset) => void;
  papers: PlacementPaperListItem[];
  placementUsage: PlacementUsageSnapshot;
  initialIsLoggedIn: boolean;
};

const PlacementPickerContext = createContext<PlacementPickerContextValue | null>(null);

export function usePlacementPicker() {
  const ctx = useContext(PlacementPickerContext);
  if (!ctx) {
    throw new Error("usePlacementPicker must be used within PlacementPickerProvider");
  }
  return ctx;
}

export function PlacementPickerProvider({
  children,
  papers,
  placementUsage,
  initialIsLoggedIn,
}: {
  children: ReactNode;
  papers: PlacementPaperListItem[];
  placementUsage: PlacementUsageSnapshot;
  initialIsLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<PlacementPickerPreset | undefined>();

  const openPlacementPicker = useCallback((preset?: PlacementPickerPreset) => {
    setPendingPreset(preset);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setPendingPreset(undefined);
    }
  }, []);

  const value = useMemo(
    () => ({ openPlacementPicker, papers, placementUsage, initialIsLoggedIn }),
    [openPlacementPicker, papers, placementUsage, initialIsLoggedIn]
  );

  return (
    <PlacementPickerContext.Provider value={value}>
      {children}
      <PlacementPickerDialog
        open={open}
        onOpenChange={handleOpenChange}
        papers={papers}
        placementUsage={placementUsage}
        pendingPreset={pendingPreset}
        initialIsLoggedIn={initialIsLoggedIn}
      />
    </PlacementPickerContext.Provider>
  );
}
