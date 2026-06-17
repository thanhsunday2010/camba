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
import type { MascotActivity, MascotMood } from "./camba-mascot";
import { useKidSound } from "./sound-provider";
import { ConfettiBurst } from "./confetti-burst";
import {
  MASCOT_DEFAULT_DURATION_MS,
  mascotGuestPlacementLimitMessage,
  type MascotToastAction,
  type MascotToastPayload,
} from "@/lib/kids/mascot-messages";
import type { KidSound } from "@/lib/kids/sounds";
import { GUEST_PLACEMENT_LIMIT_HIT_EVENT } from "@/lib/promo/events";
import { pickLoadingPhrase } from "@/lib/kids/loading-phrases";

const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/teacher"];
const GRADING_PHRASE_INITIAL_MS = 1800;
const GRADING_PHRASE_CYCLE_MS = 2800;

export type ActiveMascotState = {
  message: string;
  subtitle?: string;
  mood: MascotMood;
  activity: MascotActivity;
  confetti?: boolean;
  actions?: MascotToastAction[];
  talking: boolean;
  cycleLoadingPhrases?: boolean;
};

type MascotToastContextValue = {
  showMascot: (payload: MascotToastPayload | string) => void;
  hideMascot: () => void;
  active: ActiveMascotState | null;
};

const MascotToastContext = createContext<MascotToastContextValue>({
  showMascot: () => {},
  hideMascot: () => {},
  active: null,
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
  const [active, setActive] = useState<ActiveMascotState | null>(null);
  const [phraseCycleSession, setPhraseCycleSession] = useState(0);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

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

  const showMascot = useCallback(
    (payload: MascotToastPayload | string) => {
      if (hidden) return;

      const normalized: MascotToastPayload =
        typeof payload === "string" ? { message: payload, mood: "happy" } : payload;

      const message = normalized.message.replace("{name}", userName ?? "bạn");
      const activity = resolveActivity(normalized);
      const mood = normalized.mood ?? "happy";

      clearMessageTimer();

      setActive({
        message,
        subtitle: normalized.subtitle,
        mood,
        activity,
        confetti: normalized.confetti,
        actions: normalized.actions,
        talking: true,
        cycleLoadingPhrases: normalized.cycleLoadingPhrases,
      });

      if (normalized.cycleLoadingPhrases) {
        setPhraseCycleSession((s) => s + 1);
      }

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
    if (!active?.cycleLoadingPhrases) return;

    const applyPhrase = () => {
      const { en, vi } = pickLoadingPhrase();
      setActive((prev) =>
        prev?.cycleLoadingPhrases
          ? { ...prev, message: en, subtitle: vi, talking: true }
          : prev
      );
    };

    const delayId = window.setTimeout(applyPhrase, GRADING_PHRASE_INITIAL_MS);
    const intervalId = window.setInterval(applyPhrase, GRADING_PHRASE_CYCLE_MS);

    return () => {
      window.clearTimeout(delayId);
      window.clearInterval(intervalId);
    };
  }, [phraseCycleSession, active?.cycleLoadingPhrases]);

  useEffect(() => {
    const onGuestPlacementLimit = () => {
      showMascot(mascotGuestPlacementLimitMessage());
    };

    window.addEventListener(GUEST_PLACEMENT_LIMIT_HIT_EVENT, onGuestPlacementLimit);
    return () =>
      window.removeEventListener(GUEST_PLACEMENT_LIMIT_HIT_EVENT, onGuestPlacementLimit);
  }, [showMascot]);

  return (
    <MascotToastContext.Provider value={{ showMascot, hideMascot, active: hidden ? null : active }}>
      {children}
      {!hidden && <ConfettiBurst active={Boolean(active?.confetti)} />}
    </MascotToastContext.Provider>
  );
}
