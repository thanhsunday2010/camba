"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { gradeObjectiveAnswer } from "@/lib/exam/scoring";
import { formatExplanationForStudent } from "@/lib/exam/question-explanation";
import { QuestionExplanationPanel } from "@/components/exam/question-explanation-panel";
import { getSectionForIndex, type PaperSection } from "@/lib/exam/paper-sections";
import { formatDuration } from "@/lib/constants";
import { useMascotToast } from "@/components/kids/mascot-toast-provider";
import {
  mascotGradingWaitMessage,
  mascotHalfProgressMessage,
  mascotPlacementSubmitWaitMessage,
  mascotSpeakingDoneMessage,
  mascotStreakMessage,
  mascotTestCompleteMessage,
} from "@/lib/kids/mascot-messages";
import { mascotGamificationCelebration } from "@/lib/gamification/mascot-messages";
import { notifyFreeLimitHit } from "@/lib/promo/events";

interface PaperQuestion {
  id: string;
  type: QuestionType;
  content: unknown;
  audioUrl?: string | null;
  points: number;
  skill?: string;
  title?: string | null;
  correctAnswer?: unknown;
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
  instantFeedback?: boolean;
  /** Đề pool động — câu hỏi load sau startAttempt */
  dynamicPool?: boolean;
  maxWritingWords?: number;
  maxSpeakingWords?: number;
}

const SECTION_EMOJI: Record<string, string> = {
  READING: "📖",
  LISTENING: "🎧",
  USE_OF_ENGLISH: "✏️",
  WRITING: "📝",
  SPEAKING: "🎤",
};

function isAnswered(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) {
    return value.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
  }
  return true;
}

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
  instantFeedback = false,
  dynamicPool = false,
  maxWritingWords,
  maxSpeakingWords,
}: PracticeClientProps) {
  const router = useRouter();
  const { play } = useKidSound();
  const { showMascot, hideMascot } = useMascotToast();
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId ?? null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startedAt] = useState(new Date());
  const correctStreakRef = useRef(0);
  const halfProgressShownRef = useRef(false);
  const lastStreakMilestoneRef = useRef(0);
  const countedPracticeQuestionsRef = useRef<Set<string>>(new Set());
  const [objectiveFeedback, setObjectiveFeedback] = useState<
    Record<string, { isCorrect: boolean }>
  >({});
  const [sessionQuestions, setSessionQuestions] = useState<PaperQuestion[]>(questions);
  const [loadingPool, setLoadingPool] = useState(dynamicPool && !initialAttemptId);

  useEffect(() => {
    setSessionQuestions(questions);
  }, [questions]);

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

    setLoadingPool(dynamicPool);
    startAttemptAction(paperId).then((res) => {
      setLoadingPool(false);
      if (res.attemptId) {
        setAttemptId(res.attemptId);
        if ("questions" in res && Array.isArray(res.questions) && res.questions.length > 0) {
          setSessionQuestions(res.questions as PaperQuestion[]);
        }
        if (res.savedAnswers && Object.keys(res.savedAnswers).length > 0) {
          setAnswers(res.savedAnswers);
          toast.info("Tiếp tục bài làm đang dở");
        }
      } else toast.error(res.error ?? "Không thể bắt đầu bài");
    });
  }, [paperId, initialAttemptId, dynamicPool]);

  useEffect(() => {
    stopAllListeningPlayback();
  }, [currentIndex]);

  const setAnswer = useCallback(
    (questionId: string, value: unknown, question?: PaperQuestion) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value };

        if (instantFeedback && question?.correctAnswer != null) {
          if (question.type === "MCQ" || question.type === "GAP_FILL") {
            const result = gradeObjectiveAnswer(
              question.type,
              question.correctAnswer,
              value
            );
            if (isAnswered(value)) {
              setObjectiveFeedback((fb) => ({
                ...fb,
                [questionId]: { isCorrect: result.isCorrect },
              }));
            }
            if (result.isCorrect) {
              correctStreakRef.current += 1;
              const streak = correctStreakRef.current;
              if (streak >= 5 && streak % 5 === 0 && streak !== lastStreakMilestoneRef.current) {
                lastStreakMilestoneRef.current = streak;
                showMascot(mascotStreakMessage(streak));
              }
            } else {
              correctStreakRef.current = 0;
              lastStreakMilestoneRef.current = 0;
            }
          }
        }

        const answered = sessionQuestions.filter((q) => isAnswered(next[q.id])).length;
        const pct = Math.round((answered / sessionQuestions.length) * 100);
        if (pct >= 50 && !halfProgressShownRef.current) {
          halfProgressShownRef.current = true;
          showMascot(mascotHalfProgressMessage());
        }

        return next;
      });
      play("pop");

      if (paperKind === "PRACTICE" && instantFeedback && questionId) {
        const answeredNow = isAnswered(value);
        if (answeredNow && !countedPracticeQuestionsRef.current.has(questionId)) {
          countedPracticeQuestionsRef.current.add(questionId);
          import("@/lib/actions/subscription").then(({ recordPracticeAnswerAction }) => {
            recordPracticeAnswerAction(1).then((res) => {
              if (res && "error" in res && res.error) {
                toast.error(res.error);
                if (res.error.includes("hết")) notifyFreeLimitHit();
              }
            });
          });
        }
      }

      if (paperKind === "PLACEMENT" && attemptId) {
        import("@/lib/actions/placement").then(({ savePlacementAnswerAction }) => {
          savePlacementAnswerAction(attemptId, questionId, value);
        });
      }
    },
    [play, paperKind, attemptId, instantFeedback, sessionQuestions, showMascot]
  );

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    setSubmitting(true);
    play("celebrate");
    showMascot(
      paperKind === "PLACEMENT" ? mascotPlacementSubmitWaitMessage() : mascotGradingWaitMessage()
    );
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const timeSpent = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const result = await submitAttemptAction(attemptId, answers, timeSpent);

    if (result.error) {
      hideMascot();
      toast.error(result.error);
      setSubmitting(false);
      setShowConfetti(false);
      return;
    }

    if ("alreadySubmitted" in result && result.alreadySubmitted) {
      if (paperKind === "PLACEMENT") {
        router.push(`/placement/results/${attemptId}`);
      } else {
        router.push(`/results/${attemptId}`);
      }
      return;
    }

    const aiQuestions = sessionQuestions.filter(
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
      if (
        !isGuestAttempt &&
        q.type === "SPEAKING_PROMPT" &&
        typeof ans === "string" &&
        ans.trim().length >= 3
      ) {
        try {
          await fetch("/api/ai/grade-speaking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.id,
              attemptId,
              transcript: ans,
            }),
          });
        } catch {
          toast.error("Không thể chấm AI cho speaking");
        }
      }
    }

    setShowConfetti(true);
    toast.success("Tuyệt vời! Nộp bài thành công! 🎉");

    if (result.gamification) {
      showMascot(mascotGamificationCelebration(result.gamification));
    } else if (paperKind !== "PLACEMENT") {
      showMascot(mascotTestCompleteMessage(paperKind));
    }

    if (paperKind === "PLACEMENT") {
      router.push(`/placement/results/${attemptId}`);
      return;
    }

    hideMascot();
    router.refresh();
    router.push(`/results/${attemptId}`);
  }, [attemptId, answers, startedAt, sessionQuestions, router, paperKind, play, showMascot, hideMascot, isGuestAttempt]);

  const current = sessionQuestions[currentIndex];
  const currentSection = sections?.find(
    (s) => currentIndex >= s.startIndex && currentIndex < s.endIndex
  );
  const answeredCount = sessionQuestions.filter((q) => isAnswered(answers[q.id])).length;
  const progressPct = sessionQuestions.length
    ? Math.round((answeredCount / sessionQuestions.length) * 100)
    : 0;
  const strictSequential = isMockTest && paperKind !== "PLACEMENT";
  const useSectionTimer =
    (isMockTest && paperKind === "MOCK_FULL" && !!sections?.length) ||
    (paperKind === "PLACEMENT" && !!sections && sections.length > 1);
  const firstUnansweredIndex = sessionQuestions.findIndex((q) => !isAnswered(answers[q.id]));

  const handleSpeakingTranscript = useCallback(
    async (text: string, question: PaperQuestion) => {
      if (!attemptId) return;

      setAnswer(question.id, text, question);

      if (isGuestAttempt) {
        play("success");
        toast.success("Đã lưu bài nói 🎤");
        return;
      }

      try {
        const res = await fetch("/api/ai/grade-speaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            attemptId,
            transcript: text,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          const msg = err.error ?? "Không thể chấm speaking";
          if (String(msg).toLowerCase().includes("hết")) notifyFreeLimitHit();
          toast.error(`${msg} — câu trả lời đã được lưu.`);
          return;
        }
        play("success");
        showMascot(mascotSpeakingDoneMessage());
        toast.success("Giỏi lắm! Đã gửi bài nói 🎤");
      } catch {
        toast.error("Không thể chấm speaking — câu trả lời đã được lưu.");
      }
    },
    [attemptId, isGuestAttempt, play, setAnswer, showMascot]
  );

  const handleSectionTimeUp = useCallback(() => {
    if (!sections?.length) {
      void handleSubmit();
      return;
    }
    const secIdx = sections.findIndex(
      (s) => currentIndex >= s.startIndex && currentIndex < s.endIndex
    );
    if (secIdx >= 0 && secIdx < sections.length - 1) {
      const next = sections[secIdx + 1];
      toast.info(`Hết giờ ${sections[secIdx].label}. Chuyển sang ${next.label}.`);
      stopAllListeningPlayback();
      play("whoosh");
      setCurrentIndex(next.startIndex);
      return;
    }
    void handleSubmit();
  }, [sections, currentIndex, handleSubmit, play]);

  const goNext = () => {
    stopAllListeningPlayback();
    play("whoosh");
    setCurrentIndex((i) => Math.min(i + 1, sessionQuestions.length - 1));
  };

  const goPrev = () => {
    stopAllListeningPlayback();
    if (useSectionTimer && sections && currentSection) {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        const prevSec = getSectionForIndex(sections, prevIndex);
        if (prevSec && prevSec.startIndex !== currentSection.startIndex) {
          toast.error("Không thể quay lại phần thi trước.");
          return;
        }
      }
    }
    play("click");
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const jumpToQuestion = (index: number) => {
    stopAllListeningPlayback();
    play("click");
    setCurrentIndex(index);
  };

  const jumpToFirstUnanswered = () => {
    if (firstUnansweredIndex >= 0) jumpToQuestion(firstUnansweredIndex);
  };

  return (
    <div
      className="container mx-auto px-4 py-6"
      onPointerDown={() => unlockListeningAudio()}
    >
      <ConfettiBurst active={showConfetti} />

      {paperKind === "PLACEMENT" && (
        <div className="mb-4 animate-bounce-in rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-3 text-sm font-semibold text-sky-900">
          🎯 <strong>Bài test trình độ:</strong> Bạn có thể nhảy tới bất kỳ câu nào trên bản đồ
          để làm hoặc sửa câu đã bỏ qua.
        </div>
      )}
      {paperKind === "PLACEMENT" && useSectionTimer && (
        <div className="mb-4 rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 text-sm font-semibold text-indigo-900">
          📋 <strong>Placement nhiều phần:</strong> Mỗi phần có thời gian riêng (theo format thi
          thật). Hết giờ sẽ chuyển phần tiếp theo.
        </div>
      )}
      {isMockTest && paperKind === "MOCK_FULL" && (
        <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-semibold text-amber-900">
          🏆 <strong>Full mock Cambridge:</strong> Mỗi phần thi có thời gian riêng. Hết giờ phần
          này sẽ chuyển sang phần tiếp theo — không quay lại phần đã qua.
        </div>
      )}
      {isMockTest && paperKind !== "PLACEMENT" && paperKind !== "MOCK_FULL" && (
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
          {useSectionTimer && currentSection?.timeLimit && (
            <p className="mt-1 text-xs font-bold text-amber-800">
              ⏱ Phần này: {formatDuration(currentSection.timeLimit)}
            </p>
          )}
          <p className="text-sm font-semibold text-muted-foreground">
            Câu {currentIndex + 1}/{sessionQuestions.length || "…"} · Đã trả lời {answeredCount} câu
          </p>
          <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <ExamTimer
          key={useSectionTimer ? `sec-${currentSection?.startIndex ?? 0}` : "global"}
          timeLimit={useSectionTimer ? currentSection?.timeLimit : timeLimit}
          onTimeUp={useSectionTimer ? handleSectionTimeUp : handleSubmit}
          startedAt={useSectionTimer ? undefined : startedAt}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border-2 border-purple-200 bg-white/90 p-4 shadow-md backdrop-blur-sm">
            <p className="mb-3 text-sm font-extrabold text-purple-700">🗺️ Bản đồ câu hỏi</p>
            {paperKind === "PLACEMENT" && firstUnansweredIndex >= 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mb-3 w-full rounded-full border-amber-300 text-amber-900"
                onClick={jumpToFirstUnanswered}
              >
                ↩ Câu chưa làm ({sessionQuestions.length - answeredCount})
              </Button>
            )}
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
              {sessionQuestions.map((q, i) => {
                const sec = sections?.find((s) => i >= s.startIndex && i < s.endIndex);
                const answered = isAnswered(answers[q.id]);
                return (
                  <button
                    key={q.id}
                    type="button"
                    title={sec?.label}
                    onClick={() => {
                      if (!strictSequential) jumpToQuestion(i);
                    }}
                    disabled={strictSequential && i !== currentIndex}
                    className={`h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                      i === currentIndex
                        ? "scale-110 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
                        : answered
                          ? "bg-mint-200 text-mint-900 ring-2 ring-mint-400"
                          : "bg-amber-50 text-amber-900 ring-2 ring-amber-300 hover:bg-amber-100"
                    } ${strictSequential && i !== currentIndex ? "cursor-not-allowed opacity-50" : "hover:scale-105"}`}
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
          {loadingPool || (dynamicPool && sessionQuestions.length === 0) ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border-2 border-purple-200 bg-white p-8 text-center">
              <p className="font-semibold text-purple-800">Đang chọn câu hỏi ngẫu nhiên cho bạn…</p>
            </div>
          ) : (
            current && (
            <div className="animate-bounce-in" key={current.id}>
              <QuestionRenderer
                question={current}
                index={currentIndex}
                value={answers[current.id]}
                onChange={(v) => setAnswer(current.id, v, current)}
                isListening={(current?.skill ?? currentSection?.skill) === "LISTENING"}
                hideSpeakingScript={paperKind !== "PRACTICE"}
                onSpeakingTranscript={(text) => handleSpeakingTranscript(text, current)}
                disabled={submitting}
                maxWritingWords={maxWritingWords}
                maxSpeakingWords={maxSpeakingWords}
              />
              {instantFeedback && objectiveFeedback[current.id]?.isCorrect === false && (
                <>
                  {formatExplanationForStudent(
                    current.content,
                    answers[current.id],
                    current.correctAnswer
                  ) ? (
                    <QuestionExplanationPanel
                      className="mt-4"
                      content={current.content}
                      studentAnswer={answers[current.id]}
                      correctAnswer={current.correctAnswer}
                    />
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Chưa có lời giải cho câu này — xem đáp án sau khi nộp bài.
                    </p>
                  )}
                </>
              )}
            </div>
            )
          )}

          {!loadingPool && sessionQuestions.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <Button
              variant="outline"
              disabled={currentIndex === 0 || strictSequential}
              onClick={goPrev}
            >
              ← Câu trước
            </Button>
            {paperKind === "PLACEMENT" && firstUnansweredIndex >= 0 && (
              <Button variant="secondary" onClick={jumpToFirstUnanswered}>
                ↩ Câu chưa làm
              </Button>
            )}
            <Button
              variant="fun"
              disabled={currentIndex >= sessionQuestions.length - 1}
              onClick={goNext}
            >
              Câu sau →
            </Button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
