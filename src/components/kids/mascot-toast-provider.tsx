"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { CambaMascot, type MascotMood } from "./camba-mascot";
import { useKidSound } from "./sound-provider";
import { MASCOT_DEFAULT_DURATION_MS, type MascotToastPayload } from "@/lib/kids/mascot-messages";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/teacher"];

type MascotToastContextValue = {
  showMascot: (payload: MascotToastPayload | string) => void;
};

const MascotToastContext = createContext<MascotToastContextValue>({
  showMascot: () => {},
});

export function useMascotToast() {
  return useContext(MascotToastContext);
}

export function MascotToastProvider({
  children,
  userName,
}: {
  children: ReactNode;
  userName?: string;
}) {
  const pathname = usePathname();
  const { play } = useKidSound();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    mood: MascotMood;
  } | null>(null);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  const showMascot = useCallback(
    (payload: MascotToastPayload | string) => {
      if (hidden) return;

      const normalized =
        typeof payload === "string"
          ? { message: payload, mood: "happy" as MascotMood }
          : payload;

      const message = normalized.message.replace("{name}", userName ?? "bạn");

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      setToast({ message, mood: normalized.mood ?? "happy" });
      play("pop");

      hideTimerRef.current = setTimeout(() => {
        setToast(null);
        hideTimerRef.current = null;
      }, normalized.durationMs ?? MASCOT_DEFAULT_DURATION_MS);
    },
    [hidden, play, userName]
  );

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setToast(null);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, [pathname]);

  return (
    <MascotToastContext.Provider value={{ showMascot }}>
      {children}
      {!hidden && toast && (
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 animate-bounce-in md:bottom-6 md:right-6"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-[240px] rounded-2xl rounded-br-sm border-2 border-purple-200 bg-white px-4 py-3 shadow-xl md:max-w-[280px]">
            <p className="text-sm font-bold leading-snug text-purple-900">{toast.message}</p>
          </div>
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-1 shadow-lg ring-2 ring-purple-200"
            )}
          >
            <CambaMascot size="md" mood={toast.mood} />
          </div>
        </div>
      )}
    </MascotToastContext.Provider>
  );
}
