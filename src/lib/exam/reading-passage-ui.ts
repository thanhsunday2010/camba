import type { McqContent } from "@/lib/exam/scoring";

export function extractReadingPassage(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const passage = (content as McqContent).passage;
  return typeof passage === "string" ? passage.trim() : "";
}

export type PassageQuestion = {
  skill?: string | null;
  type: string;
  content: unknown;
  title?: string | null;
};

function normalizePassage(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/** Lấy đoạn văn dùng chung (ưu tiên bản dài nhất trong bộ câu). */
export function resolveSharedReadingPassage(questions: PassageQuestion[]): string {
  const passages = questions
    .map((q) => extractReadingPassage(q.content))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return passages[0] ?? "";
}

function passagesMatch(questions: PassageQuestion[]): boolean {
  const normalized = questions
    .map((q) => normalizePassage(extractReadingPassage(q.content)))
    .filter(Boolean);
  if (normalized.length === 0) return false;
  const first = normalized[0]!;
  return normalized.every((p) => p === first);
}

function titlesMatch(questions: PassageQuestion[]): boolean {
  const titles = questions.map((q) => q.title?.trim().toLowerCase()).filter(Boolean);
  return titles.length === questions.length && new Set(titles).size === 1;
}

/** Luyện Reading dạng 1 đoạn văn + nhiều câu MCQ (Cambridge passage set). */
export function isReadingPassageSession(
  paperKind: string | undefined,
  questions: PassageQuestion[]
): boolean {
  if (paperKind !== "PRACTICE" || questions.length < 2) return false;
  if (!questions.every((q) => q.skill === "READING" && q.type === "MCQ")) return false;

  const hasPassage = questions.some((q) => extractReadingPassage(q.content));
  if (!hasPassage) return false;

  if (passagesMatch(questions)) return true;
  if (titlesMatch(questions)) return true;

  return false;
}
