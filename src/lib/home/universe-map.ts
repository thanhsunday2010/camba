import { EXAM_LEVELS } from "@/lib/constants";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { isYleLevel, yleLevelLabel, type YleLevel } from "@/lib/yle/constants";
import {
  CAMBRIDGE_COURSES_URL,
  IELTS_SPEAKING_URL,
  IELTS_WRITING_URL,
} from "@/lib/site/ielts-speaking-cta";

export const HOME_UNIVERSE_ZONES = {
  yle: {
    id: "yle",
    title: "Vũ trụ YLE",
    subtitle: "Starters · Movers · Flyers",
    emoji: "🌌",
    href: "/yle",
    accent: "from-pink-500 via-violet-600 to-indigo-600",
  },
  secondary: {
    id: "secondary",
    title: "Cambridge Secondary",
    subtitle: "KET · PET · FCE",
    emoji: "📚",
    href: CAMBRIDGE_COURSES_URL,
    accent: "from-sky-500 via-blue-600 to-indigo-700",
  },
  ielts: {
    id: "ielts",
    title: "Thiên hà IELTS",
    subtitle: "Academic Speaking & Writing",
    emoji: "🇬🇧",
    href: IELTS_SPEAKING_URL,
    accent: "from-rose-500 via-fuchsia-600 to-violet-700",
  },
} as const;

export const HOME_YLE_WORLDS = (["STARTERS", "MOVERS", "FLYERS"] as const).map((level) => ({
  level,
  label: yleLevelLabel(level),
  href: `/yle/${level}`,
  theme: LEVEL_THEMES[level]!,
}));

export const HOME_SECONDARY_WORLDS = EXAM_LEVELS.filter((l) => l.group === "Secondary").map(
  (l) => ({
    level: l.value,
    label: l.label,
    href: isYleLevel(l.value) ? `/yle/${l.value}` : `/exams/${l.value}`,
    theme: LEVEL_THEMES[l.value]!,
  })
);

export const HOME_IELTS_WORLDS = [
  {
    label: "Speaking",
    emoji: "🎤",
    href: IELTS_SPEAKING_URL,
    gradient: "from-rose-500 to-pink-600",
  },
  {
    label: "Writing",
    emoji: "✏️",
    href: IELTS_WRITING_URL,
    gradient: "from-amber-500 to-orange-600",
  },
] as const;

export const HOME_SIDE_MISSIONS = [
  { emoji: "🎯", label: "Test trình độ", action: "placement" as const },
  { emoji: "💎", label: "Bảng giá", href: "/pricing" },
  { emoji: "📊", label: "Tiến độ", href: "/dashboard", authOnly: true },
  { emoji: "🏆", label: "Hub luyện thi", href: "/exams" },
] as const;

export function homeContinueHref(targetExam: string): string {
  return isYleLevel(targetExam) ? `/yle/${targetExam}` : `/exams/${targetExam}`;
}

export function homeTargetExamLabel(targetExam: string): string {
  if (isYleLevel(targetExam)) return yleLevelLabel(targetExam as YleLevel);
  return EXAM_LEVELS.find((e) => e.value === targetExam)?.label ?? targetExam;
}
