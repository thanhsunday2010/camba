"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  finalizeAttemptGradingAction,
  swapPracticeQuestionAction,
  startAttemptAction,
  submitAttemptAction,
} from "@/lib/actions/exam";
import { supportsQuestionSwap } from "@/lib/exam/swap-practice-question";
import { isReadingPassageSession } from "@/lib/exam/reading-passage-ui";
import { ReadingPassagePractice } from "@/components/exam/reading-passage-practice";
import { QuestionType, PaperKind } from "@prisma/client";
import { Shuffle } from "lucide-react";
import { getSectionForIndex, type PaperSection } from "@/lib/exam/paper-sections";
import { formatDuration } from "@/lib/constants";
import { useMascotToast } from "@/components/kids/mascot-toast-provider";
import {
  mascotGradingWaitMessage,
  mascotPlacementSubmitWaitMessage,
  mascotSpeakingDoneMessage,
  mascotStreakMessage,
  mascotTestCompleteMessage,
} from "@/lib/kids/mascot-messages";
import { mascotGamificationCelebration } from "@/lib/gamification/mascot-messages";
import { notifyFreeLimitHit } from "@/lib/promo/events";
import { gradeObjectiveAnswer } from "@/lib/exam/scoring";
import type { GapFillContent } from "@/lib/exam/scoring";
import {
  formatCorrectAnswerDisplay,
  formatExplanationForStudent,
} from "@/lib/exam/question-explanation";
import type { ObjectiveFeedback } from "@/components/exam/practice-objective-feedback";
import {
  getPracticeMinWords,
  meetsPracticeMinWords,
  practiceMinWordsMessage,
  type PracticeMinWordsContext,
} from "@/lib/exam/practice-min-words";
import { IeltsModuleBadge } from "@/components/ielts/ielts-module-badge";
import type { IeltsModule } from "@/lib/exam/ielts-module";

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
  /** Đề pool động — câu hỏi load sau startAttempt */
  dynamicPool?: boolean;
  maxSpeakingWords?: number;
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
  /** Writing/Speaking hub: 1 câu + AI chấm ngay */
  partAiPractice?: boolean;
  ieltsModule?: IeltsModule;
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

function usesInstantObjectiveFeedback(
  paperKind: string | undefined,
  question: PaperQuestion
): boolean {
  if (paperKind !== "PRACTICE") return false;
  if (question.skill !== "READING" && question.skill !== "LISTENING") return false;
  return question.type === "MCQ" || question.type === "GAP_FILL";
}

function isGapFillComplete(value: unknown, blanks: number): boolean {
  if (!Array.isArray(value)) return false;
  return Array.from({ length: blanks }).every(
    (_, i) => String(value[i] ?? "").trim() !== ""
  );
}

function buildObjectiveFeedback(
  paperKind: string | undefined,
  question: PaperQuestion,
  value: unknown
): ObjectiveFeedback | null {
  if (!usesInstantObjectiveFeedback(paperKind, question)) return null;
  if (question.correctAnswer == null) return null;

  if (question.type === "GAP_FILL") {
    const blanks = (question.content as GapFillContent).blanks;
    if (!isGapFillComplete(value, blanks)) return null;
  } else if (question.type === "MCQ") {
    if (!isAnswered(value)) return null;
  }

  const { isCorrect } = gradeObjectiveAnswer(
    question.type,
    question.correctAnswer,
    value
  );

  return {
    isCorrect,
    correctDisplay: formatCorrectAnswerDisplay(question.type, question.correctAnswer),
    explanation: formatExplanationForStudent(
      question.content,
      value,
      question.correctAnswer
    ),
  };
}

function isReadingListeningPractice(
  paperKind: string | undefined,
  questions: PaperQuestion[]
): boolean {
  return (
    paperKind === "PRACTICE" &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        (q.skill === "READING" || q.skill === "LISTENING") &&
        (q.type === "MCQ" || q.type === "GAP_FILL")
    )
  );
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
  dynamicPool = false,
  maxSpeakingWords,
  practicePoolKey = null,
  mockPoolKey = null,
  partAiPractice = false,
  ieltsModule,
}: PracticeClientProps) {
  const router = useRouter();
  const { play } = useKidSound();
  const { showMascot, hideMascot } = useMascotToast();
  const minWordsContext = useMemo<PracticeMinWordsContext>(
    () => ({ paperTitle, practicePoolKey, mockPoolKey }),
    [paperTitle, practicePoolKey, mockPoolKey]
  );
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId ?? null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startedAt] = useState(new Date());
  const consecutiveCorrectRef = useRef(0);
  const countedPracticeQuestionsRef = useRef<Set<string>>(new Set());
  const speakingGradedIdsRef = useRef<Set<string>>(new Set());
  const seenQuestionIdsRef = useRef<Set<string>>(new Set());
  const [sessionQuestions, setSessionQuestions] = useState<PaperQuestion[]>(questions);
  const [loadingPool, setLoadingPool] = useState(dynamicPool && !initialAttemptId);
  const [objectiveFeedback, setObjectiveFeedback] = useState<
    Record<string, ObjectiveFeedback>
  >({});
  const [swappingQuestion, setSwappingQuestion] = useState(false);

  const readingListeningPractice = isReadingListeningPractice(paperKind, sessionQuestions);
  const readingPassagePractice = isReadingPassageSession(paperKind, sessionQuestions);

  useEffect(() => {
    seenQuestionIdsRef.current = new Set();
  }, [paperId]);

  useEffect(() => {
    setSessionQuestions(questions);
  }, [questions]);

  useEffect(() => {
    for (const q of sessionQuestions) {
      seenQuestionIdsRef.current.add(q.id);
    }
  }, [sessionQuestions]);

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
        return next;
      });

      const q = question ?? sessionQuestions.find((item) => item.id === questionId);
      const instant = q ? buildObjectiveFeedback(paperKind, q, value) : null;

      if (instant && !objectiveFeedback[questionId]) {
        setObjectiveFeedback((prev) => ({ ...prev, [questionId]: instant }));
        play(instant.isCorrect ? "answerCorrect" : "answerWrong");
        if (instant.isCorrect) {
          consecutiveCorrectRef.current += 1;
          if (consecutiveCorrectRef.current === 5) {
            showMascot(mascotStreakMessage(5));
          }
        } else {
          consecutiveCorrectRef.current = 0;
        }
      } else if (
        q &&
        q.type !== "FREE_TEXT" &&
        !usesInstantObjectiveFeedback(paperKind, q)
      ) {
        play("pop");
      }

      if (paperKind === "PRACTICE" && !partAiPractice && questionId) {
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
    [play, paperKind, attemptId, sessionQuestions, showMascot, objectiveFeedback, partAiPractice]
  );

  const validateMinWordsForQuestion = useCallback(
    (question: PaperQuestion): boolean => {
      if (meetsPracticeMinWords(question.type, question.content, answers[question.id], minWordsContext)) {
        return true;
      }
      toast.error(practiceMinWordsMessage(question.type, question.content, minWordsContext));
      return false;
    },
    [answers, minWordsContext]
  );

  const handleSubmit = useCallback(async (answerOverride?: Record<string, unknown>) => {
    if (!attemptId) return;
    const mergedAnswers = answerOverride ? { ...answers, ...answerOverride } : answers;
    const activeQuestion = sessionQuestions[currentIndex];
    if (
      activeQuestion &&
      !meetsPracticeMinWords(
        activeQuestion.type,
        activeQuestion.content,
        mergedAnswers[activeQuestion.id],
        minWordsContext
      )
    ) {
      toast.error(
        practiceMinWordsMessage(activeQuestion.type, activeQuestion.content, minWordsContext)
      );
      return;
    }
    if (
      !sessionQuestions.every((q) => {
        if (
          (q.type !== "FREE_TEXT" && q.type !== "SPEAKING_PROMPT") ||
          !isAnswered(mergedAnswers[q.id])
        ) {
          return true;
        }
        return meetsPracticeMinWords(q.type, q.content, mergedAnswers[q.id], minWordsContext);
      })
    ) {
      const bad = sessionQuestions.find(
        (q) =>
          (q.type === "FREE_TEXT" || q.type === "SPEAKING_PROMPT") &&
          isAnswered(mergedAnswers[q.id]) &&
          !meetsPracticeMinWords(q.type, q.content, mergedAnswers[q.id], minWordsContext)
      );
      if (bad) {
        toast.error(practiceMinWordsMessage(bad.type, bad.content, minWordsContext));
        return;
      }
    }

    setSubmitting(true);
    play("celebrate");
    showMascot(
      paperKind === "PLACEMENT" ? mascotPlacementSubmitWaitMessage() : mascotGradingWaitMessage()
    );
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const timeSpent = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const result = await submitAttemptAction(attemptId, mergedAnswers, timeSpent);

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

    let writingGradeFailed = false;

    for (const q of aiQuestions) {
      const ans = mergedAnswers[q.id];
      if (
        q.type === "FREE_TEXT" &&
        typeof ans === "string" &&
        meetsPracticeMinWords(q.type, q.content, ans, minWordsContext)
      ) {
        try {
          const res = await fetch("/api/ai/grade-writing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.id,
              attemptId,
              studentAnswer: ans,
            }),
          });
          if (!res.ok) {
            writingGradeFailed = true;
            const err = (await res.json().catch(() => ({}))) as { error?: string };
            const msg = err.error ?? "Không thể chấm AI cho writing";
            if (String(msg).toLowerCase().includes("hết")) notifyFreeLimitHit();
            toast.error(msg);
          }
        } catch {
          writingGradeFailed = true;
          toast.error("Không thể chấm AI cho writing");
        }
      }
      if (
        !isGuestAttempt &&
        q.type === "SPEAKING_PROMPT" &&
        typeof ans === "string" &&
        meetsPracticeMinWords(q.type, q.content, ans, minWordsContext) &&
        !speakingGradedIdsRef.current.has(q.id)
      ) {
        try {
          const res = await fetch("/api/ai/grade-speaking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.id,
              attemptId,
              transcript: ans,
            }),
          });
          if (!res.ok) {
            const err = (await res.json().catch(() => ({}))) as { error?: string };
            toast.error(err.error ?? "Không thể chấm AI cho speaking");
          }
        } catch {
          toast.error("Không thể chấm AI cho speaking");
        }
      }
    }

    if (aiQuestions.length > 0) {
      await finalizeAttemptGradingAction(attemptId);
    }

    setShowConfetti(true);
    toast.success(
      writingGradeFailed
        ? "Đã nộp bài — AI chấm writing thất bại, xem thông báo lỗi ở trên."
        : "Tuyệt vời! Nộp bài thành công! 🎉"
    );

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
  }, [attemptId, answers, startedAt, sessionQuestions, currentIndex, router, paperKind, play, showMascot, hideMascot, isGuestAttempt, minWordsContext]);

  const current = sessionQuestions[currentIndex];
  const isPartAiPracticeUi = partAiPractice && paperKind === "PRACTICE";
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
    (isMockTest && paperKind === "MOCK_SKILL" && !!sections?.length) ||
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
        speakingGradedIdsRef.current.add(question.id);
        if (partAiPractice && sessionQuestions.length === 1 && !submitting) {
          void handleSubmit({ [question.id]: text });
        }
      } catch {
        toast.error("Không thể chấm speaking — câu trả lời đã được lưu.");
      }
    },
    [attemptId, isGuestAttempt, play, setAnswer, showMascot, partAiPractice, sessionQuestions, submitting, handleSubmit]
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
    if (current && !validateMinWordsForQuestion(current)) return;
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
    if (current && index !== currentIndex && !validateMinWordsForQuestion(current)) return;
    stopAllListeningPlayback();
    play("click");
    setCurrentIndex(index);
  };

  const jumpToFirstUnanswered = () => {
    if (firstUnansweredIndex >= 0) jumpToQuestion(firstUnansweredIndex);
  };

  const handleSwapQuestion = useCallback(async () => {
    if (!attemptId || !current || swappingQuestion || submitting) return;

    setSwappingQuestion(true);
    stopAllListeningPlayback();
    play("whoosh");

    const res = await swapPracticeQuestionAction(
      attemptId,
      current.id,
      Array.from(seenQuestionIdsRef.current)
    );

    setSwappingQuestion(false);

    if ("error" in res && res.error) {
      toast.error(res.error);
      return;
    }

    if (!("question" in res) || !res.question) return;

    const newQuestion = res.question as PaperQuestion;
    const oldId = current.id;
    seenQuestionIdsRef.current.add(oldId);
    seenQuestionIdsRef.current.add(newQuestion.id);

    setSessionQuestions((prev) =>
      prev.map((q) => (q.id === oldId ? newQuestion : q))
    );
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[oldId];
      return next;
    });
    setObjectiveFeedback((prev) => {
      const next = { ...prev };
      delete next[oldId];
      return next;
    });
    countedPracticeQuestionsRef.current.delete(oldId);
    speakingGradedIdsRef.current.delete(oldId);

    toast.success("Đã đổi sang câu khác");
  }, [attemptId, current, swappingQuestion, submitting, play]);

  const showSwapQuestionButton =
    !loadingPool &&
    !!current &&
    !!paperKind &&
    !readingPassagePractice &&
    supportsQuestionSwap(paperKind as PaperKind);

  return (
    <div
      className="container mx-auto px-4 py-6"
      onPointerDown={() => unlockListeningAudio()}
    >
      <ConfettiBurst active={showConfetti} />

      {readingPassagePractice && (
        <div className="mb-4 animate-bounce-in rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-sky-50 px-4 py-3 text-sm font-semibold text-indigo-900">
          📖 <strong>Reading theo đoạn văn:</strong> Một đoạn văn · nhiều câu hỏi (format đề thi).
          Chọn đáp án để biết ngay đúng/sai và xem giải thích.
        </div>
      )}
      {readingListeningPractice && !readingPassagePractice && (
        <div className="mb-4 animate-bounce-in rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-sky-50 to-emerald-50 px-4 py-3 text-sm font-semibold text-sky-900">
          ⚡ <strong>Luyện tập tương tác:</strong> Chọn đáp án để biết ngay đúng/sai, nghe âm thanh
          vui nhộn và xem giải thích tại chỗ. Trang kết quả chỉ hiển thị điểm tổng.
        </div>
      )}
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
      {isPartAiPracticeUi && (
        <div className="mb-4 animate-bounce-in rounded-2xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-4 py-3 text-sm font-semibold text-violet-900">
          ✨ <strong>Luyện 1 câu:</strong> Làm xong và nộp — AI chấm sửa ngay (tính 1 lượt AI
          chấm).
        </div>
      )}
      {isMockTest && paperKind !== "PLACEMENT" && paperKind !== "MOCK_FULL" && !isPartAiPracticeUi && (
        <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-semibold text-amber-900">
          ⏰ <strong>Chế độ thi thử:</strong> Làm tuần tự từng câu nhé!
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold kid-gradient-text">{paperTitle}</h1>
            {ieltsModule && <IeltsModuleBadge module={ieltsModule} size="sm" />}
          </div>
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
          {!isPartAiPracticeUi && !readingPassagePractice && (
            <p className="text-sm font-semibold text-muted-foreground">
              Câu {currentIndex + 1}/{sessionQuestions.length || "…"} · Đã trả lời {answeredCount} câu
            </p>
          )}
          {readingPassagePractice && (
            <p className="text-sm font-semibold text-muted-foreground">
              {sessionQuestions.length} câu · Đã trả lời {answeredCount} câu
            </p>
          )}
          {!isPartAiPracticeUi && !readingPassagePractice && (
          <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          )}
        </div>
        <ExamTimer
          key={useSectionTimer ? `sec-${currentSection?.startIndex ?? 0}` : "global"}
          timeLimit={useSectionTimer ? currentSection?.timeLimit : timeLimit}
          onTimeUp={useSectionTimer ? handleSectionTimeUp : () => void handleSubmit()}
          startedAt={useSectionTimer ? undefined : startedAt}
        />
      </div>

      <div className={isPartAiPracticeUi || readingPassagePractice ? "max-w-6xl mx-auto" : "grid gap-6 lg:grid-cols-4"}>
        {!isPartAiPracticeUi && !readingPassagePractice && (
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
                const fb = objectiveFeedback[q.id];
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
                        : fb
                          ? fb.isCorrect
                            ? "bg-emerald-200 text-emerald-900 ring-2 ring-emerald-400"
                            : "bg-rose-200 text-rose-900 ring-2 ring-rose-400"
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
              onClick={() => void handleSubmit()}
              disabled={submitting || !attemptId}
            >
              {submitting ? "Đang nộp..." : "🎉 Nộp bài"}
            </Button>
          </div>
        </aside>
        )}

        <div className={isPartAiPracticeUi || readingPassagePractice ? "" : "lg:col-span-3"}>
          {loadingPool || (dynamicPool && sessionQuestions.length === 0) ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border-2 border-purple-200 bg-white p-8 text-center">
              <p className="font-semibold text-purple-800">Đang chọn câu hỏi ngẫu nhiên cho bạn…</p>
            </div>
          ) : readingPassagePractice ? (
            <ReadingPassagePractice
              questions={sessionQuestions}
              answers={answers}
              objectiveFeedback={objectiveFeedback}
              onAnswer={(questionId, value, question) => setAnswer(questionId, value, question)}
              submitting={submitting}
              attemptReady={!!attemptId}
              onSubmit={() => void handleSubmit()}
              minWordsContext={minWordsContext}
            />
          ) : (
            current && (
            <div className="animate-bounce-in" key={current.id}>
              {showSwapQuestionButton && (
                <div className="mb-3 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-violet-300 text-violet-800 hover:bg-violet-50"
                    disabled={swappingQuestion || submitting || !attemptId}
                    onClick={() => void handleSwapQuestion()}
                  >
                    <Shuffle className="mr-1.5 size-4" />
                    {swappingQuestion ? "Đang đổi..." : "Đổi câu khác"}
                  </Button>
                </div>
              )}
              <QuestionRenderer
                question={current}
                index={currentIndex}
                value={answers[current.id]}
                onChange={(v) => setAnswer(current.id, v, current)}
                isListening={(current?.skill ?? currentSection?.skill) === "LISTENING"}
                onSpeakingTranscript={(text) => handleSpeakingTranscript(text, current)}
                disabled={submitting}
                maxSpeakingWords={maxSpeakingWords}
                objectiveFeedback={objectiveFeedback[current.id] ?? null}
                lockObjectiveAnswer={!!objectiveFeedback[current.id]}
                practiceMinWords={getPracticeMinWords(current.type, current.content, minWordsContext)}
              />
            </div>
            )
          )}

          {!loadingPool && sessionQuestions.length > 0 && !readingPassagePractice && (
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            {!isPartAiPracticeUi && (
            <Button
              variant="outline"
              disabled={currentIndex === 0 || strictSequential}
              onClick={goPrev}
            >
              ← Câu trước
            </Button>
            )}
            {paperKind === "PLACEMENT" && firstUnansweredIndex >= 0 && !isPartAiPracticeUi && (
              <Button variant="secondary" onClick={jumpToFirstUnanswered}>
                ↩ Câu chưa làm
              </Button>
            )}
            <Button
              variant="fun"
              className={
                isPartAiPracticeUi || currentIndex >= sessionQuestions.length - 1
                  ? "kid-btn-fun ml-auto"
                  : undefined
              }
              disabled={
                isPartAiPracticeUi || currentIndex >= sessionQuestions.length - 1
                  ? submitting || !attemptId
                  : false
              }
              onClick={
                isPartAiPracticeUi || currentIndex >= sessionQuestions.length - 1
                  ? () => void handleSubmit()
                  : goNext
              }
            >
              {isPartAiPracticeUi || currentIndex >= sessionQuestions.length - 1
                ? submitting
                  ? "Đang chấm AI..."
                  : "🎉 Nộp bài & chấm AI"
                : "Câu sau →"}
            </Button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
