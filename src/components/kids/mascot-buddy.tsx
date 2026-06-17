import type { ReactNode } from "react";
import { CambaMascot, type MascotMood } from "./camba-mascot";
import { cn } from "@/lib/utils";

/** Inline mascot for hero / section headers (always visible on page) */
export function MascotHero({
  message,
  messageSlot,
  mood = "wave",
  className,
}: {
  message?: string;
  messageSlot?: ReactNode;
  mood?: MascotMood;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full min-w-0 max-w-full flex-col items-center gap-4 sm:flex-row sm:items-end", className)}>
      <CambaMascot
        size="lg"
        mood={mood}
        className="h-36 w-36 sm:h-44 sm:w-44 lg:h-52 lg:w-52"
      />
      <div className="relative w-full max-w-[min(100%,18rem)] rounded-3xl rounded-bl-sm border-2 border-white/40 bg-white/20 px-4 py-3 backdrop-blur-sm sm:max-w-sm sm:px-5 sm:py-4">
        {messageSlot ?? (
          <p className="text-base font-extrabold leading-snug text-white md:text-lg">{message}</p>
        )}
        <div className="absolute -left-2 bottom-6 hidden h-4 w-4 rotate-45 border-b-2 border-l-2 border-white/40 bg-white/20 sm:block" />
      </div>
    </div>
  );
}
