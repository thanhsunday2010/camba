import { cn } from "@/lib/utils";

/** Soft starfield backdrop for YLE / home space sections */
export function YleStarfield({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.12),transparent_50%)]" />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white motion-safe:animate-twinkle"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

const STARS = [
  { x: "8%", y: "12%", size: 3, opacity: 0.9, delay: 0 },
  { x: "22%", y: "28%", size: 2, opacity: 0.6, delay: 0.4 },
  { x: "45%", y: "8%", size: 2, opacity: 0.7, delay: 1.2 },
  { x: "68%", y: "18%", size: 3, opacity: 0.85, delay: 0.8 },
  { x: "88%", y: "32%", size: 2, opacity: 0.5, delay: 1.6 },
  { x: "15%", y: "62%", size: 2, opacity: 0.65, delay: 0.2 },
  { x: "52%", y: "72%", size: 3, opacity: 0.75, delay: 1 },
  { x: "78%", y: "58%", size: 2, opacity: 0.55, delay: 2 },
  { x: "92%", y: "78%", size: 2, opacity: 0.7, delay: 0.6 },
  { x: "35%", y: "42%", size: 2, opacity: 0.4, delay: 1.4 },
] as const;

interface PlanetOrbProps {
  gradient: string;
  ring?: string;
  size?: "sm" | "md" | "lg";
  emoji?: string;
  className?: string;
}

const ORB_SIZES = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function PlanetOrb({
  gradient,
  ring = "ring-violet-300/40",
  size = "md",
  emoji,
  className,
}: PlanetOrbProps) {
  return (
    <div className={cn("relative shrink-0", ORB_SIZES[size], className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-full shadow-[inset_-8px_-12px_24px_rgba(0,0,0,0.25),0_8px_32px_rgba(124,58,237,0.35)] ring-2",
          gradient,
          ring
        )}
      />
      <div className="absolute left-[18%] top-[15%] h-[28%] w-[38%] rotate-[-24deg] rounded-full bg-white/35 blur-[2px]" />
      {emoji && (
        <span className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow-md sm:text-3xl">
          {emoji}
        </span>
      )}
    </div>
  );
}

/** Circular progress ring around skill icon */
export function SkillProgressRing({
  pct,
  gradient,
  emoji,
  size = 56,
}: {
  pct: number;
  gradient: string;
  emoji: string;
  size?: number;
}) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/25"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#skillRingGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
        <defs>
          <linearGradient id="skillRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={gradient} stopColor="currentColor" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl">{emoji}</span>
    </div>
  );
}
