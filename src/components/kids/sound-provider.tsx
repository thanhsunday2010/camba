"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { playKidSound, type KidSound } from "@/lib/kids/sounds";

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  play: (sound: KidSound) => void;
}

const SoundContext = createContext<SoundContextValue>({
  enabled: true,
  toggle: () => {},
  play: () => {},
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("camba-sound");
    if (stored === "off") setEnabled(false);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("camba-sound", next ? "on" : "off");
      if (next) playKidSound("pop");
      return next;
    });
  }, []);

  const play = useCallback(
    (sound: KidSound) => {
      if (enabled) playKidSound(sound);
    },
    [enabled]
  );

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useKidSound() {
  return useContext(SoundContext);
}
