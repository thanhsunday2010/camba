export const LEVEL_THEMES: Record<
  string,
  {
    btnClass: string;
    emoji: string;
    border: string;
    bg: string;
    /** Tailwind gradient for planet orb */
    planetGradient: string;
    /** Card accent gradient */
    accentGradient: string;
  }
> = {
  STARTERS: {
    btnClass: "bg-gradient-to-r from-pink-500 to-rose-500",
    emoji: "🌟",
    border: "border-pink-300",
    bg: "bg-pink-100/80",
    planetGradient: "bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600",
    accentGradient: "from-pink-500 to-rose-500",
  },
  MOVERS: {
    btnClass: "bg-gradient-to-r from-orange-500 to-amber-500",
    emoji: "🚀",
    border: "border-orange-300",
    bg: "bg-orange-100/80",
    planetGradient: "bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-600",
    accentGradient: "from-orange-500 to-amber-500",
  },
  FLYERS: {
    btnClass: "bg-gradient-to-r from-violet-500 to-purple-600",
    emoji: "🦋",
    border: "border-violet-300",
    bg: "bg-violet-100/80",
    planetGradient: "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700",
    accentGradient: "from-violet-500 to-purple-600",
  },
  KET: {
    btnClass: "bg-gradient-to-r from-sky-500 to-blue-600",
    emoji: "📘",
    border: "border-sky-300",
    bg: "bg-sky-100/80",
    planetGradient: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600",
    accentGradient: "from-sky-500 to-blue-600",
  },
  PET: {
    btnClass: "bg-gradient-to-r from-emerald-500 to-teal-600",
    emoji: "🌿",
    border: "border-emerald-300",
    bg: "bg-emerald-100/80",
    planetGradient: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600",
    accentGradient: "from-emerald-500 to-teal-600",
  },
  FCE: {
    btnClass: "bg-gradient-to-r from-indigo-500 to-blue-700",
    emoji: "🏆",
    border: "border-indigo-300",
    bg: "bg-indigo-100/80",
    planetGradient: "bg-gradient-to-br from-indigo-500 via-blue-600 to-violet-800",
    accentGradient: "from-indigo-500 to-blue-700",
  },
};

export const SKILL_COLORS: Record<string, string> = {
  READING: "from-blue-500 to-cyan-500",
  WRITING: "from-amber-500 to-orange-500",
  LISTENING: "from-purple-500 to-pink-500",
  SPEAKING: "from-rose-500 to-red-500",
  USE_OF_ENGLISH: "from-green-500 to-emerald-600",
};
