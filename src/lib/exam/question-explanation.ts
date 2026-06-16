import type { McqContent, GapFillContent } from "./scoring";

export type QuestionExplanationContent = {
  explanationVi?: string;
  distractorNotes?: Record<string, string>;
};

export function getQuestionExplanationContent(
  content: unknown
): QuestionExplanationContent {
  if (!content || typeof content !== "object") return {};
  const c = content as QuestionExplanationContent;
  return {
    explanationVi: typeof c.explanationVi === "string" ? c.explanationVi.trim() : undefined,
    distractorNotes:
      c.distractorNotes && typeof c.distractorNotes === "object"
        ? c.distractorNotes
        : undefined,
  };
}

function normalizeAnswer(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function hasStoredExplanation(content: unknown): boolean {
  const { explanationVi, distractorNotes } = getQuestionExplanationContent(content);
  return !!(explanationVi || (distractorNotes && Object.keys(distractorNotes).length > 0));
}

export function formatCorrectAnswerDisplay(type: string, correctAnswer: unknown): string {
  if (correctAnswer == null) return "—";
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.map((v, i) => `${i + 1}. ${String(v)}`).join(" · ");
  }
  if (type === "GAP_FILL" && typeof correctAnswer === "string") {
    return correctAnswer;
  }
  return String(correctAnswer);
}

/** Lời giải hiển thị — ưu tiên ghi chú theo đáp án sai (MCQ), rồi explanationVi chung */
export function formatExplanationForStudent(
  content: unknown,
  studentAnswer: unknown,
  correctAnswer?: unknown
): string | null {
  const { explanationVi, distractorNotes } = getQuestionExplanationContent(content);
  if (!explanationVi && !distractorNotes) return null;

  const lines: string[] = [];
  const studentStr = String(studentAnswer ?? "").trim();

  if (distractorNotes && studentStr) {
    const note =
      distractorNotes[studentStr] ??
      Object.entries(distractorNotes).find(
        ([key]) => normalizeAnswer(key) === normalizeAnswer(studentStr)
      )?.[1];
    if (note?.trim()) lines.push(note.trim());
  }

  if (explanationVi) lines.push(explanationVi);

  if (lines.length === 0 && correctAnswer != null) {
    return explanationVi ?? null;
  }

  return lines.length > 0 ? lines.join("\n\n") : null;
}

export function buildExplanationContext(
  type: string,
  content: unknown,
  correctAnswer: unknown
): string {
  const c = content as McqContent & GapFillContent;
  const parts: string[] = [];

  if (c.passage?.trim()) parts.push(`Passage:\n${c.passage.trim()}`);
  if (c.transcript?.trim()) parts.push(`Transcript:\n${c.transcript.trim()}`);
  if (c.question?.trim()) parts.push(`Question: ${c.question.trim()}`);
  if (Array.isArray(c.options) && c.options.length > 0) {
    parts.push(`Options: ${c.options.join(" | ")}`);
  }
  if (type === "GAP_FILL" && c.passage?.trim()) {
    parts.push(`Gap-fill passage:\n${c.passage.trim()}`);
  }

  parts.push(`Correct answer: ${JSON.stringify(correctAnswer)}`);
  return parts.join("\n\n");
}
