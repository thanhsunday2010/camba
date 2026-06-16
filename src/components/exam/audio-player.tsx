"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Pause, RotateCcw, Volume2 } from "lucide-react";
import {
  fetchQuestionAudio,
  fetchSpeakingQuestionAudio,
  isListeningAudioUnlocked,
  playBlobAudio,
  playHtmlAudio,
  probeStaticAudio,
  speakTranscript,
  stopAllListeningPlayback,
  type ListeningPlaybackState,
} from "@/lib/audio/listening-audio-client";

interface AudioPlayerProps {
  questionId?: string;
  src?: string | null;
  transcript?: string;
  title?: string;
  autoPlay?: boolean;
  /** Listening section — show prominent play UI */
  isListening?: boolean;
  /** Speaking examiner question — use speaking TTS API */
  isSpeakingPrompt?: boolean;
  /** Nằm trong card Speaking — bỏ khung lồng */
  embedded?: boolean;
}

export function AudioPlayer({
  questionId,
  src,
  transcript,
  title,
  autoPlay = false,
  isListening = false,
  isSpeakingPrompt = false,
  embedded = false,
}: AudioPlayerProps) {
  const [state, setState] = useState<ListeningPlaybackState>("idle");
  const [staticOk, setStaticOk] = useState<boolean | null>(null);
  const autoPlayedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopAllListeningPlayback();
    };
  }, []);

  useEffect(() => {
    autoPlayedRef.current = false;
    setState("idle");
    stopAllListeningPlayback();

    if (!src) {
      setStaticOk(false);
      return;
    }

    let cancelled = false;
    probeStaticAudio(src).then((ok) => {
      if (!cancelled) setStaticOk(ok);
    });

    return () => {
      cancelled = true;
    };
  }, [src, questionId, transcript]);

  const playAudio = useCallback(async () => {
    if (!transcript && !src && !questionId) return;

    setState("loading");
    stopAllListeningPlayback();

    try {
      if (src && staticOk !== false) {
        await playHtmlAudio(src);
      } else if (questionId) {
        const blob = isSpeakingPrompt
          ? await fetchSpeakingQuestionAudio(questionId)
          : await fetchQuestionAudio(questionId);
        await playBlobAudio(blob);
      } else if (transcript) {
        await speakTranscript(transcript);
      } else {
        throw new Error("Không có nội dung audio");
      }

      if (mountedRef.current) setState("idle");
    } catch {
      if (questionId && src && staticOk !== false) {
        try {
          const blob = isSpeakingPrompt
            ? await fetchSpeakingQuestionAudio(questionId)
            : await fetchQuestionAudio(questionId);
          await playBlobAudio(blob);
          if (mountedRef.current) setState("idle");
          return;
        } catch {
          /* try browser TTS next */
        }
      }
      if (transcript) {
        try {
          await speakTranscript(transcript);
          if (mountedRef.current) setState("idle");
          return;
        } catch {
          /* fall through */
        }
      }
      if (mountedRef.current) setState("idle");
    }
  }, [src, staticOk, questionId, transcript, isSpeakingPrompt]);

  const stopAudio = useCallback(() => {
    stopAllListeningPlayback();
    setState("idle");
  }, []);

  useEffect(() => {
    if (!autoPlay || autoPlayedRef.current) return;
    if (!transcript && !src && !questionId) return;
    if (!isListeningAudioUnlocked() && isListening) return;

    autoPlayedRef.current = true;
    const t = setTimeout(() => {
      playAudio();
    }, 350);

    return () => clearTimeout(t);
  }, [autoPlay, isListening, isSpeakingPrompt, transcript, src, questionId, playAudio]);

  if (!transcript && !src && !questionId) {
    return (
      <p className="text-sm font-medium text-muted-foreground">
        Không có audio cho câu này.
      </p>
    );
  }

  const isPlaying = state === "loading";

  return (
    <div
      className={
        embedded
          ? "space-y-2"
          : "rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 via-pink-50 to-sky-50 p-4 shadow-sm"
      }
    >
      {title && !embedded && (
        <p className="mb-2 text-sm font-extrabold text-purple-800">🎧 {title}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="default"
          size={isListening ? "default" : "sm"}
          onClick={playAudio}
          disabled={isPlaying}
          className="kid-btn-fun rounded-full"
        >
          {isPlaying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              {isListening ? "Nghe audio" : isSpeakingPrompt ? "Nghe câu hỏi" : "Nghe ngay!"}
            </>
          )}
        </Button>

        {state === "idle" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={playAudio}
            className="rounded-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Nghe lại
          </Button>
        )}

        {isPlaying && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopAudio}
            className="rounded-full"
          >
            <Pause className="mr-2 h-4 w-4" />
            Dừng
          </Button>
        )}

        <span className="text-base font-medium text-purple-600/90">
          {isListening && !isListeningAudioUnlocked()
            ? "Nhấn nút để nghe — sau lần đầu audio sẽ tự phát ở câu Listening tiếp theo"
            : isSpeakingPrompt
              ? "Giọng giám khảo · Cambridge / IELTS"
              : "Giọng đọc tiếng Anh chuẩn Cambridge 🔊"}
        </span>
      </div>

      {src && staticOk === false && transcript && (
        <p className="mt-2 text-xs text-muted-foreground">
          File MP3 chưa có — đang dùng giọng đọc AI / trình duyệt.
        </p>
      )}
    </div>
  );
}
