"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WritingFeedbackView } from "@/components/ai/writing-feedback";
import { SpeakingFeedbackView } from "@/components/ai/speaking-feedback";
import type { WritingFeedback, SpeakingFeedback } from "@/lib/ai/schemas";
import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { useMascotToast } from "@/components/kids/mascot-toast-provider";
import { mascotScoreMessage } from "@/lib/kids/mascot-messages";
import {
  mascotGamificationCelebration,
  mascotLessonCompleteMessage,
} from "@/lib/gamification/mascot-messages";
import { GamificationCelebrationCard } from "@/components/gamification/gamification-celebration-card";
import type { GamificationSnapshot } from "@/lib/gamification/types";
import { QuestionExplanationPanel } from "@/components/exam/question-explanation-panel";
import {
  formatCorrectAnswerDisplay,
  formatExplanationForStudent,
  hasStoredExplanation,
} from "@/lib/exam/question-explanation";

interface ResultAnswer {
  id: string;
  answer: unknown;
  isCorrect: boolean | null;
  score: number | null;
  question: {
    id: string;
    type: QuestionType;
    content: unknown;
    correctAnswer: unknown;
    points: number;
    skill: string;
  };
}

interface AIFeedbackItem {
  id: string;
  feedbackType: string;
  inputText: string;
  transcript: string | null;
  overallScore: number | null;
  cambridgeBand: string | null;
  criteria: unknown;
  errors: unknown;
  suggestions: unknown;
  improvedVersion: string | null;
  questionId: string | null;
  rawResponse: unknown;
}

interface ResultsClientProps {
  attempt: {
    id: string;
    score: number | null;
    maxScore: number | null;
    status: string;
    timeSpent: number | null;
    paper: { title: string; skill: string; level: string; paperKind?: string };
    answers: ResultAnswer[];
  };
  aiFeedbacks: AIFeedbackItem[];
  gamification?: GamificationSnapshot | null;
}

function hideObjectiveResultDetails(paper: {
  paperKind?: string;
  skill: string;
}): boolean {
  return (
    paper.paperKind === "PRACTICE" &&
    (paper.skill === "READING" || paper.skill === "LISTENING")
  );
}

export function ResultsClient({ attempt, aiFeedbacks, gamification }: ResultsClientProps) {
  const { showMascot } = useMascotToast();
  const mascotShownRef = useRef(false);

  const pct =
    attempt.score !== null && attempt.maxScore
      ? Math.round((attempt.score / attempt.maxScore) * 100)
      : null;

  const compactResults = hideObjectiveResultDetails(attempt.paper);

  useEffect(() => {
    if (mascotShownRef.current) return;
    mascotShownRef.current = true;

    const paperKind = attempt.paper.paperKind;

    if (gamification) {
      showMascot(mascotLessonCompleteMessage(paperKind));
      const t = setTimeout(() => {
        showMascot(mascotGamificationCelebration(gamification));
      }, 3200);
      if (pct !== null) {
        setTimeout(() => {
          const msg = mascotScoreMessage(pct);
          if (msg) showMascot(msg);
        }, gamification.levelUp || gamification.unlockedAchievements.length ? 9000 : 6500);
      }
      return () => clearTimeout(t);
    }

    if (pct !== null) {
      const msg = mascotScoreMessage(pct);
      if (msg) showMascot(msg);
      return;
    }

    if (attempt.status === "GRADED" || attempt.status === "SUBMITTED") {
      showMascot(mascotLessonCompleteMessage(paperKind));
    }
  }, [pct, showMascot, gamification, attempt.status, attempt.paper.paperKind]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-cambridge-600 hover:underline">
          ← Dashboard
        </Link>
        {attempt.paper.title.includes("IELTS Speaking") && (
          <Link href="/ielts/speaking" className="ml-4 text-sm text-rose-600 hover:underline">
            ← Speaking IELTS
          </Link>
        )}
        <h1 className="mt-2 text-3xl font-bold">{attempt.paper.title}</h1>
        <p className="text-muted-foreground">Kết quả bài làm</p>
      </div>

      {gamification && <GamificationCelebrationCard snapshot={gamification} />}

      <Card className="mb-8">
        <CardContent className="flex flex-wrap items-center gap-6 pt-6">
          {pct !== null ? (
            <div className="text-center">
              <p className="text-4xl font-bold text-cambridge-700">{pct}%</p>
              <p className="text-sm text-muted-foreground">
                {attempt.score}/{attempt.maxScore} điểm
              </p>
            </div>
          ) : (
            <Badge variant="outline">Đang chờ chấm AI</Badge>
          )}
          {attempt.timeSpent && (
            <p className="text-sm text-muted-foreground">
              Thời gian: {Math.floor(attempt.timeSpent / 60)} phút {attempt.timeSpent % 60}s
            </p>
          )}
          <Badge variant={pct !== null && pct >= 60 ? "success" : "secondary"}>
            {attempt.status}
          </Badge>
        </CardContent>
      </Card>

      {compactResults ? (
        <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50/60 to-white">
          <CardContent className="space-y-4 pt-6">
            <p className="text-base font-semibold leading-relaxed text-sky-950">
              Bạn đã xem đáp án và giải thích ngay khi làm bài. Dưới đây là điểm tổng — quay lại
              luyện thêm để cải thiện nhé!
            </p>
            <Link
              href="/exams"
              className="inline-flex font-bold text-purple-600 underline hover:text-purple-800"
            >
              ← Chọn level luyện tập
            </Link>
          </CardContent>
        </Card>
      ) : (
      <div className="space-y-6">
        {attempt.answers.map((answer, i) => {
          const aiFb = aiFeedbacks.find((f) => f.questionId === answer.question.id);
          const content = answer.question.content as {
            question?: string;
            taskPrompt?: string;
            prompt?: string;
          };
          const storedExplanation =
            answer.isCorrect === false &&
            (answer.question.type === "MCQ" || answer.question.type === "GAP_FILL")
              ? formatExplanationForStudent(
                  answer.question.content,
                  answer.answer,
                  answer.question.correctAnswer
                )
              : null;

          return (
            <Card key={answer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Câu {i + 1}</CardTitle>
                  {answer.isCorrect !== null && (
                    <Badge variant={answer.isCorrect ? "success" : "danger"}>
                      {answer.isCorrect ? "Đúng" : "Sai"}
                      {answer.score !== null && ` · ${answer.score}/${answer.question.points}`}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(content.question || content.taskPrompt || content.prompt) && (
                  <p className="text-sm text-muted-foreground">
                    {content.question ?? content.taskPrompt ?? content.prompt}
                  </p>
                )}

                {answer.question.type === "FREE_TEXT" && aiFb?.criteria ? (
                  <WritingFeedbackView
                    feedback={{
                      overallScore: aiFb.overallScore ?? 0,
                      cambridgeBand: aiFb.cambridgeBand ?? "",
                      criteria: aiFb.criteria as WritingFeedback["criteria"],
                      errors: (aiFb.errors as WritingFeedback["errors"]) ?? [],
                      improvedVersion: aiFb.improvedVersion ?? "",
                      tips_vi: (aiFb.suggestions as string[]) ?? [],
                      summary_vi:
                        (aiFb.rawResponse as { summary_vi?: string })?.summary_vi ?? "",
                    }}
                    studentAnswer={aiFb.inputText}
                  />
                ) : answer.question.type === "SPEAKING_PROMPT" && aiFb?.criteria ? (
                  <SpeakingFeedbackView
                    variant={
                      (content as { examTrack?: string }).examTrack === "IELTS"
                        ? "ielts"
                        : "cambridge"
                    }
                    feedback={{
                      overallScore: aiFb.overallScore ?? 0,
                      cambridgeBand: aiFb.cambridgeBand ?? "",
                      criteria: aiFb.criteria as SpeakingFeedback["criteria"],
                      errors: (aiFb.errors as SpeakingFeedback["errors"]) ?? [],
                      tips_vi: (aiFb.suggestions as string[]) ?? [],
                      summary_vi:
                        (aiFb.rawResponse as { summary_vi?: string; weakPartPractice?: string })
                          ?.summary_vi ?? "",
                      weakPartPractice: (
                        aiFb.rawResponse as { weakPartPractice?: string }
                      )?.weakPartPractice,
                    }}
                    transcript={aiFb.transcript ?? aiFb.inputText}
                  />
                ) : (
                  <>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                      <strong>Trả lời:</strong> {JSON.stringify(answer.answer)}
                    </div>
                    {answer.isCorrect === false && (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Đáp án đúng:</strong>{" "}
                          {formatCorrectAnswerDisplay(
                            answer.question.type,
                            answer.question.correctAnswer
                          )}
                        </p>
                        {storedExplanation ? (
                          <QuestionExplanationPanel
                            content={answer.question.content}
                            studentAnswer={answer.answer}
                            correctAnswer={answer.question.correctAnswer}
                          />
                        ) : (
                          answer.question.type !== "FREE_TEXT" &&
                          answer.question.type !== "SPEAKING_PROMPT" &&
                          !hasStoredExplanation(answer.question.content) && (
                            <p className="text-sm text-muted-foreground">
                              Chưa có lời giải chi tiết cho câu này trong ngân hàng đề (đáp án
                              đúng đã hiển thị ở trên).
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
