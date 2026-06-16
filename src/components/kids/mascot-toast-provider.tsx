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
import { usePathname } from "next/navigation";
import { CambaMascot, type MascotMood } from "./camba-mascot";
import { useKidSound } from "./sound-provider";
import { ConfettiBurst } from "./confetti-burst";
import { Button } from "@/components/ui/button";
import {
  MASCOT_DEFAULT_DURATION_MS,
  mascotGuestPlacementLimitMessage,
  type MascotToastAction,
  type MascotToastPayload,
} from "@/lib/kids/mascot-messages";
import { GUEST_PLACEMENT_LIMIT_HIT_EVENT } from "@/lib/promo/events";
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
    actions?: MascotToastAction[];
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
        actions: normalized.actions,
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

  useEffect(() => {
    const onGuestPlacementLimit = () => {
      showMascot(mascotGuestPlacementLimitMessage());
    };

    window.addEventListener(GUEST_PLACEMENT_LIMIT_HIT_EVENT, onGuestPlacementLimit);
    return () =>
      window.removeEventListener(GUEST_PLACEMENT_LIMIT_HIT_EVENT, onGuestPlacementLimit);
  }, [showMascot]);

  const hasActions = Boolean(toast?.actions?.length);

  return (
    <MascotToastContext.Provider value={{ showMascot, hideMascot }}>
      {children}
      {!hidden && toast && (
        <>
          <ConfettiBurst active={Boolean(toast.confetti)} />
          <div
            className={cn(
              "fixed inset-0 z-[110] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]",
              hasActions ? "pointer-events-auto" : "pointer-events-none"
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex max-w-xs flex-col items-center gap-3 animate-bounce-in text-center">
              <div
                className={cn(
                  "rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-1.5 shadow-lg ring-2 ring-white/80"
                )}
              >
                <CambaMascot size="lg" mood={toast.mood} />
              </div>
              <div className="relative w-full rounded-2xl border-2 border-purple-200 bg-white px-4 py-3 shadow-xl">
                <p className="text-base font-extrabold leading-snug text-purple-900 md:text-lg">
                  {toast.message}
                </p>
                {toast.subtitle && (
                  <p className="mt-1.5 text-xs font-semibold text-purple-700/90 md:text-sm">
                    {toast.subtitle}
                  </p>
                )}
                {toast.actions && toast.actions.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    {toast.actions.map((action) => (
                      <Button
                        key={action.href}
                        asChild
                        variant={action.primary ? "default" : "outline"}
                        className={cn(
                          "rounded-full font-bold",
                          action.primary && "kid-btn-fun"
                        )}
                        onClick={hideMascot}
                      >
                        <Link href={action.href}>{action.label}</Link>
                      </Button>
                    ))}
                  </div>
                )}
                {hasActions && (
                  <button
                    type="button"
                    onClick={hideMascot}
                    className="mt-3 text-sm font-semibold text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Để sau
                  </button>
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
