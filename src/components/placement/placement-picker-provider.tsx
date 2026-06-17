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
import { PlacementPickerDialog } from "@/components/placement/placement-picker-dialog";

export type PlacementUsageSnapshot = PlacementWeeklySnapshot | null;

type PlacementPickerContextValue = {
  openPlacementPicker: () => void;
  papers: PlacementPaperListItem[];
  placementUsage: PlacementUsageSnapshot;
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
}: {
  children: ReactNode;
  papers: PlacementPaperListItem[];
  placementUsage: PlacementUsageSnapshot;
}) {
  const [open, setOpen] = useState(false);

  const openPlacementPicker = useCallback(() => setOpen(true), []);

  const value = useMemo(
    () => ({ openPlacementPicker, papers, placementUsage }),
    [openPlacementPicker, papers, placementUsage]
  );

  return (
    <PlacementPickerContext.Provider value={value}>
      {children}
      <PlacementPickerDialog
        open={open}
        onOpenChange={setOpen}
        papers={papers}
        placementUsage={placementUsage}
      />
    </PlacementPickerContext.Provider>
  );
}
