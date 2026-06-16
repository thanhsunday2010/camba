import { QuestionType } from "@prisma/client";

export function countAnswerWords(value: unknown): number {
  if (typeof value !== "string") return 0;
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function isIeltsWritingOrSpeaking(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  return (content as { examTrack?: string }).examTrack === "IELTS";
}

/** Minimum words before next question / submit for Writing & Speaking */
export function getPracticeMinWords(
  type: QuestionType,
  content: unknown
): number | null {
  if (type !== "FREE_TEXT" && type !== "SPEAKING_PROMPT") return null;
  return isIeltsWritingOrSpeaking(content) ? 30 : 10;
}

export function meetsPracticeMinWords(
  type: QuestionType,
  content: unknown,
  value: unknown
): boolean {
  const min = getPracticeMinWords(type, content);
  if (min == null) return true;
  return countAnswerWords(value) >= min;
}

export function practiceMinWordsMessage(
  type: QuestionType,
  content: unknown
): string {
  const min = getPracticeMinWords(type, content) ?? 10;
  const label =
    type === "SPEAKING_PROMPT" ? "bài nói" : "bài viết";
  return `Cần ít nhất ${min} từ tiếng Anh trong ${label} trước khi chuyển câu hoặc nộp bài.`;
}
