"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PlacementReport } from "@/lib/placement/evaluate";
import { formatSkill } from "@/lib/constants";
import { Award, BookOpen, Target } from "lucide-react";

const SKILL_LABELS: Record<string, string> = {
  READING: "Reading",
  LISTENING: "Listening",
  USE_OF_ENGLISH: "Use of English",
};

interface PlacementResultsClientProps {
  attempt: {
    id: string;
    score: number | null;
    maxScore: number | null;
    timeSpent: number | null;
    paper: { title: string };
    placementReport: PlacementReport | null;
  };
}

export function PlacementResultsClient({ attempt }: PlacementResultsClientProps) {
  const report = attempt.placementReport;
  const pct =
    attempt.score !== null && attempt.maxScore
      ? Math.round((attempt.score / attempt.maxScore) * 100)
      : null;

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Đang xử lý kết quả placement...</p>
        <Button asChild className="mt-4">
          <Link href="/placement">Quay lại</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <Badge className="mb-3" variant="secondary">
          Bài test trình độ
        </Badge>
        <h1 className="text-3xl font-bold">Kết quả đánh giá trình độ</h1>
        <p className="mt-2 text-muted-foreground">{attempt.paper.title}</p>
      </div>

      <Card className="mb-6 border-cambridge-200 bg-gradient-to-br from-cambridge-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-cambridge-600" />
            Kết luận trình độ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm text-muted-foreground">CEFR (Khung tham chiếu Châu Âu)</p>
              <p className="text-2xl font-bold text-cambridge-700">{report.cefrLevel}</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm text-muted-foreground">Cambridge English</p>
              <p className="text-2xl font-bold text-cambridge-700">{report.cambridgeLevel}</p>
              <p className="text-sm text-muted-foreground">{report.cambridgeExam}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{report.summary}</p>
          {pct !== null && (
            <p className="text-sm font-medium">Điểm bài test: {pct}% ({attempt.score}/{attempt.maxScore})</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Đánh giá từng kỹ năng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {report.skills.map((s) => (
            <div key={s.skill}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">
                  {SKILL_LABELS[s.skill] ?? formatSkill(s.skill)}
                </span>
                <span>
                  {s.correct}/{s.total} ({s.percent}%)
                </span>
              </div>
              <Progress value={s.percent} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {(report.strengths.length > 0 || report.weaknesses.length > 0) && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {report.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-green-700">Điểm mạnh</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc text-sm">
                  {report.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {report.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-amber-700">Cần cải thiện</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc text-sm">
                  {report.weaknesses.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5" />
            Gợi ý lộ trình
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{report.recommendation}</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/exams/KET">Bắt đầu luyện thi</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/placement">Làm lại placement</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
