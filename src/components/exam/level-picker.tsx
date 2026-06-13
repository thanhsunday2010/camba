"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { EXAM_LEVELS } from "@/lib/constants";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { updateTargetExamAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { ExamLevelValue } from "@/lib/constants";

interface LevelPickerProps {
  currentLevel: string;
  /** compact = dashboard sidebar; full = /exams page */
  variant?: "compact" | "full";
}

export function LevelPicker({ currentLevel, variant = "full" }: LevelPickerProps) {
  const router = useRouter();
  const { update } = useSession();

  async function selectLevel(level: ExamLevelValue, navigate = true) {
    const res = await updateTargetExamAction(level);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    await update({ targetExam: level });
    toast.success(`Đã chọn level ${level}! 🐰`);
    router.refresh();
    if (navigate) router.push(`/exams/${level}`);
  }

  if (variant === "compact") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {EXAM_LEVELS.map((level) => {
          const theme = LEVEL_THEMES[level.value] ?? LEVEL_THEMES.KET;
          const active = currentLevel === level.value;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => selectLevel(level.value)}
              className={cn(
                "rounded-xl border-2 p-2 text-left text-xs font-bold transition-all hover:scale-105",
                theme.border,
                theme.bg,
                active && "ring-2 ring-purple-500 ring-offset-1"
              )}
            >
              <span className="mr-1">{theme.emoji}</span>
              {level.value}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {EXAM_LEVELS.map((level) => {
        const theme = LEVEL_THEMES[level.value] ?? LEVEL_THEMES.KET;
        const active = currentLevel === level.value;
        return (
          <div
            key={level.value}
            className={cn(
              "kid-card flex flex-col border-2 p-4",
              theme.border,
              theme.bg,
              active && "ring-2 ring-purple-500"
            )}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{theme.emoji}</span>
              <div>
                <p className="font-extrabold">{level.label}</p>
                <p className="text-xs font-semibold text-muted-foreground">{level.group}</p>
              </div>
              {active && (
                <span className="ml-auto rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  Mặc định
                </span>
              )}
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectLevel(level.value)}
                className={cn(
                  "kid-btn-fun flex-1 rounded-xl px-3 py-2 text-sm font-bold text-white shadow-md",
                  `bg-gradient-to-r ${theme.gradient}`
                )}
              >
                {active ? "Luyện ngay" : "Chọn level này"}
              </button>
              <Link
                href={`/exams/${level.value}`}
                className="rounded-xl border-2 border-purple-200 bg-white px-3 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50"
              >
                Xem đề
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
