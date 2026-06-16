"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { QuestionExplanationPanel } from "@/components/exam/question-explanation-panel";
import { formatCorrectAnswerDisplay } from "@/lib/exam/question-explanation";
import { cn } from "@/lib/utils";
import { QuestionType } from "@prisma/client";

export type ObjectiveFeedback = {
  isCorrect: boolean;
  correctDisplay: string;
  explanation: string | null;
};

export function PracticeObjectiveFeedback({
  feedback,
  questionType,
  content,
  studentAnswer,
  correctAnswer,
}: {
  feedback: ObjectiveFeedback;
  questionType: QuestionType;
  content: unknown;
  studentAnswer: unknown;
  correctAnswer: unknown;
}) {
  return (
    <div
      className={cn(
        "animate-bounce-in space-y-3 rounded-2xl border-2 p-4",
        feedback.isCorrect
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-mint-50"
          : "border-rose-300 bg-gradient-to-br from-rose-50 to-orange-50"
      )}
    >
      <div className="flex items-start gap-3">
        {feedback.isCorrect ? (
          <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-7 w-7 shrink-0 text-rose-600" />
        )}
        <div>
          <p
            className={cn(
              "text-lg font-extrabold",
              feedback.isCorrect ? "text-emerald-800" : "text-rose-800"
            )}
          >
            {feedback.isCorrect ? "🎉 Chính xác! Giỏi lắm!" : "😅 Chưa đúng rồi — cố lên nhé!"}
          </p>
          {!feedback.isCorrect && (
            <p className="mt-1 text-sm font-semibold text-rose-900">
              Đáp án đúng:{" "}
              <span className="font-bold">
                {feedback.correctDisplay ||
                  formatCorrectAnswerDisplay(questionType, correctAnswer)}
              </span>
            </p>
          )}
        </div>
      </div>

      {(feedback.explanation || !feedback.isCorrect) && (
        <QuestionExplanationPanel
          content={content}
          studentAnswer={studentAnswer}
          correctAnswer={correctAnswer}
          className={
            feedback.isCorrect
              ? "border-emerald-200 bg-white/80"
              : "border-rose-200 bg-white/80"
          }
        />
      )}
    </div>
  );
}
