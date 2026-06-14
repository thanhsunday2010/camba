import type { MascotMood } from "@/components/kids/camba-mascot";

export type MascotToastPayload = {
  message: string;
  mood?: MascotMood;
  durationMs?: number;
  /** Keep visible until hideMascot() or navigation */
  persist?: boolean;
};

export const MASCOT_DEFAULT_DURATION_MS = 3000;

export function mascotTestCompleteMessage(paperKind?: string): MascotToastPayload {
  if (paperKind === "PLACEMENT") {
    return {
      message: "Xong rồi! Thỏ đang chấm để gợi ý level phù hợp cho bạn 🎯",
      mood: "think",
    };
  }
  if (paperKind === "MOCK_FULL" || paperKind === "MOCK_SKILL") {
    return {
      message: "Hoàn thành mock test! Xem điểm và rút kinh nghiệm nhé 💪",
      mood: "cheer",
    };
  }
  return {
    message: "Tuyệt vời! Bạn đã hoàn thành bài luyện tập 🎉",
    mood: "cheer",
  };
}

export function mascotStreakMessage(streak: number): MascotToastPayload {
  if (streak >= 10) {
    return { message: "10 câu đúng liên tiếp — siêu sao! ⭐⭐", mood: "cheer" };
  }
  if (streak >= 5) {
    return { message: "5 câu đúng liên tiếp! Thỏ tin bạn làm tiếp được! 🔥", mood: "cheer" };
  }
  return { message: "Chuỗi đúng tuyệt vời! Tiếp tục nhé 🐰", mood: "happy" };
}

export function mascotHalfProgressMessage(): MascotToastPayload {
  return {
    message: "Nửa chặng rồi! Giữ nhịp đều như thỏ chạy bộ nhé 🏃",
    mood: "wave",
  };
}

export function mascotScoreMessage(percent: number, userName?: string): MascotToastPayload {
  const name = userName ?? "bạn";
  if (percent >= 90) {
    return {
      message: `${name} giỏi quá! ${percent}% — gần như thi thật rồi! 🏆`,
      mood: "cheer",
    };
  }
  if (percent >= 80) {
    return {
      message: `Xuất sắc! ${percent}% — thỏ tự hào về ${name}! ⭐`,
      mood: "cheer",
    };
  }
  if (percent >= 60) {
    return {
      message: `Khá tốt ${percent}%! Ôn thêm vài chỗ là lên level mới! 📈`,
      mood: "happy",
    };
  }
  if (percent >= 40) {
    return {
      message: `${percent}% — chưa sao! Xem lại câu sai, lần sau sẽ giỏi hơn 💪`,
      mood: "wave",
    };
  }
  return {
    message: `Thỏ biết ${name} cố gắng rồi! Luyện thêm chút nữa nhé 🌱`,
    mood: "think",
  };
}

export function mascotPlacementResultMessage(
  recommendedLevel: string,
  userName?: string
): MascotToastPayload {
  const name = userName ?? "Bạn";
  return {
    message: `${name} phù hợp level ${recommendedLevel}! Bắt đầu luyện từ đó nhé 🎯`,
    mood: "cheer",
  };
}

export function mascotSpeakingDoneMessage(): MascotToastPayload {
  return {
    message: "Nghe rõ rồi! Thỏ gửi bài nói đi chấm AI 🎤",
    mood: "happy",
  };
}

export function mascotGradingWaitMessage(): MascotToastPayload {
  return {
    message: "Bạn chờ chút để mình chấm và nhận xét nhé. Chỉ 30 giây thôi!",
    mood: "think",
    persist: true,
  };
}

export function mascotPlacementSubmitWaitMessage(): MascotToastPayload {
  return {
    message: "Xong rồi! Thỏ đang chấm để gợi ý level phù hợp cho bạn 🎯",
    mood: "think",
    persist: true,
  };
}

export function mascotPageLoadingMessage(): MascotToastPayload {
  return {
    message: "Chờ chút xíu nha",
    mood: "wave",
    persist: true,
  };
}
