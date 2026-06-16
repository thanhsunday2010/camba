import { QuestionType } from "@prisma/client";

export type PracticeMinWordsContext = {
  paperTitle?: string;
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
};

export function countAnswerWords(value: unknown): number {
  if (typeof value !== "string") return 0;
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function isIeltsExamContext(context?: PracticeMinWordsContext): boolean {
  if (!context) return false;
  const title = context.paperTitle?.toLowerCase() ?? "";
  if (title.includes("ielts")) return true;
  const poolKey = context.practicePoolKey ?? context.mockPoolKey ?? "";
  return poolKey.startsWith("IELTS:");
}

export function isIeltsWritingOrSpeaking(
  content: unknown,
  context?: PracticeMinWordsContext
): boolean {
  if (isIeltsExamContext(context)) return true;
  if (!content || typeof content !== "object") return false;
  return (content as { examTrack?: string }).examTrack === "IELTS";
}

/** Minimum words before next question / submit for Writing & Speaking */
export function getPracticeMinWords(
  type: QuestionType,
  content: unknown,
  context?: PracticeMinWordsContext
): number | null {
  if (type !== "FREE_TEXT" && type !== "SPEAKING_PROMPT") return null;
  return isIeltsWritingOrSpeaking(content, context) ? 30 : 10;
}

export function meetsPracticeMinWords(
  type: QuestionType,
  content: unknown,
  value: unknown,
  context?: PracticeMinWordsContext
): boolean {
  const min = getPracticeMinWords(type, content, context);
  if (min == null) return true;
  return countAnswerWords(value) >= min;
}

export function practiceMinWordsMessage(
  type: QuestionType,
  content: unknown,
  context?: PracticeMinWordsContext
): string {
  const min = getPracticeMinWords(type, content, context) ?? 10;
  const label = type === "SPEAKING_PROMPT" ? "bài nói" : "bài viết";
  return `Cần ít nhất ${min} từ tiếng Anh trong ${label} trước khi chuyển câu hoặc nộp bài.`;
}

export function buildPracticeMinWordsContext(paper: {
  title?: string;
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): PracticeMinWordsContext {
  return {
    paperTitle: paper.title,
    practicePoolKey: paper.practicePoolKey,
    mockPoolKey: paper.mockPoolKey,
  };
}
