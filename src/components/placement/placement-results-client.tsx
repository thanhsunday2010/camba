"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PlacementReport } from "@/lib/placement/evaluate";
import { computePlacementShields } from "@/lib/placement/evaluate";
import { formatSkill } from "@/lib/constants";
import { Award, BookOpen, Target } from "lucide-react";
import { PlacementShields } from "@/components/placement/placement-shields";
import { useMascotToast } from "@/components/kids/mascot-toast-provider";
import { mascotPlacementResultMessage, mascotPlacementWeeklyRemainingMessage } from "@/lib/kids/mascot-messages";
import { mascotGamificationCelebration } from "@/lib/gamification/mascot-messages";
import { GamificationCelebrationCard } from "@/components/gamification/gamification-celebration-card";
import type { GamificationSnapshot } from "@/lib/gamification/types";

const SKILL_LABELS: Record<string, string> = {
  READING: "Reading",
  LISTENING: "Listening",
  USE_OF_ENGLISH: "Use of English",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

interface PlacementResultsClientProps {
  attempt: {
    id: string;
    score: number | null;
    maxScore: number | null;
    timeSpent: number | null;
    paper: { title: string };
    placementReport: PlacementReport | null;
    guestFullName?: string | null;
    guestPhone?: string | null;
    displayName?: string;
  };
  isGuest?: boolean;
  placementWeekly?: {
    used: number;
    limit: number;
    remaining: number;
  } | null;
  gamification?: GamificationSnapshot | null;
}

export function PlacementResultsClient({
  attempt,
  isGuest = false,
  placementWeekly,
  gamification,
}: PlacementResultsClientProps) {
  const report = attempt.placementReport;
  const shields =
    report && (report.track === "YLE" || report.track === "SECONDARY")
      ? computePlacementShields(report.skills)
      : undefined;
  const { showMascot } = useMascotToast();
  const mascotShownRef = useRef(false);
  const pct =
    attempt.score !== null && attempt.maxScore
      ? Math.round((attempt.score / attempt.maxScore) * 100)
      : null;

  useEffect(() => {
    if (mascotShownRef.current) return;
    mascotShownRef.current = true;

    const showWeeklyRemaining = () => {
      if (
        placementWeekly &&
        placementWeekly.used >= 1 &&
        placementWeekly.remaining > 0
      ) {
        showMascot(mascotPlacementWeeklyRemainingMessage(placementWeekly.remaining));
      }
    };

    if (gamification) {
      showMascot(mascotGamificationCelebration(gamification));
      if (report) {
        setTimeout(() => {
          showMascot(
            mascotPlacementResultMessage(
              report.track === "ADULT"
                ? report.cefrLevel
                : report.track === "IELTS"
                  ? (report.ieltsBand ?? report.cefrLevel)
                  : report.cambridgeLevel,
              attempt.displayName ?? attempt.guestFullName ?? undefined,
              {
                track: report.track,
                cefrSubLevelLabel: report.cefrSubLevelLabel,
                ieltsBand: report.ieltsBand,
              }
            )
          );
          setTimeout(showWeeklyRemaining, 5000);
        }, 4500);
      }
      return;
    }

    if (!report) return;
    showMascot(
      mascotPlacementResultMessage(
        report.track === "ADULT"
          ? report.cefrLevel
          : report.track === "IELTS"
            ? (report.ieltsBand ?? report.cefrLevel)
            : report.cambridgeLevel,
        attempt.displayName ?? attempt.guestFullName ?? undefined,
        {
          track: report.track,
          cefrSubLevelLabel: report.cefrSubLevelLabel,
          ieltsBand: report.ieltsBand,
        }
      )
    );
    setTimeout(showWeeklyRemaining, 4000);
  }, [
    report,
    showMascot,
    gamification,
    attempt.displayName,
    attempt.guestFullName,
    placementWeekly,
  ]);

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">
          Không thể tạo báo cáo placement. Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>
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
        <h1 className="text-3xl font-extrabold kid-gradient-text">Kết quả đánh giá trình độ</h1>
        <p className="mt-2 font-semibold text-muted-foreground">{attempt.paper.title}</p>
        {(attempt.guestFullName || attempt.guestPhone) && (
          <p className="mt-1 text-sm font-medium text-purple-700">
            {attempt.guestFullName}
            {attempt.guestPhone && ` · ${attempt.guestPhone}`}
          </p>
        )}
      </div>

      {gamification && <GamificationCelebrationCard snapshot={gamification} />}

      {placementWeekly && placementWeekly.remaining > 0 && (
        <p className="mb-6 rounded-xl border-2 border-sky-100 bg-sky-50/80 px-4 py-3 text-center text-sm font-semibold text-sky-900">
          Tuần này bạn còn{" "}
          <strong>{placementWeekly.remaining}</strong>/{placementWeekly.limit} lượt Test trình độ.
        </p>
      )}

      <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-extrabold">
            <Award className="h-6 w-6 text-purple-600" />
            Kết luận trình độ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.track === "ADULT" ? (
            <div className="rounded-xl border-2 bg-white p-4">
              <p className="text-sm font-semibold text-muted-foreground">CEFR</p>
              <p className="text-2xl font-extrabold text-purple-700">{report.cefrLevel}</p>
              {report.cefrSubLevelLabel && (
                <p className="mt-1 text-sm font-bold text-purple-600">
                  Vị trí trong level: {report.cefrSubLevelLabel}
                </p>
              )}
            </div>
          ) : report.track === "IELTS" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 bg-white p-4">
                <p className="text-sm font-semibold text-muted-foreground">IELTS (ước lượng)</p>
                <p className="text-2xl font-extrabold text-purple-700">
                  Band {report.ieltsBand ?? "—"}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Dựa trên 4 kỹ năng (Listening, Reading, Writing, Speaking)
                </p>
              </div>
              <div className="rounded-xl border-2 bg-white p-4">
                <p className="text-sm font-semibold text-muted-foreground">CEFR tương đương</p>
                <p className="text-2xl font-extrabold text-purple-700">{report.cefrLevel}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border-2 bg-white p-4">
                  <p className="text-sm font-semibold text-muted-foreground">CEFR</p>
                  <p className="text-2xl font-extrabold text-purple-700">{report.cefrLevel}</p>
                </div>
                <div className="rounded-xl border-2 bg-white p-4">
                  <p className="text-sm font-semibold text-muted-foreground">Cambridge English</p>
                  <p className="text-2xl font-extrabold text-purple-700">{report.cambridgeLevel}</p>
                  <p className="text-sm font-medium text-muted-foreground">{report.cambridgeExam}</p>
                </div>
              </div>
              {shields && (
                <PlacementShields
                  count={shields.total}
                  max={shields.max}
                  bySkill={shields.bySkill}
                  track={report.track === "YLE" ? "YLE" : "SECONDARY"}
                />
              )}
            </>
          )}
          <p className="text-sm font-medium leading-relaxed">{report.summary}</p>
          {pct !== null && (
            <p className="text-sm font-bold">
              Điểm bài test: {pct}% ({attempt.score}/{attempt.maxScore})
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
            <Target className="h-5 w-5" />
            Đánh giá từng kỹ năng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {report.skills.map((s) => (
            <div key={s.skill}>
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>{SKILL_LABELS[s.skill] ?? formatSkill(s.skill)}</span>
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
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-base font-extrabold text-green-700">Điểm mạnh</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc text-sm font-medium">
                  {report.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {report.weaknesses.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-base font-extrabold text-amber-700">Cần cải thiện</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc text-sm font-medium">
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
          <CardTitle className="flex items-center gap-2 text-base font-extrabold">
            <BookOpen className="h-5 w-5" />
            Gợi ý lộ trình
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{report.recommendation}</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {isGuest ? (
          <>
            <Button asChild className="kid-btn-fun">
              <Link href="/register">Đăng ký để luyện tập</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/placement">Làm lại placement</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild className="kid-btn-fun">
              <Link href="/exams">Bắt đầu luyện thi</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/placement">Làm lại placement</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
