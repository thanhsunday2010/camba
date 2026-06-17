"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type MascotMood = "happy" | "cheer" | "think" | "wave";

export type MascotActivity = "idle" | "talk" | "celebrate" | "correct" | "wrong" | "think";

interface CambaMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: MascotMood;
  activity?: MascotActivity;
  /** Mouth / limb motion while speaking or playing feedback SFX */
  talking?: boolean;
  className?: string;
  animate?: boolean;
}

const SIZES = {
  sm: "h-[4.5rem] w-[4.5rem]",
  md: "h-28 w-28",
  lg: "h-40 w-40",
  xl: "h-52 w-52",
};

export function CambaMascot({
  size = "md",
  mood = "happy",
  activity = "idle",
  talking = false,
  className,
  animate = true,
}: CambaMascotProps) {
  const uid = useId().replace(/:/g, "");
  const bodyGrad = `rb-body-${uid}`;
  const faceGrad = `rb-face-${uid}`;
  const isTalking = talking || activity === "talk" || activity === "correct" || activity === "wrong";
  const isCelebrate = activity === "celebrate" || activity === "correct";
  const wavePaw = mood === "wave" || activity === "correct" || activity === "celebrate";
  const wink = !isTalking && (mood === "happy" || mood === "cheer");
  const resolvedMood = activity === "wrong" || activity === "think" ? "think" : mood;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-end justify-center",
        SIZES[size],
        animate && "animate-mascot-bounce",
        className
      )}
      aria-label="Camba — chú thỏ thông minh"
      role="img"
    >
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full overflow-visible drop-shadow-lg"
      >
        <ellipse cx="50" cy="114" rx="22" ry="4" fill="#000" fillOpacity="0.1" className="animate-mascot-shadow" />

        {/* Tail */}
        <circle cx="78" cy="88" r="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />

        {/* Body */}
        <g className={cn(animate && "origin-[50px_82px] animate-mascot-body-sway")}>
          <ellipse cx="50" cy="82" rx="26" ry="24" fill={`url(#${bodyGrad})`} />
          <ellipse cx="50" cy="86" rx="16" ry="13" fill="#FFFFFF" />

          {/* Feet */}
          <g
            className={cn(
              animate && (isTalking ? "origin-[50px_102px] animate-mascot-feet-talk" : "origin-[50px_102px] animate-mascot-feet")
            )}
          >
            <ellipse cx="38" cy="102" rx="9" ry="5" fill="#F9A8D4" />
            <ellipse cx="62" cy="102" rx="9" ry="5" fill="#F9A8D4" />
          </g>

          {/* Left paw */}
          <g
            className={cn(
              animate &&
                (isTalking
                  ? "origin-[24px_80px] animate-mascot-paw-talk-left"
                  : "origin-[24px_80px] animate-mascot-paw-left")
            )}
          >
            <ellipse cx="24" cy="80" rx="7" ry="9" fill="#E5E7EB" transform="rotate(-15 24 80)" />
          </g>
        </g>

        {/* Right paw — wave */}
        <g
          className={cn(
            animate && wavePaw && "origin-[76px_76px] animate-mascot-wave",
            animate && !wavePaw && isTalking && "origin-[76px_76px] animate-mascot-paw-talk-left",
            animate && !wavePaw && !isTalking && "origin-[76px_76px] animate-mascot-paw-left"
          )}
          style={{ animationDelay: wavePaw ? "0s" : "0.6s" }}
        >
          <ellipse cx="76" cy="76" rx="7" ry="9" fill="#E5E7EB" transform="rotate(20 76 76)" />
          <circle cx="80" cy="68" r="4" fill="#F9A8D4" />
        </g>

        {/* Head */}
        <circle cx="50" cy="58" r="24" fill={`url(#${faceGrad})`} stroke="#E5E7EB" strokeWidth="1" />

        {/* Cheeks */}
        <circle cx="32" cy="62" r="5" fill="#FDA4AF" fillOpacity="0.65" />
        <circle cx="68" cy="62" r="5" fill="#FDA4AF" fillOpacity="0.65" />

        {/* LONG EARS — on top of head, clearly visible */}
        <g className={cn(animate && "origin-[36px_20px] animate-mascot-ear-left")}>
          <ellipse cx="36" cy="18" rx="9" ry="26" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" />
          <ellipse cx="36" cy="20" rx="5" ry="18" fill="#FBCFE8" />
        </g>
        <g
          className={cn(
            wavePaw && animate && "origin-[64px_20px] animate-mascot-ear-right",
            !wavePaw && animate && "origin-[64px_20px] animate-mascot-ear-left"
          )}
          style={{ animationDelay: wavePaw ? "0s" : "0.4s" }}
        >
          <ellipse cx="64" cy="18" rx="9" ry="26" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" />
          <ellipse cx="64" cy="20" rx="5" ry="18" fill="#FBCFE8" />
        </g>

        {/* Eyes */}
        <g className={cn(animate && (isTalking ? "animate-mascot-talk-blink" : "animate-mascot-blink"))}>
          {wink ? (
            <path d="M36 56 Q40 60 44 56" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : (
            <>
              <circle cx="40" cy="56" r="7" fill="white" />
              <circle cx="40" cy="57" r="4" fill="#1F2937" />
              <circle cx="41.5" cy="55.5" r="1.5" fill="white" />
            </>
          )}
          <circle cx="60" cy="56" r="7.5" fill="white" />
          <circle cx="60" cy="57" r="4.5" fill="#1F2937" />
          <circle cx="61.5" cy="55.5" r="1.8" fill="white" />
        </g>

        {resolvedMood === "think" && (
          <>
            <g stroke="#6366F1" strokeWidth="1.8" fill="none">
              <circle cx="40" cy="56" r="9" />
              <circle cx="60" cy="56" r="9" />
              <line x1="49" y1="56" x2="51" y2="56" />
            </g>
            <ellipse cx="70" cy="66" rx="6" ry="5" fill="#E5E7EB" />
          </>
        )}

        {/* Nose + mouth + buck teeth */}
        <ellipse cx="50" cy="64" rx="4" ry="3.5" fill="#F472B6" />
        <path
          d={
            isTalking
              ? "M44 67 Q47 72 50 67 Q53 72 56 67"
              : resolvedMood === "cheer"
                ? "M44 68 Q50 74 56 68"
                : "M45 68 Q51 72 57 67"
          }
          stroke="#374151"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          className={cn(isTalking && animate && "animate-mascot-mouth-talk")}
        />
        <rect x="46.5" y="67" width="3" height="4" rx="0.8" fill="white" stroke="#E5E7EB" strokeWidth="0.4" />
        <rect x="50.5" y="67" width="3" height="4" rx="0.8" fill="white" stroke="#E5E7EB" strokeWidth="0.4" />

        {/* Grad cap — small, between ears */}
        <g className={cn(animate && "origin-[50px_36px] animate-mascot-cap-tilt")}>
          <polygon points="50,32 32,42 68,42" fill="#4F46E5" />
          <rect x="38" y="42" width="24" height="3" rx="0.5" fill="#3730A3" />
          <line x1="66" y1="43" x2="72" y2="50" stroke="#FBBF24" strokeWidth="1.5" />
          <circle cx="72" cy="51" r="2.5" fill="#F59E0B" />
        </g>

        {(resolvedMood === "cheer" || isCelebrate) && (
          <>
            <text x="2" y="22" fontSize="11" className="animate-float">
              💡
            </text>
            <text x="82" y="16" fontSize="10" className="animate-float" style={{ animationDelay: "0.5s" }}>
              ✨
            </text>
          </>
        )}

        <defs>
          <linearGradient id={bodyGrad} x1="24" y1="58" x2="76" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F3F4F6" />
            <stop offset="1" stopColor="#D1D5DB" />
          </linearGradient>
          <linearGradient id={faceGrad} x1="26" y1="34" x2="74" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F3F4F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
