"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SpeakingFeedback } from "@/lib/ai/schemas";
import { VTEN_COURSE_LABEL, VTEN_COURSE_URL } from "@/lib/site/vten-course";

interface SpeakingFeedbackViewProps {
  feedback: SpeakingFeedback;
  transcript: string;
  variant?: "cambridge" | "ielts";
}

export function SpeakingFeedbackView({
  feedback,
  transcript,
  variant = "cambridge",
}: SpeakingFeedbackViewProps) {
  const isIelts = variant === "ielts";

  const criteriaLabels: Record<string, string> = isIelts
    ? {
        fluency: "Fluency & Coherence",
        vocabulary: "Lexical Resource",
        grammar: "Grammatical Range",
        pronunciation: "Pronunciation",
        taskAchievement: "Task Response",
      }
    : {
        fluency: "Fluency",
        pronunciation: "Pronunciation",
        grammar: "Grammar",
        vocabulary: "Vocabulary",
        taskAchievement: "Task Achievement",
      };

  const weakPart = feedback.weakPartPractice;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {isIelts ? (
          <div className="text-center">
            <p className="text-3xl font-bold text-cambridge-700">Band {feedback.cambridgeBand}</p>
            <p className="text-sm text-muted-foreground">IELTS Speaking</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-3xl font-bold text-cambridge-700">{feedback.overallScore}%</p>
              <p className="text-sm text-muted-foreground">Điểm tổng</p>
            </div>
            <Badge variant="secondary" className="px-4 py-1 text-base">
              Band: {feedback.cambridgeBand}
            </Badge>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Nhận xét</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{feedback.summary_vi}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tiêu chí Speaking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(feedback.criteria).map(([key, score]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{criteriaLabels[key] ?? key}</span>
                <span className="font-medium">{score}/5</span>
              </div>
              <Progress value={(score / 5) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>

      {isIelts && weakPart && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Part nên luyện thêm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{weakPart}</p>
          </CardContent>
        </Card>
      )}

      {feedback.errors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lỗi chính ({feedback.errors.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feedback.errors.map((err, i) => (
              <div key={i} className="rounded-lg border p-3 text-sm">
                <Badge variant="outline">{err.type}</Badge>
                <p className="mt-1">
                  <span className="text-red-600">{err.original}</span>
                  {" → "}
                  <span className="text-green-700">{err.correction}</span>
                </p>
                <p className="text-muted-foreground">{err.explanation_vi}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {feedback.tips_vi.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gợi ý cải thiện</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {feedback.tips_vi.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {isIelts && (
        <Card className="border-sky-200 bg-gradient-to-br from-sky-50/80 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">👩‍🏫 Học online với Giáo viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Luyện thêm trên Camba, kết hợp học 1-1 với giáo viên để tăng band nhanh hơn.
            </p>
            <Button asChild className="kid-btn-fun rounded-full">
              <a href={VTEN_COURSE_URL} target="_blank" rel="noopener noreferrer">
                {VTEN_COURSE_LABEL}
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Hoặc{" "}
              <Link href="/pricing" className="font-semibold text-purple-600 underline">
                nâng cấp Camba Pro/VIP
              </Link>{" "}
              để luyện nhiều hơn mỗi ngày.
            </p>
          </CardContent>
        </Card>
      )}

      <details className="rounded-lg border bg-muted/30 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold">Transcript</summary>
        <p className="mt-2 whitespace-pre-wrap text-sm">{transcript}</p>
      </details>
    </div>
  );
}
