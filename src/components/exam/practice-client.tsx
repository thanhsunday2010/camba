"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/exam/question-renderer";
import { ExamTimer } from "@/components/exam/exam-timer";
import { startAttemptAction, submitAttemptAction } from "@/lib/actions/exam";
import { QuestionType } from "@prisma/client";

interface PaperQuestion {
  id: string;
  type: QuestionType;
  content: unknown;
  audioUrl?: string | null;
  points: number;
}

interface PracticeClientProps {
  paperId: string;
  paperTitle: string;
  timeLimit?: number | null;
  questions: PaperQuestion[];
}

export function PracticeClient({
  paperId,
  paperTitle,
  timeLimit,
  questions,
}: PracticeClientProps) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(new Date());

  useEffect(() => {
    startAttemptAction(paperId).then((res) => {
      if (res.attemptId) setAttemptId(res.attemptId);
      else toast.error(res.error ?? "Không thể bắt đầu bài");
    });
  }, [paperId]);

  const setAnswer = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    setSubmitting(true);

    const timeSpent = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const result = await submitAttemptAction(attemptId, answers, timeSpent);

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    const aiQuestions = questions.filter(
      (q) => q.type === "FREE_TEXT" || q.type === "SPEAKING_PROMPT"
    );

    for (const q of aiQuestions) {
      const ans = answers[q.id];
      if (q.type === "FREE_TEXT" && typeof ans === "string" && ans.trim().length >= 10) {
        try {
          await fetch("/api/ai/grade-writing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.id,
              attemptId,
              studentAnswer: ans,
            }),
          });
        } catch {
          toast.error("Không thể chấm AI cho writing");
        }
      }
    }

    toast.success("Nộp bài thành công!");
    router.push(`/results/${attemptId}`);
  }, [attemptId, answers, startedAt, questions, router]);

  const current = questions[currentIndex];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{paperTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Câu {currentIndex + 1}/{questions.length}
          </p>
        </div>
        <ExamTimer timeLimit={timeLimit} onTimeUp={handleSubmit} startedAt={startedAt} />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border bg-white p-4">
            <p className="mb-3 text-sm font-medium">Danh sách câu</p>
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-9 rounded-md text-sm font-medium transition-colors ${
                    i === currentIndex
                      ? "bg-cambridge-600 text-white"
                      : answers[q.id]
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={handleSubmit}
              disabled={submitting || !attemptId}
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </Button>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {current && (
            <QuestionRenderer
              question={current}
              index={currentIndex}
              value={answers[current.id]}
              onChange={(v) => setAnswer(current.id, v)}
              onSpeakingTranscript={async (text) => {
                if (!attemptId) return;
                try {
                  const res = await fetch("/api/ai/grade-speaking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      questionId: current.id,
                      attemptId,
                      transcript: text,
                    }),
                  });
                  if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error);
                  }
                  setAnswer(current.id, text);
                  toast.success("Đã gửi bài nói để chấm AI (Gemini)");
                } catch {
                  toast.error("Không thể chấm speaking");
                }
              }}
              disabled={submitting}
            />
          )}

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Câu trước
            </Button>
            <Button
              variant="outline"
              disabled={currentIndex >= questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Câu sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
