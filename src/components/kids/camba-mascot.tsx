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
  const wink = mood === "happy" || mood === "cheer";

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
        <ellipse
          cx="60"
          cy="112"
          rx="26"
          ry="5"
          fill="#000"
          fillOpacity="0.1"
          className="animate-mascot-shadow"
        />

        {/* Tail puff */}
        <circle cx="94" cy="82" r="10" fill="#E5E7EB" />
        <circle cx="98" cy="78" r="7" fill="#F3F4F6" />

        {/* Ears (behind head) */}
        <g className={cn(animate && "origin-[38px_18px] animate-mascot-ear-left")}>
          <ellipse cx="38" cy="22" rx="10" ry="28" fill="#D1D5DB" transform="rotate(-8 38 22)" />
          <ellipse cx="38" cy="22" rx="6" ry="20" fill="#FBCFE8" transform="rotate(-8 38 22)" />
        </g>
        <g
          className={cn(
            mood === "wave" && animate && "origin-[82px_18px] animate-mascot-ear-right",
            mood !== "wave" && animate && "origin-[82px_18px] animate-mascot-ear-left"
          )}
          style={{ animationDelay: mood === "wave" ? "0s" : "0.3s" }}
        >
          <ellipse cx="82" cy="22" rx="10" ry="28" fill="#D1D5DB" transform="rotate(8 82 22)" />
          <ellipse cx="82" cy="22" rx="6" ry="20" fill="#FBCFE8" transform="rotate(8 82 22)" />
        </g>

        {/* Body */}
        <ellipse cx="60" cy="78" rx="34" ry="30" fill="url(#rabbitBody)" />
        <ellipse cx="60" cy="82" rx="22" ry="18" fill="#FAFAFA" />

        {/* Left arm */}
        <ellipse cx="30" cy="76" rx="9" ry="12" fill="#D1D5DB" transform="rotate(-20 30 76)" />

        {/* Right arm — wave */}
        <g
          className={cn(mood === "wave" && animate && "origin-[90px_72px] animate-mascot-wave")}
        >
          <ellipse cx="90" cy="72" rx="9" ry="12" fill="#D1D5DB" transform="rotate(25 90 72)" />
          {/* Paw pads */}
          <circle cx="96" cy="64" r="5" fill="#F9A8D4" />
        </g>

        {/* Feet */}
        <ellipse cx="46" cy="104" rx="11" ry="6" fill="#F9A8D4" />
        <ellipse cx="74" cy="104" rx="11" ry="6" fill="#F9A8D4" />

        {/* Head */}
        <circle cx="60" cy="54" r="30" fill="url(#rabbitFace)" />

        {/* Cheeks */}
        <circle cx="38" cy="58" r="6" fill="#FDA4AF" fillOpacity="0.55" />
        <circle cx="82" cy="58" r="6" fill="#FDA4AF" fillOpacity="0.55" />

        {/* Eyes */}
        <g className={cn(animate && "animate-mascot-blink")}>
          {/* Left eye — wink when lém lỉnh */}
          {wink ? (
            <path
              d="M42 52 Q48 58 54 52"
              stroke="#1E1B4B"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <>
              <circle cx="48" cy="52" r="9" fill="white" />
              <circle cx="48" cy="53" r="5" fill="#1E1B4B" />
              <circle cx="50" cy="51" r="2" fill="white" />
            </>
          )}
          {/* Right eye — always open, slightly larger (smart look) */}
          <circle cx="72" cy="52" r="10" fill="white" />
          <circle cx="72" cy="53" r="6" fill="#1E1B4B" />
          <circle cx="74" cy="51" r="2.5" fill="white" />
        </g>

        {/* Glasses — think mood (thông minh) */}
        {mood === "think" && (
          <g stroke="#6366F1" strokeWidth="2" fill="none">
            <circle cx="48" cy="52" r="11" />
            <circle cx="72" cy="52" r="11" />
            <line x1="59" y1="52" x2="61" y2="52" />
            <line x1="37" y1="50" x2="32" y2="48" />
          </g>
        )}

        {/* Think — paw on chin */}
        {mood === "think" && (
          <ellipse cx="86" cy="64" rx="7" ry="6" fill="#D1D5DB" />
        )}

        {/* Nose */}
        <ellipse cx="60" cy="60" rx="5" ry="4" fill="#F472B6" />

        {/* Mouth — lém lỉnh smirk */}
        <path
          d={
            mood === "cheer"
              ? "M52 66 Q60 74 68 66"
              : "M54 66 Q62 70 70 64"
          }
          stroke="#374151"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Two front teeth */}
        <rect x="56" y="64" width="4" height="5" rx="1" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />
        <rect x="61" y="64" width="4" height="5" rx="1" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />

        {/* Graduation cap */}
        <g className={cn(animate && "origin-[60px_30px] animate-mascot-cap-tilt")}>
          <polygon points="60,14 34,28 86,28" fill="#4F46E5" />
          <rect x="44" y="28" width="32" height="4" rx="1" fill="#3730A3" />
          <line x1="84" y1="29" x2="92" y2="38" stroke="#FBBF24" strokeWidth="2" />
          <circle cx="92" cy="39" r="3" fill="#F59E0B" />
        </g>

        {/* Cheer sparkles + lightbulb (thông minh) */}
        {mood === "cheer" && (
          <>
            <text x="6" y="28" fontSize="13" className="animate-float">
              💡
            </text>
            <text x="96" y="20" fontSize="12" className="animate-float" style={{ animationDelay: "0.5s" }}>
              ✨
            </text>
          </>
        )}

        <defs>
          <linearGradient id="rabbitBody" x1="26" y1="50" x2="94" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E5E7EB" />
            <stop offset="1" stopColor="#D1D5DB" />
          </linearGradient>
          <linearGradient id="rabbitFace" x1="30" y1="24" x2="90" y2="84" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9FAFB" />
            <stop offset="1" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
