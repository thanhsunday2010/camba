export const LEVEL_THEMES: Record<
  string,
  { btnClass: string; emoji: string; border: string; bg: string }
> = {
  STARTERS: {
    btnClass: "bg-gradient-to-r from-pink-500 to-rose-500",
    emoji: "🌟",
    border: "border-pink-300",
    bg: "bg-pink-100/80",
  },
  MOVERS: {
    btnClass: "bg-gradient-to-r from-orange-500 to-amber-500",
    emoji: "🚀",
    border: "border-orange-300",
    bg: "bg-orange-100/80",
  },
  FLYERS: {
    btnClass: "bg-gradient-to-r from-violet-500 to-purple-600",
    emoji: "🦋",
    border: "border-violet-300",
    bg: "bg-violet-100/80",
  },
  KET: {
    btnClass: "bg-gradient-to-r from-sky-500 to-blue-600",
    emoji: "📘",
    border: "border-sky-300",
    bg: "bg-sky-100/80",
  },
  PET: {
    btnClass: "bg-gradient-to-r from-emerald-500 to-teal-600",
    emoji: "🌿",
    border: "border-emerald-300",
    bg: "bg-emerald-100/80",
  },
  FCE: {
    btnClass: "bg-gradient-to-r from-indigo-500 to-blue-700",
    emoji: "🏆",
    border: "border-indigo-300",
    bg: "bg-indigo-100/80",
  },
};

export const SKILL_COLORS: Record<string, string> = {
  READING: "from-blue-500 to-cyan-500",
  WRITING: "from-amber-500 to-orange-500",
  LISTENING: "from-purple-500 to-pink-500",
  SPEAKING: "from-rose-500 to-red-500",
  USE_OF_ENGLISH: "from-green-500 to-emerald-600",
};
