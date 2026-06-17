"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlacementPickerPreset } from "@/lib/placement/picker-url";
import { usePlacementPicker } from "@/components/placement/placement-picker-provider";

type PlacementOpenButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  children: ReactNode;
  preset?: PlacementPickerPreset;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function PlacementOpenButton({
  children,
  className,
  preset,
  onClick,
  ...props
}: PlacementOpenButtonProps) {
  const { openPlacementPicker } = usePlacementPicker();

  return (
    <Button
      type="button"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        openPlacementPicker(preset);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

type PlacementOpenLinkProps = {
  children: ReactNode;
  className?: string;
  preset?: PlacementPickerPreset;
  onNavigate?: () => void;
};

export function PlacementOpenLink({
  children,
  className,
  preset,
  onNavigate,
}: PlacementOpenLinkProps) {
  const { openPlacementPicker } = usePlacementPicker();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        openPlacementPicker(preset);
        onNavigate?.();
      }}
    >
      {children}
    </button>
  );
}
