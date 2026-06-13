export const LEVEL_THEMES: Record<
  string,
  { gradient: string; emoji: string; border: string; bg: string }
> = {
  STARTERS: {
    gradient: "from-pink-400 to-rose-400",
    emoji: "🌟",
    border: "border-pink-300",
    bg: "bg-pink-50",
  },
  MOVERS: {
    gradient: "from-orange-400 to-amber-400",
    emoji: "🚀",
    border: "border-orange-300",
    bg: "bg-orange-50",
  },
  FLYERS: {
    gradient: "from-violet-400 to-purple-400",
    emoji: "🦋",
    border: "border-violet-300",
    bg: "bg-violet-50",
  },
  KET: {
    gradient: "from-sky-400 to-blue-500",
    emoji: "📘",
    border: "border-sky-300",
    bg: "bg-sky-50",
  },
  PET: {
    gradient: "from-emerald-400 to-teal-500",
    emoji: "🌿",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
  },
  FCE: {
    gradient: "from-indigo-400 to-blue-600",
    emoji: "🏆",
    border: "border-indigo-300",
    bg: "bg-indigo-50",
  },
};

export const SKILL_COLORS: Record<string, string> = {
  READING: "from-blue-400 to-cyan-400",
  WRITING: "from-amber-400 to-orange-400",
  LISTENING: "from-purple-400 to-pink-400",
  SPEAKING: "from-rose-400 to-red-400",
  USE_OF_ENGLISH: "from-green-400 to-emerald-400",
};
