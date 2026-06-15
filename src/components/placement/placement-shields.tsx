import { Shield } from "lucide-react";
import type { Skill } from "@prisma/client";
import {
  PLACEMENT_SHIELD_MAX,
  PLACEMENT_SHIELD_MAX_PER_SKILL,
} from "@/lib/placement/evaluate";

const SKILL_LABELS: Record<string, string> = {
  READING: "Reading",
  LISTENING: "Listening",
  USE_OF_ENGLISH: "Use of English",
};

interface PlacementShieldsProps {
  count: number;
  max?: number;
  bySkill?: { skill: Skill; count: number; max: number }[];
  track?: "YLE" | "SECONDARY";
}

function SkillShieldRow({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="w-28 shrink-0 text-xs font-bold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <Shield
            key={i}
            className={`h-5 w-5 sm:h-6 sm:w-6 ${
              i < count ? "fill-amber-400 text-amber-500" : "text-muted-foreground/25"
            }`}
            aria-hidden
          />
        ))}
      </div>
      <span className="text-xs font-bold text-amber-800">
        {count}/{max}
      </span>
    </div>
  );
}

export function PlacementShields({
  count,
  max = PLACEMENT_SHIELD_MAX,
  bySkill,
  track,
}: PlacementShieldsProps) {
  const label =
    track === "YLE" ? "Khiên YLE tương đương" : "Khiên Cambridge tương đương";

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-amber-800">
        {count}/{max} khiên
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
        3 kỹ năng × tối đa {PLACEMENT_SHIELD_MAX_PER_SKILL} khiên mỗi kỹ năng
      </p>
      {bySkill && bySkill.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-amber-200/80 pt-3">
          {bySkill.map((row) => (
            <SkillShieldRow
              key={row.skill}
              label={SKILL_LABELS[row.skill] ?? row.skill}
              count={row.count}
              max={row.max}
            />
          ))}
        </div>
      )}
    </div>
  );
}
