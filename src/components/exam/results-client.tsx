"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { notifyFreeLimitHit } from "@/lib/promo/events";
import {
  EXPLAIN_AI_SKILLS,
  paperSkillToAiGradingSkill,
} from "@/lib/subscription/plans";

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

export function ResultsClient({ attempt, aiFeedbacks, gamification }: ResultsClientProps) {
  const [explaining, setExplaining] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const { showMascot } = useMascotToast();
  const mascotShownRef = useRef(false);

  const pct =
    attempt.score !== null && attempt.maxScore
      ? Math.round((attempt.score / attempt.maxScore) * 100)
      : null;

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
          showMascot(mascotScoreMessage(pct));
        }, gamification.levelUp || gamification.unlockedAchievements.length ? 9000 : 6500);
      }
      return () => clearTimeout(t);
    }

    if (pct !== null) {
      showMascot(mascotScoreMessage(pct));
      return;
    }

    if (attempt.status === "GRADED" || attempt.status === "SUBMITTED") {
      showMascot(mascotLessonCompleteMessage(paperKind));
    }
  }, [pct, showMascot, gamification, attempt.status, attempt.paper.paperKind]);

  async function explainAnswer(answer: ResultAnswer) {
    const content = answer.question.content as {
      question?: string;
      passage?: string;
      transcript?: string;
    };
    const contextParts: string[] = [];
    if (content.passage?.trim()) contextParts.push(`Đoạn đọc: ${content.passage.trim()}`);
    if (content.transcript?.trim()) contextParts.push(`Transcript: ${content.transcript.trim()}`);
    if (content.question?.trim()) contextParts.push(`Câu hỏi: ${content.question.trim()}`);
    const questionContext = contextParts.join("\n") || "Question";

    setExplaining(answer.id);
    try {
      const res = await fetch("/api/ai/explain-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionContext,
          correctAnswer: JSON.stringify(answer.question.correctAnswer),
          studentAnswer: JSON.stringify(answer.answer),
          paperSkill: answer.question.skill ?? attempt.paper.skill,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error ?? "Không thể giải thích câu này";
        toast.error(errMsg);
        if (String(errMsg).toLowerCase().includes("hết")) notifyFreeLimitHit();
        return;
      }
      setExplanations((prev) => ({ ...prev, [answer.id]: data.explanation }));
    } catch {
      toast.error("Lỗi kết nối khi gọi AI");
    } finally {
      setExplaining(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-cambridge-600 hover:underline">
          ← Dashboard
        </Link>
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

      <div className="space-y-6">
        {attempt.answers.map((answer, i) => {
          const aiFb = aiFeedbacks.find((f) => f.questionId === answer.question.id);
          const content = answer.question.content as { question?: string; taskPrompt?: string; prompt?: string };

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
                    feedback={{
                      overallScore: aiFb.overallScore ?? 0,
                      cambridgeBand: aiFb.cambridgeBand ?? "",
                      criteria: aiFb.criteria as SpeakingFeedback["criteria"],
                      errors: (aiFb.errors as SpeakingFeedback["errors"]) ?? [],
                      tips_vi: (aiFb.suggestions as string[]) ?? [],
                      summary_vi:
                        (aiFb.rawResponse as { summary_vi?: string })?.summary_vi ?? "",
                    }}
                    transcript={aiFb.transcript ?? aiFb.inputText}
                  />
                ) : (
                  <>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                      <strong>Trả lời:</strong> {JSON.stringify(answer.answer)}
                    </div>
                    {answer.isCorrect === false &&
                      EXPLAIN_AI_SKILLS.includes(
                        paperSkillToAiGradingSkill(
                          answer.question.skill ?? attempt.paper.skill
                        ) as (typeof EXPLAIN_AI_SKILLS)[number]
                      ) && (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Đáp án đúng:</strong>{" "}
                          {JSON.stringify(answer.question.correctAnswer)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => explainAnswer(answer)}
                          disabled={explaining === answer.id}
                        >
                          {explaining === answer.id ? "Đang giải thích..." : "AI Camba giải thích"}
                        </Button>
                        {explanations[answer.id] && (
                          <p className="whitespace-pre-line rounded-lg border bg-blue-50 p-3 text-sm leading-relaxed">
                            {explanations[answer.id]}
                          </p>
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
    </div>
  );
}
