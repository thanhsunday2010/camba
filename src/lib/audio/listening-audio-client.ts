"use client";

export type ListeningPlaybackState = "idle" | "loading" | "playing";

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

const AUDIO_UNLOCK_KEY = "camba-audio-unlocked";

export function isListeningAudioUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUDIO_UNLOCK_KEY) === "1";
}

export function unlockListeningAudio(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUDIO_UNLOCK_KEY, "1");
}

export function stopAllListeningPlayback(): void {
  if (typeof window === "undefined") return;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }

  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }

  window.speechSynthesis?.cancel();
  activeUtterance = null;
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const onChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);

    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(window.speechSynthesis.getVoices());
    }, 800);
  });
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return (
    en.find((v) => v.lang.toLowerCase() === "en-gb") ??
    en.find((v) => v.lang.toLowerCase().startsWith("en-gb")) ??
    en.find((v) => v.lang.toLowerCase() === "en-us") ??
    en[0] ??
    voices[0]
  );
}

export async function probeStaticAudio(src: string): Promise<boolean> {
  try {
    const res = await fetch(src, { method: "HEAD", cache: "force-cache" });
    return res.ok;
  } catch {
    return false;
  }
}

export function playHtmlAudio(src: string): Promise<void> {
  stopAllListeningPlayback();
  unlockListeningAudio();

  return new Promise((resolve, reject) => {
    const audio = new Audio(src);
    activeAudio = audio;

    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Không phát được file audio"));
    audio.play().catch(reject);
  });
}

export function playBlobAudio(blob: Blob): Promise<void> {
  stopAllListeningPlayback();
  unlockListeningAudio();

  const url = URL.createObjectURL(blob);
  activeObjectUrl = url;

  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    activeAudio = audio;

    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Không phát được audio"));
    audio.play().catch(reject);
  });
}

export async function speakTranscript(transcript: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    throw new Error("Trình duyệt không hỗ trợ đọc text");
  }

  stopAllListeningPlayback();
  unlockListeningAudio();

  const voices = await waitForVoices();
  const voice = pickEnglishVoice(voices);

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = voice?.lang ?? "en-GB";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      activeUtterance = null;
      resolve();
    };
    utterance.onerror = () => {
      activeUtterance = null;
      reject(new Error("Không đọc được audio"));
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);

    // Chrome sometimes needs a resume after cancel
    setTimeout(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 120);
  });
}

export async function fetchQuestionAudio(questionId: string): Promise<Blob> {
  const res = await fetch(`/api/listening-audio/${questionId}`, {
    method: "GET",
    cache: "force-cache",
  });

  if (!res.ok) {
    throw new Error("API audio không khả dụng");
  }

  return res.blob();
}
