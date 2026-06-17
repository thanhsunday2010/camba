"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { SKILL_COLORS } from "@/lib/kids/level-themes";
import { HorizontalScrollTrack } from "@/components/ui/horizontal-scroll-track";
import { PlanetOrb, YleStarfield } from "@/components/yle/yle-space-visuals";
import type { YleMascotRankProgress } from "@/lib/yle/mascot-ranks";
import type { YleSkillNodeData } from "@/lib/yle/types";

interface YleScrollHubProps {
  level: string;
  levelLabel: string;
  planetEmoji: string;
  planetGradient: string;
  themeBorder: string;
  themeBg: string;
  nodes: YleSkillNodeData[];
  mascotRank: YleMascotRankProgress;
}

export function YleScrollHub({
  level,
  levelLabel,
  planetEmoji,
  planetGradient,
  themeBorder,
  themeBg,
  nodes,
  mascotRank,
}: YleScrollHubProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-violet-200/80 bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-4 text-white shadow-xl sm:p-6">
      <YleStarfield />

      {/* Planet hero */}
      <div className="relative z-10 mb-5 flex items-center gap-4 sm:gap-5">
        <PlanetOrb gradient={planetGradient} emoji={planetEmoji} size="lg" ring={themeBorder.replace("border", "ring")} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{levelLabel}</h1>
          <p className="mt-0.5 text-sm font-medium text-violet-200/90">Vũ trụ YLE · {level}</p>
          <div className="mt-3 flex items-end gap-2">
            <CambaMascot
              size="sm"
              mood="cheer"
              rankTier={mascotRank.current.tier}
              className="scale-90 sm:scale-100"
            />
            <div className={cn("rounded-2xl border px-3 py-1.5 text-xs font-bold sm:text-sm", themeBorder, themeBg, "text-violet-950")}>
              {mascotRank.current.emoji} {mascotRank.current.name}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal skill track */}
      <div className="relative z-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-300">
          Kỹ năng · vuốt ngang
        </p>
        <HorizontalScrollTrack label="Kỹ năng luyện tập" fadeEdges={false} className="-mx-1">
          {nodes.map((node) => (
            <SkillScrollCard key={node.id} node={node} />
          ))}
        </HorizontalScrollTrack>
      </div>
    </div>
  );
}

function SkillScrollCard({ node }: { node: YleSkillNodeData }) {
  const skillKey = node.id === "USE_OF_ENGLISH" ? "USE_OF_ENGLISH" : node.id;
  const gradient = SKILL_COLORS[skillKey] ?? "from-violet-500 to-purple-600";
  const pct = node.progressPct;

  const inner = (
    <>
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 blur-2xl",
          gradient
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg ring-2 ring-white/20",
            gradient
          )}
        >
          {node.emoji}
        </div>
        {node.locked && (
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold">🔒 Hết lượt</span>
        )}
      </div>
      <p className="relative mt-3 text-base font-extrabold">{node.label}</p>
      <div className="relative mt-2">
        <div className="mb-1 flex justify-between text-[11px] font-semibold text-white/80">
          <span>Tiến độ</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all", gradient)}
            style={{ width: `${pct}%` }}
          />
        </div>
        {node.total > 0 && (
          <p className="mt-1.5 text-[11px] font-medium text-violet-200/80">
            {node.completed}/{node.total} đề
          </p>
        )}
      </div>
      {!node.locked && (
        <span className="relative mt-3 inline-flex items-center text-xs font-bold text-violet-200">
          Vào luyện →
        </span>
      )}
    </>
  );

  const className = cn(
    "scroll-card relative flex w-[min(78vw,17.5rem)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-transform",
    node.locked
      ? "cursor-not-allowed opacity-70"
      : "hover:-translate-y-1 hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
  );

  if (node.locked) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href={node.href} className={className}>
      {inner}
    </Link>
  );
}
