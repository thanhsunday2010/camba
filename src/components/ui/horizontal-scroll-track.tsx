"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollTrackProps {
  children: ReactNode;
  className?: string;
  /** Accessible label for the scroll region */
  label?: string;
  /** Show swipe hint on the right */
  showHint?: boolean;
  /** Edge fade masks */
  fadeEdges?: boolean;
}

export function HorizontalScrollTrack({
  children,
  className,
  label,
  showHint = true,
  fadeEdges = true,
}: HorizontalScrollTrackProps) {
  return (
    <div className={cn("relative", className)}>
      {fadeEdges && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent sm:w-8"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent sm:w-12"
            aria-hidden
          />
        </>
      )}
      <div
        className="scroll-track flex gap-3 sm:gap-4"
        role={label ? "region" : undefined}
        aria-label={label}
      >
        {children}
      </div>
      {showHint && (
        <p className="mt-2 flex items-center justify-end gap-1 text-[11px] font-semibold text-muted-foreground sm:hidden">
          Vuốt để xem thêm
          <ChevronRight className="h-3.5 w-3.5 animate-pulse" aria-hidden />
        </p>
      )}
    </div>
  );
}
