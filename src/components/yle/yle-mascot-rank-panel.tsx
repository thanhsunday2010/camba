import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CambaMascot } from "@/components/kids/camba-mascot";
import type { YleMascotRankProgress } from "@/lib/yle/mascot-ranks";
import type { YleLevelStats } from "@/lib/yle/progress";

interface YleMascotRankPanelProps {
  mascotRank: YleMascotRankProgress;
  stats: YleLevelStats;
}

export function YleMascotRankPanel({ mascotRank, stats }: YleMascotRankPanelProps) {
  const { current, next, progressPct, milestones } = mascotRank;

  return (
    <Card className="border-pink-200 bg-gradient-to-br from-pink-50/60 to-white">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <CambaMascot size="sm" mood="happy" rankTier={current.tier} />
          <div>
            <CardTitle className="text-base font-extrabold text-pink-900">
              {current.emoji} {current.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{current.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <StatPill label="Luyện tập" value={stats.practiceCompleted} />
          <StatPill label="Mock" value={stats.mockCompleted} />
          <StatPill label="Hoàn thành" value={`${stats.completionPct}%`} />
        </div>

        {next ? (
          <>
            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span>Tiến tới {next.emoji} {next.name}</span>
                <span className="text-violet-700">{progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <ul className="space-y-1.5">
              {milestones.map((m) => (
                <li key={m.label} className="flex items-center justify-between text-xs">
                  <span className={m.done ? "text-emerald-700" : "text-muted-foreground"}>
                    {m.done ? "✅" : "⭕"} {m.label}
                  </span>
                  <span className="font-semibold">
                    {m.label.includes("%") ? `${m.current}%` : m.current} / {m.target}
                    {m.label.includes("%") ? "%" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-sm font-bold text-amber-800">
            👑 Camba đã đạt bậc cao nhất tại level này!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-pink-100 bg-white px-2 py-1.5">
      <p className="font-extrabold text-pink-800">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
