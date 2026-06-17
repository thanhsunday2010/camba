import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { YleContinueSuggestion } from "@/lib/yle/practice-path";

interface YleContinueBannerProps {
  suggestion: YleContinueSuggestion;
  level: string;
}

export function YleContinueBanner({ suggestion, level }: YleContinueBannerProps) {
  return (
    <Link
      href={suggestion.href}
      className="mb-5 block overflow-hidden rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 p-[2px] shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
    >
      <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-white/95 px-4 py-3.5 sm:px-5 sm:py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 text-2xl">
          {suggestion.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Tiếp tục luyện · Bước {suggestion.stepIndex}/{suggestion.totalSteps}
          </p>
          <p className="text-lg font-extrabold text-violet-950">{suggestion.label}</p>
          <p className="text-sm font-medium text-muted-foreground">{suggestion.reason}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white">
          Luyện ngay
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
