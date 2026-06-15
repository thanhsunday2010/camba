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
import { ConfettiBurst } from "./confetti-burst";
import { MASCOT_DEFAULT_DURATION_MS, type MascotToastPayload } from "@/lib/kids/mascot-messages";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/teacher"];

type MascotToastContextValue = {
  showMascot: (payload: MascotToastPayload | string) => void;
  hideMascot: () => void;
};

const MascotToastContext = createContext<MascotToastContextValue>({
  showMascot: () => {},
  hideMascot: () => {},
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
    subtitle?: string;
    mood: MascotMood;
    confetti?: boolean;
  } | null>(null);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  const hideMascot = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showMascot = useCallback(
    (payload: MascotToastPayload | string) => {
      if (hidden) return;

      const normalized =
        typeof payload === "string"
          ? { message: payload, mood: "happy" as MascotMood }
          : payload;

      const message = normalized.message.replace("{name}", userName ?? "bạn");

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      setToast({
        message,
        subtitle: normalized.subtitle,
        mood: normalized.mood ?? "happy",
        confetti: normalized.confetti,
      });
      play(normalized.confetti ? "celebrate" : "success");

      if (!normalized.persist) {
        hideTimerRef.current = setTimeout(() => {
          setToast(null);
          hideTimerRef.current = null;
        }, normalized.durationMs ?? MASCOT_DEFAULT_DURATION_MS);
      }
    },
    [hidden, play, userName]
  );

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    hideMascot();
  }, [pathname, hideMascot]);

  return (
    <MascotToastContext.Provider value={{ showMascot, hideMascot }}>
      {children}
      {!hidden && toast && (
        <>
          <ConfettiBurst active={Boolean(toast.confetti)} />
          <div
            className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
          >
            <div className="flex max-w-md flex-col items-center gap-4 animate-bounce-in text-center">
              <div
                className={cn(
                  "rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-2 shadow-xl ring-4 ring-white/80"
                )}
              >
                <CambaMascot size="xl" mood={toast.mood} />
              </div>
              <div className="relative w-full rounded-3xl border-2 border-purple-200 bg-white px-5 py-4 shadow-2xl">
                <p className="text-lg font-extrabold leading-snug text-purple-900 md:text-xl">
                  {toast.message}
                </p>
                {toast.subtitle && (
                  <p className="mt-2 text-sm font-semibold text-purple-700/90 md:text-base">
                    {toast.subtitle}
                  </p>
                )}
                <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-purple-200 bg-white" />
              </div>
            </div>
          </div>
        </>
      )}
    </MascotToastContext.Provider>
  );
}
