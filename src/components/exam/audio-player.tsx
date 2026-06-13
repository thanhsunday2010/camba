"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useKidSound } from "@/components/kids/sound-provider";

interface AudioPlayerProps {
  src?: string | null;
  transcript?: string;
  title?: string;
  autoPlay?: boolean;
}

export function AudioPlayer({
  src,
  transcript,
  title,
  autoPlay = false,
}: AudioPlayerProps) {
  const { play } = useKidSound();
  const [audioFailed, setAudioFailed] = useState(false);
  const useTts = !src || audioFailed;

  const speak = useCallback(() => {
    if (!transcript || typeof window === "undefined") return;
    play("click");
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [transcript, play]);

  useEffect(() => {
    if (autoPlay && useTts && transcript) {
      const t = setTimeout(speak, 400);
      return () => clearTimeout(t);
    }
  }, [autoPlay, useTts, transcript, speak]);

  return (
    <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 via-pink-50 to-sky-50 p-4 shadow-sm">
      {title && (
        <p className="mb-2 text-sm font-extrabold text-purple-800">🎧 {title}</p>
      )}
      {src && !audioFailed ? (
        <audio
          controls
          className="w-full"
          src={src}
          autoPlay={autoPlay}
          onPlay={() => play("click")}
          onError={() => setAudioFailed(true)}
        >
          Trình duyệt không hỗ trợ audio.
        </audio>
      ) : transcript ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={speak}
            className="kid-btn-fun rounded-full"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Nghe ngay!
          </Button>
          <span className="text-xs font-semibold text-purple-600">
            Nhấn để nghe giọng đọc tiếng Anh 🔊
          </span>
        </div>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">Không có audio cho câu này.</p>
      )}
    </div>
  );
}
