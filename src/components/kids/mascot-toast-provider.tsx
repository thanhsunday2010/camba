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
import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { CambaMascot, type MascotActivity, type MascotMood } from "./camba-mascot";
import { useKidSound } from "./sound-provider";
import { ConfettiBurst } from "./confetti-burst";
import { Button } from "@/components/ui/button";
import {
  MASCOT_DEFAULT_DURATION_MS,
  mascotGuestPlacementLimitMessage,
  type MascotToastAction,
  type MascotToastPayload,
} from "@/lib/kids/mascot-messages";
import type { KidSound } from "@/lib/kids/sounds";
import { GUEST_PLACEMENT_LIMIT_HIT_EVENT } from "@/lib/promo/events";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/teacher"];
const COMPANION_HIDDEN_KEY = "camba-mascot-companion-hidden";

type ActiveMascotState = {
  message: string;
  subtitle?: string;
  mood: MascotMood;
  activity: MascotActivity;
  confetti?: boolean;
  actions?: MascotToastAction[];
  talking: boolean;
};

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

function resolveMascotSound(payload: MascotToastPayload): KidSound {
  if (payload.sound) return payload.sound;
  if (payload.confetti) return "celebrate";
  if (payload.activity === "correct") return "answerCorrect";
  if (payload.activity === "wrong") return "answerWrong";
  if (payload.activity === "celebrate") return "celebrate";
  if (payload.mood === "think") return "whoosh";
  if (payload.mood === "wave") return "pop";
  if (payload.mood === "cheer") return "celebrate";
  return "success";
}

function resolveActivity(payload: MascotToastPayload): MascotActivity {
  if (payload.activity) return payload.activity;
  if (payload.confetti) return "celebrate";
  if (payload.mood === "think") return "think";
  if (payload.mood === "cheer") return "celebrate";
  if (payload.mood === "wave") return "talk";
  return "talk";
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
  const [companionOpen, setCompanionOpen] = useState(true);
  const [active, setActive] = useState<ActiveMascotState | null>(null);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCompanionOpen(localStorage.getItem(COMPANION_HIDDEN_KEY) !== "1");
  }, []);

  const clearMessageTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideMascot = useCallback(() => {
    clearMessageTimer();
    setActive(null);
  }, [clearMessageTimer]);

  const dismissCompanion = useCallback(() => {
    hideMascot();
    setCompanionOpen(false);
    localStorage.setItem(COMPANION_HIDDEN_KEY, "1");
  }, [hideMascot]);

  const reopenCompanion = useCallback(() => {
    setCompanionOpen(true);
    localStorage.removeItem(COMPANION_HIDDEN_KEY);
  }, []);

  const showMascot = useCallback(
    (payload: MascotToastPayload | string) => {
      if (hidden) return;

      const normalized: MascotToastPayload =
        typeof payload === "string" ? { message: payload, mood: "happy" } : payload;

      const message = normalized.message.replace("{name}", userName ?? "bạn");
      const activity = resolveActivity(normalized);
      const mood = normalized.mood ?? "happy";

      clearMessageTimer();
      setCompanionOpen(true);
      localStorage.removeItem(COMPANION_HIDDEN_KEY);

      setActive({
        message,
        subtitle: normalized.subtitle,
        mood,
        activity,
        confetti: normalized.confetti,
        actions: normalized.actions,
        talking: true,
      });

      play(resolveMascotSound(normalized));

      if (!normalized.persist) {
        hideTimerRef.current = setTimeout(() => {
          setActive(null);
          hideTimerRef.current = null;
        }, normalized.durationMs ?? MASCOT_DEFAULT_DURATION_MS);
      }
    },
    [clearMessageTimer, hidden, play, userName]
  );

  useEffect(() => {
    return () => clearMessageTimer();
  }, [clearMessageTimer]);

  useEffect(() => {
    hideMascot();
  }, [pathname, hideMascot]);

  useEffect(() => {
    const onGuestPlacementLimit = () => {
      showMascot(mascotGuestPlacementLimitMessage());
    };

    window.addEventListener(GUEST_PLACEMENT_LIMIT_HIT_EVENT, onGuestPlacementLimit);
    return () =>
      window.removeEventListener(GUEST_PLACEMENT_LIMIT_HIT_EVENT, onGuestPlacementLimit);
  }, [showMascot]);

  const hasActions = Boolean(active?.actions?.length);

  return (
    <MascotToastContext.Provider value={{ showMascot, hideMascot }}>
      {children}

      {!hidden && !companionOpen && (
        <button
          type="button"
          onClick={reopenCompanion}
          className="fixed bottom-4 right-4 z-[85] flex h-12 w-12 items-center justify-center rounded-full border-2 border-purple-200 bg-white text-xl shadow-lg transition-transform hover:scale-105"
          aria-label="Mở Thỏ Camba"
        >
          🐰
        </button>
      )}

      {!hidden && companionOpen && (
        <>
          <ConfettiBurst active={Boolean(active?.confetti)} />
          <div
            className="fixed bottom-4 right-4 z-[85] flex max-w-[min(100vw-1.5rem,20rem)] flex-col items-end gap-2"
            role="complementary"
            aria-label="Thỏ Camba — trợ lý học tập"
          >
            {active && (
              <div
                className="relative w-full animate-bounce-in rounded-2xl border-2 border-purple-200 bg-white px-3 py-2.5 pr-8 shadow-lg"
                role="status"
                aria-live="polite"
              >
                <button
                  type="button"
                  onClick={hideMascot}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-purple-600 transition-colors hover:bg-purple-50"
                  aria-label="Đóng tin nhắn"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="text-sm font-extrabold leading-snug text-purple-900">{active.message}</p>
                {active.subtitle && (
                  <p className="mt-1 text-xs font-semibold text-purple-700/90">{active.subtitle}</p>
                )}
                {active.actions && active.actions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {active.actions.map((action) => (
                      <Button
                        key={action.href}
                        asChild
                        size="sm"
                        variant={action.primary ? "default" : "outline"}
                        className={cn("h-8 rounded-full text-xs font-bold", action.primary && "kid-btn-fun")}
                        onClick={hideMascot}
                      >
                        <Link href={action.href}>{action.label}</Link>
                      </Button>
                    ))}
                    <button
                      type="button"
                      onClick={hideMascot}
                      className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline"
                    >
                      Để sau
                    </button>
                  </div>
                )}
                {hasActions && (
                  <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b-2 border-r-2 border-purple-200 bg-white" />
                )}
              </div>
            )}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={dismissCompanion}
                className="absolute -left-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-purple-200 bg-white text-purple-700 shadow-md transition-colors hover:bg-purple-50"
                aria-label="Ẩn Thỏ Camba"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-1 shadow-md ring-2 ring-white/80">
                <CambaMascot
                  size="sm"
                  mood={active?.mood ?? "happy"}
                  activity={active?.activity ?? "idle"}
                  talking={Boolean(active?.talking)}
                  animate
                />
              </div>
            </div>
          </div>
        </>
      )}
    </MascotToastContext.Provider>
  );
}
