"use client";

import { useEffect, useRef } from "react";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { PlacementOpenButton } from "@/components/placement/placement-open-button";
import { usePlacementPicker } from "@/components/placement/placement-picker-provider";
import type { PlacementPickerPreset } from "@/lib/placement/picker-url";

export function PlacementPageClient({ initialPreset }: { initialPreset?: PlacementPickerPreset }) {
  const { openPlacementPicker } = usePlacementPicker();
  const openedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    openPlacementPicker(initialPreset);
  }, [openPlacementPicker, initialPreset]);

  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <CambaMascot size="lg" mood="think" className="mb-4" />
      <h1 className="text-3xl font-extrabold kid-gradient-text">Test trình độ</h1>
      <p className="mt-2 max-w-lg font-semibold text-muted-foreground">
        Chọn chương trình và loại đề trong hộp thoại — làm bài ngay, không cần duyệt danh sách.
      </p>
      <PlacementOpenButton className="mt-6 kid-btn-fun rounded-full" size="lg" preset={initialPreset}>
        🎯 Chọn & bắt đầu test
      </PlacementOpenButton>
    </div>
  );
}
