"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlacementPicker } from "@/components/placement/placement-picker-provider";

type PlacementOpenButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function PlacementOpenButton({
  children,
  className,
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
        openPlacementPicker();
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
  onNavigate?: () => void;
};

export function PlacementOpenLink({ children, className, onNavigate }: PlacementOpenLinkProps) {
  const { openPlacementPicker } = usePlacementPicker();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        openPlacementPicker();
        onNavigate?.();
      }}
    >
      {children}
    </button>
  );
}
