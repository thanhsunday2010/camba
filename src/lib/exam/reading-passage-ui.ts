import type { McqContent } from "@/lib/exam/scoring";

export function extractReadingPassage(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const passage = (content as McqContent).passage;
  return typeof passage === "string" ? passage.trim() : "";
}

type PassageQuestion = {
  skill?: string | null;
  type: string;
  content: unknown;
};

/** Luyện Reading dạng 1 đoạn văn + nhiều câu MCQ. */
export function isReadingPassageSession(
  paperKind: string | undefined,
  questions: PassageQuestion[]
): boolean {
  if (paperKind !== "PRACTICE" || questions.length === 0) return false;
  if (!questions.every((q) => q.skill === "READING" && q.type === "MCQ")) return false;

  const passage = extractReadingPassage(questions[0]!.content);
  if (!passage) return false;

  return questions.every((q) => extractReadingPassage(q.content) === passage);
}
