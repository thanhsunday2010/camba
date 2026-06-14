export interface GamificationLevel {
  level: number;
  minXp: number;
  name: string;
  emoji: string;
}

export interface AchievementDefinition {
  key: string;
  title: string;
  description: string;
  emoji: string;
  /** Auto-equip when unlocked if user has no title */
  autoEquip?: boolean;
}

/** Cấp độ thăng tiến theo tổng XP */
export const GAMIFICATION_LEVELS: GamificationLevel[] = [
  { level: 1, minXp: 0, name: "Tập sự", emoji: "🌱" },
  { level: 2, minXp: 100, name: "Học viên", emoji: "📘" },
  { level: 3, minXp: 250, name: "Chiến binh", emoji: "⚔️" },
  { level: 4, minXp: 500, name: "Thủ lĩnh", emoji: "🛡️" },
  { level: 5, minXp: 900, name: "Cao thủ", emoji: "🏅" },
  { level: 6, minXp: 1500, name: "Bậc thầy", emoji: "👑" },
  { level: 7, minXp: 2500, name: "Huyền thoại", emoji: "🐰" },
];

/** Danh hiệu mở khóa theo cột mốc */
export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  first_lesson: {
    key: "first_lesson",
    title: "Người mới bắt đầu",
    description: "Hoàn thành bài học đầu tiên",
    emoji: "🎒",
    autoEquip: true,
  },
  lessons_5: {
    key: "lessons_5",
    title: "Chăm chỉ",
    description: "Hoàn thành 5 bài học",
    emoji: "✏️",
  },
  lessons_25: {
    key: "lessons_25",
    title: "Luyện đều",
    description: "Hoàn thành 25 bài học",
    emoji: "📚",
  },
  lessons_100: {
    key: "lessons_100",
    title: "Kiên trì",
    description: "Hoàn thành 100 bài học",
    emoji: "💪",
  },
  streak_3: {
    key: "streak_3",
    title: "Lửa 3 ngày",
    description: "Giữ streak 3 ngày liên tiếp",
    emoji: "🔥",
  },
  streak_7: {
    key: "streak_7",
    title: "Tuần vàng",
    description: "Giữ streak 7 ngày liên tiếp",
    emoji: "⭐",
  },
  streak_30: {
    key: "streak_30",
    title: "Bất bại",
    description: "Giữ streak 30 ngày liên tiếp",
    emoji: "🏆",
  },
  score_60: {
    key: "score_60",
    title: "Vượt chuẩn",
    description: "Đạt từ 60% trở lên trong một bài",
    emoji: "✅",
  },
  score_80: {
    key: "score_80",
    title: "Xuất sắc",
    description: "Đạt từ 80% trở lên trong một bài",
    emoji: "🌟",
  },
  score_90: {
    key: "score_90",
    title: "Siêu sao",
    description: "Đạt từ 90% trở lên trong một bài",
    emoji: "💫",
  },
  perfect_100: {
    key: "perfect_100",
    title: "Hoàn hảo",
    description: "Đạt 100% trong một bài",
    emoji: "💯",
  },
  mock_first: {
    key: "mock_first",
    title: "Thí sinh mock",
    description: "Hoàn thành mock test đầu tiên",
    emoji: "📝",
  },
  placement_done: {
    key: "placement_done",
    title: "Khám phá trình độ",
    description: "Hoàn thành placement test",
    emoji: "🎯",
  },
  level_3: {
    key: "level_3",
    title: "Chiến binh Camba",
    description: "Đạt cấp 3",
    emoji: "⚔️",
  },
  level_5: {
    key: "level_5",
    title: "Cao thủ Cambridge",
    description: "Đạt cấp 5",
    emoji: "🏅",
  },
};

export function getLevelForXp(xp: number): GamificationLevel {
  let current = GAMIFICATION_LEVELS[0]!;
  for (const level of GAMIFICATION_LEVELS) {
    if (xp >= level.minXp) current = level;
    else break;
  }
  return current;
}

export function getNextLevel(xp: number): GamificationLevel | null {
  const current = getLevelForXp(xp);
  return GAMIFICATION_LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function xpProgressInLevel(xp: number): {
  current: GamificationLevel;
  next: GamificationLevel | null;
  progressPct: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
} {
  const current = getLevelForXp(xp);
  const next = getNextLevel(xp);
  if (!next) {
    return {
      current,
      next: null,
      progressPct: 100,
      xpIntoLevel: xp - current.minXp,
      xpNeededForNext: 0,
    };
  }
  const xpIntoLevel = xp - current.minXp;
  const xpNeededForNext = next.minXp - current.minXp;
  const progressPct = Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100));
  return { current, next, progressPct, xpIntoLevel, xpNeededForNext };
}

export function getAchievementByKey(key: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS[key];
}

export function getActiveTitleDisplay(activeTitle: string | null | undefined): AchievementDefinition | null {
  if (!activeTitle) return null;
  return ACHIEVEMENTS[activeTitle] ?? null;
}
