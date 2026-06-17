import Link from "next/link";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { YLE_LEVELS, yleLevelLabel, type YleLevel } from "@/lib/yle/constants";
import { CambaMascot } from "@/components/kids/camba-mascot";

export function YleGalaxyPicker() {
  return (
    <div className="page-shell">
      <div className="page-hero mb-6">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <h1 className="page-title text-violet-900">Vũ trụ YLE 🌌</h1>
          <p className="page-intro mt-1">
            Chọn hành tinh Starters, Movers hoặc Flyers — luyện tập quanh quỹ đạo cùng Camba!
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {YLE_LEVELS.map((level) => {
          const theme = LEVEL_THEMES[level];
          return (
            <Link
              key={level}
              href={`/yle/${level}`}
              className={`group flex flex-col items-center rounded-3xl border-4 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${theme.border} ${theme.bg}`}
            >
              <span
                className="mb-3 text-5xl transition-transform group-hover:scale-110 motion-safe:animate-yle-planet-pulse"
                aria-hidden
              >
                {theme.emoji}
              </span>
              <p className="font-extrabold text-violet-900">{yleLevelLabel(level as YleLevel)}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{level}</p>
              <span className="mt-4 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white group-hover:bg-violet-700">
                Vào quỹ đạo →
              </span>
            </Link>
          );
        })}
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
