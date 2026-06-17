import type { MascotMood, MascotActivity } from "@/components/kids/camba-mascot";
import type { KidSound } from "@/lib/kids/sounds";
import type { PlacementTrack } from "@/lib/placement/evaluate";

export type MascotToastAction = {
  label: string;
  href: string;
  primary?: boolean;
};

export type MascotToastPayload = {
  message: string;
  subtitle?: string;
  mood?: MascotMood;
  activity?: MascotActivity;
  sound?: KidSound;
  durationMs?: number;
  /** Keep visible until hideMascot() or navigation */
  persist?: boolean;
  /** After initial message, cycle random EN–VI phrases (requires persist) */
  cycleLoadingPhrases?: boolean;
  /** Trigger confetti burst */
  confetti?: boolean;
  /** Optional CTA buttons (e.g. đăng ký) */
  actions?: MascotToastAction[];
};

export const MASCOT_DEFAULT_DURATION_MS = 3000;

export function mascotAnswerCorrectMessage(): MascotToastPayload {
  return {
    message: "Đúng rồi! Yeah! 🎉",
    mood: "cheer",
    activity: "correct",
    sound: "answerCorrect",
    durationMs: 2200,
  };
}

export function mascotAnswerWrongMessage(): MascotToastPayload {
  return {
    message: "Chưa đúng — thử lại nhé!",
    mood: "think",
    activity: "wrong",
    sound: "answerWrong",
    durationMs: 2200,
  };
}

export function mascotTestCompleteMessage(paperKind?: string): MascotToastPayload {
  if (paperKind === "PLACEMENT") {
    return mascotPlacementSubmitWaitMessage();
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
    activity: "celebrate",
  };
}

export function mascotStreakMessage(streak: number): MascotToastPayload {
  if (streak >= 10) {
    return { message: "10 câu đúng liên tiếp — siêu sao! ⭐⭐", mood: "cheer", activity: "celebrate", confetti: true };
  }
  if (streak >= 5) {
    return { message: "5 câu đúng liên tiếp! Thỏ tin bạn làm tiếp được! 🔥", mood: "cheer", activity: "celebrate" };
  }
  return { message: "Chuỗi đúng tuyệt vời! Tiếp tục nhé 🐰", mood: "happy", activity: "correct" };
}

export function mascotHalfProgressMessage(): MascotToastPayload {
  return {
    message: "Nửa chặng rồi! Giữ nhịp đều như thỏ chạy bộ nhé 🏃",
    mood: "wave",
  };
}

export function mascotScoreMessage(percent: number, userName?: string): MascotToastPayload | null {
  if (percent < 40) return null;

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
  return null;
}

export function mascotPlacementResultMessage(
  recommendedLevel: string,
  userName?: string,
  options?: { track?: PlacementTrack; cefrSubLevelLabel?: string; ieltsBand?: string }
): MascotToastPayload {
  const name = userName ?? "Bạn";
  const levelLabel =
    options?.track === "IELTS" && options.ieltsBand
      ? `IELTS band ${options.ieltsBand}`
      : options?.track === "ADULT" && options.cefrSubLevelLabel
        ? `${recommendedLevel} (${options.cefrSubLevelLabel})`
        : recommendedLevel;
  const suffix =
    options?.track === "ADULT"
      ? "Xem gợi ý lộ trình CEFR bên dưới nhé 🎯"
      : options?.track === "IELTS"
        ? "Xem gợi ý luyện IELTS bên dưới nhé 🎯"
        : "Bắt đầu luyện từ đó nhé 🎯";
  return {
    message: `${name} — mức ${levelLabel}! ${suffix}`,
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
    message: "Chờ AI Camba chấm một lúc nhé",
    mood: "think",
    activity: "think",
    persist: true,
    cycleLoadingPhrases: true,
  };
}

export function mascotPlacementSubmitWaitMessage(): MascotToastPayload {
  return {
    message: "Chờ AI Camba chấm một lúc nhé",
    mood: "think",
    activity: "think",
    persist: true,
    cycleLoadingPhrases: true,
  };
}

export function mascotPageLoadingMessage(): MascotToastPayload {
  return {
    message: "Chờ chút xíu nha",
    mood: "wave",
    persist: true,
  };
}

export function mascotGuestPlacementLimitMessage(): MascotToastPayload {
  return {
    message: "Bạn đã hết lượt Test trình độ tháng này! 🐰",
    subtitle:
      "Đăng ký tài khoản Camba miễn phí để Test trình độ (2 lượt/tuần) và Luyện tập thêm mỗi ngày nhé!",
    mood: "think",
    persist: true,
    actions: [
      { label: "Đăng ký miễn phí ✨", href: "/register", primary: true },
      { label: "Đăng nhập", href: "/login" },
    ],
  };
}

export function mascotPlacementWeeklyRemainingMessage(remaining: number): MascotToastPayload {
  return {
    message: `Tuần này bạn còn ${remaining} lượt Test trình độ! 🎯`,
    subtitle: "Quay lại trang Test trình độ khi muốn thử loại đề khác nhé.",
    mood: "wave",
    durationMs: 5500,
  };
}

const PLACEMENT_OPENING_WAIT_LINES: { en: string; vi: string }[] = [
  { en: "Getting your test ready…", vi: "Đang chuẩn bị đề cho bạn…" },
  { en: "Just a moment — almost there!", vi: "Chờ chút nhé — sắp xong rồi!" },
  { en: "Hang tight! Your placement test is loading.", vi: "Kiên nhẫn nhé! Đề placement đang mở." },
  { en: "Preparing questions for you…", vi: "Đang chọn câu hỏi phù hợp…" },
  { en: "One sec — let's find your level!", vi: "Một chút thôi — tìm level phù hợp nhé!" },
  { en: "Loading your Cambridge-style test…", vi: "Đang tải bài test theo format Cambridge…" },
  { en: "Please wait — good things take a second!", vi: "Đợi chút — sắp vào bài rồi!" },
  { en: "Setting up your exam room…", vi: "Đang mở phòng thi cho bạn…" },
];

export function mascotPlacementOpeningWaitMessage(): MascotToastPayload {
  const line =
    PLACEMENT_OPENING_WAIT_LINES[
      Math.floor(Math.random() * PLACEMENT_OPENING_WAIT_LINES.length)
    ]!;
  return {
    message: line.en,
    subtitle: line.vi,
    mood: "wave",
    persist: true,
  };
}
