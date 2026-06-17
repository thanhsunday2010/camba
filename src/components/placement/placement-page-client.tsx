"use client";

import { useEffect, useRef } from "react";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { PlacementOpenButton } from "@/components/placement/placement-open-button";
import { usePlacementPicker } from "@/components/placement/placement-picker-provider";
import type { PlacementPickerPreset } from "@/lib/placement/picker-url";
import { PlacementPageHero } from "@/components/inline-edit/page-editable-sections";

export function PlacementPageClient({ initialPreset }: { initialPreset?: PlacementPickerPreset }) {
  const { openPlacementPicker } = usePlacementPicker();
  const openedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    openPlacementPicker(initialPreset);
  }, [openPlacementPicker, initialPreset]);

  return (
    <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
      <CambaMascot size="lg" mood="think" className="mb-3 sm:mb-4" />
      <PlacementPageHero />
      <PlacementOpenButton className="mt-5 kid-btn-fun rounded-full sm:mt-6" size="lg" preset={initialPreset}>
        🎯 Chọn & bắt đầu
      </PlacementOpenButton>
    </div>
  );
}
