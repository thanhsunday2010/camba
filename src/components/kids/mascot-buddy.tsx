"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CambaMascot, type MascotMood } from "./camba-mascot";
import { useKidSound } from "./sound-provider";
import { cn } from "@/lib/utils";

const MESSAGES: Record<string, string[]> = {
  "/": [
    "Chào bạn! Mình là Camba 🦉",
    "Cùng học tiếng Anh vui nhé!",
    "Nhấn vào mình để nghe lời khuyên!",
  ],
  "/dashboard": [
    "Chào {name}! Học 1 chút mỗi ngày nhé!",
    "Giữ streak 🔥 — bạn làm được mà!",
    "Chọn kỹ năng yếu để luyện thêm!",
  ],
  "/exams": [
    "Chọn level phù hợp với bạn!",
    "Mock test giống thi thật đó!",
    "Cố lên, mình tin bạn! 💪",
  ],
  "/practice": [
    "Đọc kỹ câu hỏi nhé!",
    "Nghe audio 2 lần nếu cần 🎧",
    "Bạn làm rất tốt! Tiếp tục!",
    "Hết giờ là tự nộp — đừng lo!",
  ],
  "/placement": [
    "Làm hết bài để biết level nhé!",
    "Không có đúng sai — chỉ để xếp lớp!",
    "Thư giãn và làm thật!",
  ],
  "/results": [
    "Xem lỗi sai để tiến bộ nhé!",
    "Giải thích AI giúp hiểu bài!",
    "Lần sau sẽ giỏi hơn! ⭐",
  ],
  default: [
    "Học tiếng Anh vui mỗi ngày!",
    "Camba luôn ở đây với bạn!",
  ],
};

const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/teacher"];

function getMessages(path: string, userName?: string) {
  const key = Object.keys(MESSAGES).find(
    (k) => k !== "default" && path.startsWith(k)
  );
  const msgs = MESSAGES[key ?? "default"];
  return msgs.map((m) => m.replace("{name}", userName ?? "bạn"));
}

function getMood(path: string): MascotMood {
  if (path.startsWith("/practice")) return "think";
  if (path.startsWith("/results") || path.includes("/placement/results")) return "cheer";
  if (path === "/" || path.startsWith("/dashboard")) return "wave";
  return "happy";
}

interface MascotBuddyProps {
  userName?: string;
}

export function MascotBuddy({ userName }: MascotBuddyProps) {
  const pathname = usePathname();
  const { play } = useKidSound();
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [popped, setPopped] = useState(false);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  const messages = getMessages(pathname, userName);
  const mood = getMood(pathname);
  const message = messages[msgIndex % messages.length];

  useEffect(() => {
    setMsgIndex(0);
  }, [pathname]);

  useEffect(() => {
    if (hidden) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [hidden, messages.length]);

  const handleClick = useCallback(() => {
    play("pop");
    setPopped(true);
    setMsgIndex((i) => (i + 1) % messages.length);
    setTimeout(() => setPopped(false), 300);
  }, [messages.length, play]);

  if (hidden || !visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      {/* Speech bubble */}
      <div
        className={cn(
          "max-w-[220px] animate-bounce-in rounded-2xl rounded-br-sm border-2 border-purple-200 bg-white px-4 py-3 shadow-lg transition-transform md:max-w-[260px]",
          popped && "scale-110"
        )}
      >
        <p className="text-sm font-bold leading-snug text-purple-900">{message}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-1 text-[10px] font-semibold text-muted-foreground hover:text-purple-600"
        >
          Ẩn Camba
        </button>
      </div>

      {/* Mascot button */}
      <button
        type="button"
        onClick={handleClick}
        className="group relative rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-1 shadow-lg ring-2 ring-purple-200 transition-transform hover:scale-110 active:scale-95"
        aria-label="Camba mascot — nhấn để đổi lời nhắn"
      >
        <CambaMascot size="md" mood={mood} />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sunshine-400 text-xs shadow-sm">
          💬
        </span>
      </button>
    </div>
  );
}

/** Inline mascot for hero / section headers */
export function MascotHero({
  message,
  mood = "wave",
  className,
}: {
  message: string;
  mood?: MascotMood;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-end", className)}>
      <CambaMascot size="xl" mood={mood} />
      <div className="relative max-w-sm rounded-3xl rounded-bl-sm border-2 border-white/40 bg-white/20 px-5 py-4 backdrop-blur-sm">
        <p className="text-base font-extrabold leading-snug text-white md:text-lg">{message}</p>
        <div className="absolute -left-2 bottom-6 h-4 w-4 rotate-45 border-b-2 border-l-2 border-white/40 bg-white/20" />
      </div>
    </div>
  );
}
