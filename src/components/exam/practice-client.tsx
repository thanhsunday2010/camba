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
  skill?: string;
}

interface PaperSection {
  skill: string;
  label: string;
  startIndex: number;
  endIndex: number;
  timeLimit?: number;
}

interface PracticeClientProps {
  paperId: string;
  paperTitle: string;
  timeLimit?: number | null;
  isMockTest?: boolean;
  paperKind?: string;
  sections?: PaperSection[] | null;
  questions: PaperQuestion[];
}

export function PracticeClient({
  paperId,
  paperTitle,
  timeLimit,
  isMockTest = false,
  paperKind,
  sections,
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
      if (res.attemptId) {
        setAttemptId(res.attemptId);
        if (res.savedAnswers && Object.keys(res.savedAnswers).length > 0) {
          setAnswers(res.savedAnswers);
          toast.info("Tiếp tục bài làm đang dở");
        }
      } else toast.error(res.error ?? "Không thể bắt đầu bài");
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
    if (paperKind === "PLACEMENT") {
      router.push(`/placement/results/${attemptId}`);
    } else {
      router.push(`/results/${attemptId}`);
    }
  }, [attemptId, answers, startedAt, questions, router, paperKind]);

  const current = questions[currentIndex];
  const currentSection = sections?.find(
    (s) => currentIndex >= s.startIndex && currentIndex < s.endIndex
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {paperKind === "PLACEMENT" && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <strong>Bài test trình độ:</strong> Làm hết các phần Reading, Listening và Use of English.
          Kết quả sẽ đánh giá trình độ CEFR và đề xuất cấp độ Cambridge phù hợp.
        </div>
      )}
      {(isMockTest && paperKind !== "PLACEMENT") && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Chế độ thi thử:</strong> Làm tuần tự từng câu, không nhảy câu tự do. Hết giờ sẽ tự nộp bài.
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{paperTitle}</h1>
          {currentSection && (
            <p className="text-sm font-medium text-cambridge-700">
              Phần: {currentSection.label}
            </p>
          )}
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
              {questions.map((q, i) => {
                const sec = sections?.find((s) => i >= s.startIndex && i < s.endIndex);
                return (
                <button
                  key={q.id}
                  type="button"
                  title={sec?.label}
                  onClick={() => {
                    if (!isMockTest) setCurrentIndex(i);
                  }}
                  disabled={isMockTest && i !== currentIndex}
                  className={`h-9 rounded-md text-sm font-medium transition-colors ${
                    i === currentIndex
                      ? "bg-cambridge-600 text-white"
                      : answers[q.id]
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 hover:bg-slate-200"
                  } ${isMockTest && i !== currentIndex ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {i + 1}
                </button>
              );})}
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
              isListening={currentSection?.skill === "LISTENING"}
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
              disabled={currentIndex === 0 || isMockTest}
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
