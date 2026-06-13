import { CambaMascot, type MascotMood } from "./camba-mascot";
import { cn } from "@/lib/utils";

/** Inline mascot for hero / section headers (always visible on page) */
export function MascotHero({
  message,
  mood = "wave",
  className,
}: {
  message: string;
  mood?: MascotMood;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-end", className)}>
      <CambaMascot size="xl" mood={mood} />
      <div className="relative max-w-sm rounded-3xl rounded-bl-sm border-2 border-white/40 bg-white/20 px-5 py-4 backdrop-blur-sm">
        <p className="text-base font-extrabold leading-snug text-white md:text-lg">{message}</p>
        <div className="absolute -left-2 bottom-6 h-4 w-4 rotate-45 border-b-2 border-l-2 border-white/40 bg-white/20" />
      </div>
    </div>
  );
}
