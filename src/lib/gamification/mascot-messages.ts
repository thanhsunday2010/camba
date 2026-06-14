import type { MascotToastPayload } from "@/lib/kids/mascot-messages";
import type { GamificationSnapshot } from "@/lib/gamification/types";
import { getAchievementByKey } from "@/lib/gamification/definitions";

export function mascotLessonCompleteMessage(paperKind?: string): MascotToastPayload {
  if (paperKind === "PLACEMENT") {
    return {
      message: "Hoàn thành placement! Thỏ ghi nhận thành tích của bạn 🎯",
      mood: "cheer",
      durationMs: 4500,
    };
  }
  if (paperKind === "MOCK_FULL" || paperKind === "MOCK_SKILL") {
    return {
      message: "Xong mock test rồi! Thành tích đã được cộng vào hồ sơ 📝",
      mood: "cheer",
      durationMs: 4500,
    };
  }
  return {
    message: "Chúc mừng! Bạn vừa hoàn thành một bài học 🎉",
    mood: "cheer",
    durationMs: 4500,
    confetti: true,
  };
}

export function mascotGamificationCelebration(
  snapshot: GamificationSnapshot,
  userName?: string
): MascotToastPayload {
  const name = userName ?? "bạn";
  const lines: string[] = [`+${snapshot.xpEarned} XP`];

  if (snapshot.levelUp) {
    lines.push(
      `Thăng hạng ${snapshot.level.emoji} ${snapshot.level.name} (Cấp ${snapshot.level.level})!`
    );
  }

  if (snapshot.unlockedAchievements.length > 0) {
    const titles = snapshot.unlockedAchievements
      .map((a) => `${a.emoji} ${a.title}`)
      .join(" · ");
    lines.push(`Danh hiệu mới: ${titles}`);
  }

  const isBigWin = snapshot.levelUp || snapshot.unlockedAchievements.length > 0;

  return {
    message: `${name} giỏi quá! ${lines.join(" · ")}`,
    mood: isBigWin ? "cheer" : "happy",
    durationMs: isBigWin ? 7000 : 5000,
    confetti: isBigWin || snapshot.xpEarned >= 50,
  };
}

export function mascotAchievementOnlyMessage(
  achievements: GamificationSnapshot["unlockedAchievements"]
): MascotToastPayload | null {
  if (achievements.length === 0) return null;
  const titles = achievements.map((a) => `${a.emoji} ${a.title}`).join(", ");
  return {
    message: `Danh hiệu mới: ${titles}!`,
    subtitle: achievements.map((a) => a.description).join(" · "),
    mood: "cheer",
    durationMs: 6500,
    confetti: true,
  };
}

export function mascotLevelUpMessage(
  levelName: string,
  levelEmoji: string,
  level: number
): MascotToastPayload {
  return {
    message: `Thăng hạng! ${levelEmoji} ${levelName} — Cấp ${level}`,
    subtitle: "Tiếp tục luyện tập để mở thêm danh hiệu nhé!",
    mood: "cheer",
    durationMs: 7000,
    confetti: true,
  };
}

export function getTitleLabel(activeTitle: string | null | undefined): string | null {
  if (!activeTitle) return null;
  const def = getAchievementByKey(activeTitle);
  return def ? `${def.emoji} ${def.title}` : null;
}
