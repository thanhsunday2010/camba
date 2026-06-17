"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CambaMascot } from "@/components/kids/camba-mascot";
import type { YleMascotRankProgress } from "@/lib/yle/mascot-ranks";

export interface OrbitNodeData {
  id: string;
  label: string;
  emoji: string;
  href: string;
  progressPct: number;
  completed: number;
  total: number;
  locked?: boolean;
}

interface YleOrbitHubProps {
  level: string;
  levelLabel: string;
  planetEmoji: string;
  themeBorder: string;
  themeBg: string;
  nodes: OrbitNodeData[];
  mascotRank: YleMascotRankProgress;
}

export function YleOrbitHub({
  level,
  levelLabel,
  planetEmoji,
  themeBorder,
  themeBg,
  nodes,
  mascotRank,
}: YleOrbitHubProps) {
  const nodeCount = nodes.length;
  const orbitRadius = "clamp(7.5rem, 34vw, 9.5rem)";

  return (
    <div className="mx-auto w-full max-w-lg">
      <div
        className={cn(
          "relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[26rem]",
          "select-none"
        )}
      >
        {/* Orbit ring glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border-2 border-dashed border-violet-300/60 opacity-70 motion-safe:animate-yle-orbit-spin"
          style={{
            width: `calc(${orbitRadius} * 2 + 3rem)`,
            height: `calc(${orbitRadius} * 2 + 3rem)`,
            marginLeft: `calc((${orbitRadius} * 2 + 3rem) / -2)`,
            marginTop: `calc((${orbitRadius} * 2 + 3rem) / -2)`,
          }}
          aria-hidden
        />

        {/* Orbiting nodes */}
        <div className="absolute inset-0 motion-safe:animate-yle-orbit-spin">
          {nodes.map((node, i) => {
            const angle = (360 / nodeCount) * i - 90;
            return (
              <div
                key={node.id}
                className="absolute left-1/2 top-1/2 z-10"
                style={{
                  transform: `rotate(${angle}deg) translateY(calc(-1 * ${orbitRadius}))`,
                }}
              >
                <div className="-translate-x-1/2 motion-safe:animate-yle-orbit-counter">
                  <OrbitNode node={node} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Center planet + Camba */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            className={cn(
              "relative flex flex-col items-center rounded-full border-4 p-3 shadow-xl sm:p-4",
              themeBorder,
              themeBg,
              "motion-safe:animate-yle-planet-pulse"
            )}
            style={{ width: "clamp(9rem, 42vw, 11rem)", height: "clamp(9rem, 42vw, 11rem)" }}
          >
            <span className="text-3xl sm:text-4xl" aria-hidden>
              {planetEmoji}
            </span>
            <CambaMascot
              size="sm"
              mood="cheer"
              rankTier={mascotRank.current.tier}
              className="mt-0.5 scale-90 sm:scale-100"
            />
            <p className="mt-0.5 text-center text-[10px] font-bold leading-tight text-violet-900 sm:text-xs">
              {mascotRank.current.emoji} {mascotRank.current.name}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h1 className="page-title text-violet-900">{levelLabel}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vũ trụ YLE · {level} · Chạm vào vệ tinh để luyện tập
        </p>
      </div>
    </div>
  );
}

function OrbitNode({ node }: { node: OrbitNodeData }) {
  const inner = (
    <>
      <span className="text-xl sm:text-2xl">{node.emoji}</span>
      <span className="max-w-[4.5rem] truncate text-[10px] font-bold leading-tight sm:max-w-[5rem] sm:text-xs">
        {node.label}
      </span>
      {node.total > 0 && (
        <span className="text-[9px] font-semibold text-violet-600 sm:text-[10px]">
          {node.progressPct}%
        </span>
      )}
      <span
        className="absolute -bottom-0.5 left-1/2 h-1 w-10 -translate-x-1/2 overflow-hidden rounded-full bg-violet-100"
        aria-hidden
      >
        <span
          className="block h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${node.progressPct}%` }}
        />
      </span>
    </>
  );

  const className = cn(
    "relative flex w-[4.75rem] flex-col items-center gap-0.5 rounded-2xl border-2 bg-white/95 px-1.5 py-2 text-center shadow-md transition-transform",
    "hover:scale-110 hover:shadow-lg active:scale-95",
    node.locked
      ? "cursor-not-allowed border-gray-200 opacity-60"
      : "border-violet-200 hover:border-violet-400"
  );

  if (node.locked) {
    return (
      <div className={className} title="Đã hết lượt mock hôm nay">
        {inner}
      </div>
    );
  }

  return (
    <Link href={node.href} className={className}>
      {inner}
    </Link>
  );
}
