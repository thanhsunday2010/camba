import type { SpeakingContent } from "@/lib/exam/scoring";

/** Text read aloud as the examiner question (never shown as text in UI). */
export function getSpeakingPromptText(content: SpeakingContent): string {
  const raw = content.script?.trim() || content.prompt?.trim() || "";
  return raw.replace(/^\[[^\]]+\]\s*/, "").trim();
}

export function buildSpeakingAudioUrl(level: string, questionId: string): string {
  return `/audio/speaking/${level}/${questionId}.mp3`;
}
