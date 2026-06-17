import Link from "next/link";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { YLE_LEVELS, yleLevelLabel, type YleLevel } from "@/lib/yle/constants";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { HorizontalScrollTrack } from "@/components/ui/horizontal-scroll-track";
import { PlanetOrb, YleStarfield } from "@/components/yle/yle-space-visuals";

export function YleGalaxyPicker() {
  return (
    <div className="page-shell">
      <div className="relative overflow-hidden rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-5 text-white shadow-xl sm:p-8">
        <YleStarfield />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <CambaMascot size="lg" mood="wave" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Vũ trụ YLE 🌌</h1>
            <p className="mt-2 max-w-md text-sm font-medium text-violet-200/90 sm:text-base">
              Chọn hành tinh Starters, Movers hoặc Flyers — vuốt ngang để khám phá cùng Camba!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-violet-700">
          Hành tinh Cambridge YLE
        </p>
        <HorizontalScrollTrack label="Chọn level YLE">
          {YLE_LEVELS.map((level) => {
            const theme = LEVEL_THEMES[level];
            return (
              <Link
                key={level}
                href={`/yle/${level}`}
                className="scroll-card group relative flex w-[min(82vw,18rem)] flex-col overflow-hidden rounded-3xl border-2 border-violet-200/60 bg-gradient-to-br from-slate-900 to-violet-950 p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <YleStarfield className="opacity-60" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <PlanetOrb
                    gradient={theme.planetGradient}
                    emoji={theme.emoji}
                    size="lg"
                    className="mb-4 motion-safe:group-hover:scale-105"
                  />
                  <p className="text-lg font-extrabold">{yleLevelLabel(level as YleLevel)}</p>
                  <p className="mt-1 text-xs font-semibold text-violet-300">{level}</p>
                  <span
                    className={`mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md ${theme.btnClass}`}
                  >
                    Vào quỹ đạo →
                  </span>
                </div>
              </Link>
            );
          })}
        </HorizontalScrollTrack>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        KET / PET / FCE?{" "}
        <Link href="/exams" className="font-semibold text-violet-700 underline">
          Về hub Cambridge Secondary
        </Link>
      </p>
    </div>
  );
}
