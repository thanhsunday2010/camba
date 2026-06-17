"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HorizontalScrollTrack } from "@/components/ui/horizontal-scroll-track";
import { formatQuotaRatio, isQuotaExhausted, isUnlimitedQuota } from "@/lib/subscription/plans";
import { formatBankStatsLine, type BankStats } from "@/lib/exam/bank-stats";
import { IeltsModuleBadge } from "@/components/ielts/ielts-module-badge";
import type { IeltsModule } from "@/lib/exam/ielts-module";
import { cn } from "@/lib/utils";

export type SpeakingUsageSnapshot = {
  planName: string;
  practiceUsed: number;
  practiceLimit: number;
  practiceRemaining: number;
  mockUsed: number;
  mockLimit: number;
  mockRemaining: number;
  mockPeriod: "day" | "week";
};

type PaperCard = {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  done?: boolean;
};

type PracticePart = {
  part: number;
  label: string;
  shortLabel: string;
  description: string;
  practiceInfo: string;
  bankStats?: BankStats;
  paper?: PaperCard;
  done: boolean;
};

type Props = {
  trackLabel: string;
  skillName?: string;
  ieltsModule?: IeltsModule;
  quotaHint: string;
  usage: SpeakingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
  mockTitle: string;
  mockDescription: string;
  mockBankStats?: BankStats;
  migrateHint?: string;
  hubHref?: string;
  nextSkill?: { href: string; label: string; emoji: string } | null;
};

function usagePct(used: number, limit: number) {
  if (isUnlimitedQuota(limit) || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function pickNextPart(parts: PracticePart[]): PracticePart | null {
  const withPaper = parts.filter((p) => p.paper);
  const undone = withPaper.find((p) => !p.done);
  return undone ?? withPaper[0] ?? null;
}

export function SpeakingHubClient({
  trackLabel,
  skillName = "Speaking",
  ieltsModule,
  quotaHint: _quotaHint,
  usage,
  practiceParts,
  mockPaper,
  mockTitle,
  mockDescription: _mockDescription,
  mockBankStats,
  migrateHint = "Chưa có đề — chạy migrate Speaking",
  hubHref,
  nextSkill,
}: Props) {
  const practiceLocked = isQuotaExhausted(usage.practiceUsed, usage.practiceLimit);
  const mockLocked = isQuotaExhausted(usage.mockUsed, usage.mockLimit);
  const nextPart = pickNextPart(practiceParts);

  return (
    <div className="space-y-6">
      {nextPart?.paper && !practiceLocked && (
        <Card className="overflow-hidden border-2 border-violet-300">
          <div className="bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-3 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">Bước 1 · Luyện ngay</p>
            <p className="text-lg font-extrabold">
              {skillName} · {nextPart.shortLabel}
            </p>
          </div>
          <CardContent className="pt-4">
            <Button asChild size="lg" className="kid-btn-fun w-full rounded-full">
              <Link href={`/practice/${nextPart.paper!.id}`}>
                {nextPart.done ? "Luyện lại" : "Bắt đầu"} {nextPart.shortLabel} →
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50/60 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-extrabold">Hôm nay · {usage.planName}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex justify-between text-sm font-semibold">
              <span>Luyện (1 câu/Part)</span>
              <span>{formatQuotaRatio(usage.practiceUsed, usage.practiceLimit)}</span>
            </div>
            <Progress value={usagePct(usage.practiceUsed, usage.practiceLimit)} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm font-semibold">
              <span>Mock ({usage.mockPeriod === "week" ? "tuần" : "ngày"})</span>
              <span>{formatQuotaRatio(usage.mockUsed, usage.mockLimit)}</span>
            </div>
            <Progress value={usagePct(usage.mockUsed, usage.mockLimit)} />
          </div>
        </CardContent>
      </Card>

      {practiceLocked && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Đã hết lượt luyện {skillName} {trackLabel} hôm nay.{" "}
          <Link href="/pricing" className="font-bold underline">
            Nâng cấp gói
          </Link>
        </p>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="page-section-title text-purple-800">Các Part · vuốt ngang</h2>
          {ieltsModule && <IeltsModuleBadge module={ieltsModule} size="sm" />}
        </div>
        <HorizontalScrollTrack label={`${skillName} parts`} showHint>
          {practiceParts.map((part) => (
            <Card
              key={part.part}
              className={cn(
                "scroll-card w-[min(72vw,14rem)] border-2",
                part.paper?.id === nextPart?.paper?.id && !part.done
                  ? "border-sky-300 ring-2 ring-sky-200"
                  : "border-purple-100"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-extrabold">{part.shortLabel}</CardTitle>
                  {part.done && (
                    <Badge variant="secondary" className="text-xs">
                      Đã làm
                    </Badge>
                  )}
                </div>
                {part.bankStats && part.bankStats.questionCount > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatBankStatsLine(part.bankStats)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {part.paper ? (
                  practiceLocked ? (
                    <Button className="w-full rounded-full" disabled size="sm">
                      Hết lượt
                    </Button>
                  ) : (
                    <Button asChild className="kid-btn-fun w-full rounded-full" size="sm">
                      <Link href={`/practice/${part.paper.id}`}>Luyện</Link>
                    </Button>
                  )
                ) : (
                  <p className="text-xs text-amber-700">{migrateHint}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </HorizontalScrollTrack>
      </section>

      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-800">Bước 2 · Mock</p>
        <Card className="border-2 border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg font-extrabold">{mockTitle}</CardTitle>
              {mockPaper?.done && <Badge variant="secondary">Đã làm</Badge>}
            </div>
            {mockBankStats && mockBankStats.questionCount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {formatBankStatsLine(mockBankStats)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {mockPaper ? (
              mockLocked ? (
                <Button className="rounded-full bg-amber-600" disabled>
                  {usage.mockPeriod === "week" ? "Hết lượt tuần" : "Hết lượt hôm nay"}
                </Button>
              ) : (
                <Button asChild className="kid-btn-fun rounded-full bg-amber-600 hover:bg-amber-700">
                  <Link href={`/practice/${mockPaper.id}`}>Bắt đầu mock</Link>
                </Button>
              )
            ) : (
              <p className="text-sm text-amber-700">{migrateHint}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap gap-2">
        {nextSkill && (
          <Button asChild variant="secondary" className="rounded-full">
            <Link href={nextSkill.href}>
              Kỹ năng tiếp: {nextSkill.emoji} {nextSkill.label} →
            </Link>
          </Button>
        )}
        {hubHref && (
          <Button asChild variant="ghost" className="rounded-full">
            <Link href={hubHref}>← Về quỹ đạo</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
