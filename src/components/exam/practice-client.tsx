"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/exam/question-renderer";
import { ExamTimer } from "@/components/exam/exam-timer";
import { ConfettiBurst } from "@/components/kids/confetti-burst";
import { useKidSound } from "@/components/kids/sound-provider";
import {
  stopAllListeningPlayback,
  unlockListeningAudio,
} from "@/lib/audio/listening-audio-client";
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
  initialAttemptId?: string;
  isGuestAttempt?: boolean;
}

const SECTION_EMOJI: Record<string, string> = {
  READING: "📖",
  LISTENING: "🎧",
  USE_OF_ENGLISH: "✏️",
  WRITING: "📝",
  SPEAKING: "🎤",
};

export function PracticeClient({
  paperId,
  paperTitle,
  timeLimit,
  isMockTest = false,
  paperKind,
  sections,
  questions,
  initialAttemptId,
  isGuestAttempt = false,
}: PracticeClientProps) {
  const router = useRouter();
  const { play } = useKidSound();
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId ?? null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startedAt] = useState(new Date());

  useEffect(() => {
    if (initialAttemptId) {
      setAttemptId(initialAttemptId);
      import("@/lib/actions/placement").then(({ getPlacementAttemptAction }) => {
        getPlacementAttemptAction(initialAttemptId).then((res) => {
          if (res.savedAnswers && Object.keys(res.savedAnswers).length > 0) {
            setAnswers(res.savedAnswers);
            toast.info("Tiếp tục bài làm đang dở");
          }
        });
      });
      return;
    }

    startAttemptAction(paperId).then((res) => {
      if (res.attemptId) {
        setAttemptId(res.attemptId);
        if (res.savedAnswers && Object.keys(res.savedAnswers).length > 0) {
          setAnswers(res.savedAnswers);
          toast.info("Tiếp tục bài làm đang dở");
        }
      } else toast.error(res.error ?? "Không thể bắt đầu bài");
    });
  }, [paperId, initialAttemptId]);

  useEffect(() => {
    stopAllListeningPlayback();
  }, [currentIndex]);

  const setAnswer = useCallback(
    (questionId: string, value: unknown) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      play("pop");
    },
    [play]
  );

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    setSubmitting(true);
    play("celebrate");
    setShowConfetti(true);

    const timeSpent = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const result = await submitAttemptAction(attemptId, answers, timeSpent);

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
      setShowConfetti(false);
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

    toast.success("Tuyệt vời! Nộp bài thành công! 🎉");
    router.refresh();
    await new Promise((r) => setTimeout(r, 400));

    if (paperKind === "PLACEMENT") {
      router.push(`/placement/results/${attemptId}`);
    } else {
      router.push(`/results/${attemptId}`);
    }
  }, [attemptId, answers, startedAt, questions, router, paperKind, play]);

  const goNext = () => {
    stopAllListeningPlayback();
    play("whoosh");
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const goPrev = () => {
    stopAllListeningPlayback();
    play("click");
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const current = questions[currentIndex];
  const currentSection = sections?.find(
    (s) => currentIndex >= s.startIndex && currentIndex < s.endIndex
  );
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  return (
    <div
      className="container mx-auto px-4 py-6"
      onPointerDown={() => unlockListeningAudio()}
    >
      <ConfettiBurst active={showConfetti} />

      {paperKind === "PLACEMENT" && (
        <div className="mb-4 animate-bounce-in rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-3 text-sm font-semibold text-sky-900">
          🎯 <strong>Bài test trình độ:</strong> Làm hết các phần để biết level Cambridge của bạn!
        </div>
      )}
      {isMockTest && paperKind !== "PLACEMENT" && (
        <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-semibold text-amber-900">
          ⏰ <strong>Chế độ thi thử:</strong> Làm tuần tự từng câu nhé!
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold kid-gradient-text">{paperTitle}</h1>
          {currentSection && (
            <p className="mt-1 text-sm font-bold text-purple-700">
              {SECTION_EMOJI[currentSection.skill] ?? "📌"} Phần: {currentSection.label}
            </p>
          )}
          <p className="text-sm font-semibold text-muted-foreground">
            Câu {currentIndex + 1}/{questions.length} · Đã trả lời {answeredCount} câu
          </p>
          <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <ExamTimer timeLimit={timeLimit} onTimeUp={handleSubmit} startedAt={startedAt} />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border-2 border-purple-200 bg-white/90 p-4 shadow-md backdrop-blur-sm">
            <p className="mb-3 text-sm font-extrabold text-purple-700">🗺️ Bản đồ câu hỏi</p>
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
              {questions.map((q, i) => {
                const sec = sections?.find((s) => i >= s.startIndex && i < s.endIndex);
                return (
                  <button
                    key={q.id}
                    type="button"
                    title={sec?.label}
                    onClick={() => {
                      if (!isMockTest) {
                        play("click");
                        setCurrentIndex(i);
                      }
                    }}
                    disabled={isMockTest && i !== currentIndex}
                    className={`h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                      i === currentIndex
                        ? "scale-110 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
                        : answers[q.id]
                          ? "bg-mint-200 text-mint-900 ring-2 ring-mint-400"
                          : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    } ${isMockTest && i !== currentIndex ? "cursor-not-allowed opacity-50" : "hover:scale-105"}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <Button
              className="mt-4 w-full kid-btn-fun"
              onClick={handleSubmit}
              disabled={submitting || !attemptId}
            >
              {submitting ? "Đang nộp..." : "🎉 Nộp bài"}
            </Button>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {current && (
            <div className="animate-bounce-in" key={current.id}>
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
                    play("success");
                    toast.success("Giỏi lắm! Đã gửi bài nói 🎤");
                  } catch {
                    toast.error("Không thể chấm speaking");
                  }
                }}
                disabled={submitting}
              />
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <Button variant="outline" disabled={currentIndex === 0 || isMockTest} onClick={goPrev}>
              ← Câu trước
            </Button>
            <Button
              variant="fun"
              disabled={currentIndex >= questions.length - 1}
              onClick={goNext}
            >
              Câu sau →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
