import { formatExplanationForStudent } from "@/lib/exam/question-explanation";
import { cn } from "@/lib/utils";

interface QuestionExplanationPanelProps {
  content: unknown;
  studentAnswer?: unknown;
  correctAnswer?: unknown;
  className?: string;
}

export function QuestionExplanationPanel({
  content,
  studentAnswer,
  correctAnswer,
  className,
}: QuestionExplanationPanelProps) {
  const text = formatExplanationForStudent(content, studentAnswer, correctAnswer);
  if (!text) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-950",
        className
      )}
    >
      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-blue-800">
        💡 Giải thích
      </p>
      <p className="whitespace-pre-line">{text}</p>
    </div>
  );
}
