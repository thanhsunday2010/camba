"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

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
  const [audioFailed, setAudioFailed] = useState(false);
  const useTts = !src || audioFailed;

  const speak = useCallback(() => {
    if (!transcript || typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [transcript]);

  useEffect(() => {
    if (autoPlay && useTts && transcript) {
      const t = setTimeout(speak, 400);
      return () => clearTimeout(t);
    }
  }, [autoPlay, useTts, transcript, speak]);

  return (
    <div className="rounded-lg border bg-cambridge-50 p-4">
      {title && (
        <p className="mb-2 text-sm font-medium text-cambridge-800">{title}</p>
      )}
      {src && !audioFailed ? (
        <audio
          controls
          className="w-full"
          src={src}
          autoPlay={autoPlay}
          onError={() => setAudioFailed(true)}
        >
          Trình duyệt không hỗ trợ audio.
        </audio>
      ) : transcript ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={speak}>
            <Volume2 className="mr-2 h-4 w-4" />
            Nghe audio (TTS)
          </Button>
          <span className="text-xs text-muted-foreground">
            Phát bằng giọng đọc tiếng Anh — tải file MP3 nếu có sẵn
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Không có audio cho câu này.</p>
      )}
    </div>
  );
}
