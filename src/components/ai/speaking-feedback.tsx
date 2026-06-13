"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SpeakingFeedback } from "@/lib/ai/schemas";

interface SpeakingFeedbackViewProps {
  feedback: SpeakingFeedback;
  transcript: string;
}

export function SpeakingFeedbackView({ feedback, transcript }: SpeakingFeedbackViewProps) {
  const criteriaLabels: Record<string, string> = {
    fluency: "Fluency",
    pronunciation: "Pronunciation",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    taskAchievement: "Task Achievement",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-cambridge-700">{feedback.overallScore}%</p>
          <p className="text-sm text-muted-foreground">Điểm tổng</p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-1">
          Band: {feedback.cambridgeBand}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{transcript}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tiêu chí Speaking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nhận xét</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{feedback.summary_vi}</p>
        </CardContent>
      </Card>

      {feedback.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lỗi phát hiện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.errors.map((err, i) => (
              <div key={i} className="rounded-lg border p-3 text-sm">
                <Badge variant="outline">{err.type}</Badge>
                <p className="mt-2">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gợi ý cải thiện</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {feedback.tips_vi.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
