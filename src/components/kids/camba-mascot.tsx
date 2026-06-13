"use client";

import { cn } from "@/lib/utils";

export type MascotMood = "happy" | "cheer" | "think" | "wave";

interface CambaMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: MascotMood;
  className?: string;
  animate?: boolean;
}

const SIZES = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-36 w-36",
  xl: "h-48 w-48",
};

export function CambaMascot({
  size = "md",
  mood = "happy",
  className,
  animate = true,
}: CambaMascotProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        SIZES[size],
        animate && "animate-mascot-bounce",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-lg"
      >
        {/* Shadow */}
        <ellipse cx="60" cy="112" rx="28" ry="5" fill="#000" fillOpacity="0.12" className="animate-mascot-shadow" />

        {/* Body */}
        <ellipse cx="60" cy="72" rx="38" ry="36" fill="url(#bodyGrad)" />

        {/* Belly */}
        <ellipse cx="60" cy="78" rx="24" ry="22" fill="#EEF4FF" />

        {/* Left wing */}
        <g className={cn(mood === "wave" && animate && "origin-[28px_68px] animate-mascot-wave")}>
          <ellipse cx="28" cy="68" rx="14" ry="20" fill="#5B7CFA" transform="rotate(-15 28 68)" />
        </g>

        {/* Right wing */}
        <ellipse cx="92" cy="68" rx="14" ry="20" fill="#5B7CFA" transform="rotate(15 92 68)" />

        {/* Feet */}
        <ellipse cx="48" cy="104" rx="10" ry="5" fill="#F59E0B" />
        <ellipse cx="72" cy="104" rx="10" ry="5" fill="#F59E0B" />

        {/* Face */}
        <circle cx="60" cy="52" r="32" fill="url(#faceGrad)" />

        {/* Eyes white */}
        <circle cx="48" cy="50" r="11" fill="white" />
        <circle cx="72" cy="50" r="11" fill="white" />

        {/* Pupils — blink animation */}
        <g className={cn(animate && "animate-mascot-blink")}>
          <circle cx="48" cy="51" r="6" fill="#1E1B4B" />
          <circle cx="72" cy="51" r="6" fill="#1E1B4B" />
          <circle cx="50" cy="49" r="2" fill="white" />
          <circle cx="74" cy="49" r="2" fill="white" />
        </g>

        {/* Think mood — hand on chin */}
        {mood === "think" && (
          <circle cx="82" cy="62" r="7" fill="#7C93F5" />
        )}

        {/* Beak */}
        <path d="M60 58 L54 66 L66 66 Z" fill="#F59E0B" />

        {/* Cheeks */}
        <circle cx="38" cy="58" r="5" fill="#FDA4AF" fillOpacity="0.6" />
        <circle cx="82" cy="58" r="5" fill="#FDA4AF" fillOpacity="0.6" />

        {/* Graduation cap */}
        <g className={cn(animate && "origin-[60px_28px] animate-mascot-cap-tilt")}>
          <polygon points="60,12 30,26 90,26" fill="#1E1B4B" />
          <rect x="42" y="26" width="36" height="5" rx="1" fill="#312E81" />
          <line x1="88" y1="28" x2="96" y2="38" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="96" cy="39" r="3" fill="#FBBF24" />
        </g>

        {/* Cheer — sparkles */}
        {mood === "cheer" && (
          <>
            <text x="8" y="30" fontSize="14" className="animate-float">✨</text>
            <text x="98" y="22" fontSize="12" className="animate-float" style={{ animationDelay: "0.5s" }}>⭐</text>
          </>
        )}

        <defs>
          <linearGradient id="bodyGrad" x1="22" y1="40" x2="98" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818CF8" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="faceGrad" x1="28" y1="20" x2="92" y2="84" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A5B4FC" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
