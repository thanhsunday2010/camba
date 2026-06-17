"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionRenderer } from "@/components/exam/question-renderer";
import { QuestionIllustration } from "@/components/exam/question-illustration";
import { resolveSharedReadingPassage } from "@/lib/exam/reading-passage-ui";
import { resolveMcqMedia } from "@/lib/exam/question-media";
import type { ObjectiveFeedback } from "@/components/exam/practice-objective-feedback";
import type { McqContent } from "@/lib/exam/scoring";
import type { QuestionType } from "@prisma/client";
import { getPracticeMinWords, type PracticeMinWordsContext } from "@/lib/exam/practice-min-words";

export type ReadingPassageQuestion = {
  id: string;
  type: QuestionType;
  content: unknown;
  audioUrl?: string | null;
  points: number;
  skill?: string;
  title?: string | null;
  correctAnswer?: unknown;
};

interface ReadingPassagePracticeProps {
  questions: ReadingPassageQuestion[];
  answers: Record<string, unknown>;
  objectiveFeedback: Record<string, ObjectiveFeedback>;
  onAnswer: (questionId: string, value: unknown, question: ReadingPassageQuestion) => void;
  submitting: boolean;
  attemptReady: boolean;
  onSubmit: () => void;
  minWordsContext: PracticeMinWordsContext;
}

function isAnswered(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) {
    return value.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
  }
  return true;
}

export function ReadingPassagePractice({
  questions,
  answers,
  objectiveFeedback,
  onAnswer,
  submitting,
  attemptReady,
  onSubmit,
  minWordsContext,
}: ReadingPassagePracticeProps) {
  const passage = resolveSharedReadingPassage(questions);
  const passageWords = passage.split(/\s+/).filter(Boolean).length;
  const firstMcq = questions[0]?.content as McqContent | undefined;
  const media = firstMcq
    ? resolveMcqMedia({
        question: firstMcq.question,
        passage: firstMcq.passage,
        imageDescription: firstMcq.imageDescription,
        imageUrl: firstMcq.imageUrl,
        sceneEmoji: firstMcq.sceneEmoji,
        questionType: firstMcq.questionType,
      })
    : null;

  const answeredCount = questions.filter((q) => isAnswered(answers[q.id])).length;
  const progressPct = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-purple-800">
        <span>
          {answeredCount}/{questions.length} câu đã trả lời
        </span>
        <div className="flex min-w-[140px] flex-1 items-center gap-2 sm:max-w-xs">
          <Progress value={progressPct} className="h-2" />
          <span className="text-xs text-muted-foreground">{progressPct}%</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:h-[min(calc(100dvh-11rem),780px)] lg:min-h-[420px]">
        <aside className="flex min-h-0 max-h-[50vh] flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50/90 to-white shadow-md lg:max-h-none lg:h-full">
          <div className="shrink-0 border-b border-sky-100 px-4 py-3">
            <h2 className="text-base font-extrabold text-sky-900">📄 Đoạn văn</h2>
            <p className="mt-0.5 text-xs font-medium text-sky-800/80">
              Đọc kỹ đoạn văn rồi trả lời các câu bên cạnh
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {media && (media.imageDescription || media.imageUrl) && (
              <div className="mb-4">
                <QuestionIllustration
                  imageUrl={media.imageUrl}
                  imageDescription={media.imageDescription}
                  sceneEmoji={media.sceneEmoji}
                />
              </div>
            )}
            <p
              className={
                passageWords > 450
                  ? "text-base font-medium leading-7 whitespace-pre-wrap text-slate-800 md:text-[17px]"
                  : "text-base font-medium leading-relaxed whitespace-pre-wrap text-slate-800 md:text-lg"
              }
            >
              {passage}
            </p>
          </div>
        </aside>

        <div className="flex min-h-0 max-h-[55vh] flex-col overflow-hidden rounded-2xl border-2 border-purple-200 bg-white/95 shadow-md lg:max-h-none lg:h-full">
          <div className="shrink-0 border-b border-purple-100 px-4 py-3">
            <h2 className="text-base font-extrabold text-purple-900">❓ Câu hỏi</h2>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {questions.length} câu theo format đề thi
            </p>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
            {questions.map((question, index) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                index={index}
                value={answers[question.id]}
                onChange={(v) => onAnswer(question.id, v, question)}
                disabled={submitting}
                hidePassage
                objectiveFeedback={objectiveFeedback[question.id] ?? null}
                lockObjectiveAnswer={!!objectiveFeedback[question.id]}
                practiceMinWords={getPracticeMinWords(
                  question.type,
                  question.content,
                  minWordsContext
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="kid-btn-fun rounded-full px-8"
          disabled={submitting || !attemptReady}
          onClick={onSubmit}
        >
          {submitting ? "Đang nộp..." : "🎉 Nộp bài"}
        </Button>
      </div>
    </div>
  );
}
