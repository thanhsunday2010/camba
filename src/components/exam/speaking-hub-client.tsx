"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBankStatsLine, type BankStats } from "@/lib/exam/bank-stats";
import { formatQuotaRatio, isQuotaExhausted, isUnlimitedQuota } from "@/lib/subscription/plans";

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
  quotaHint: string;
  usage: SpeakingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
  mockTitle: string;
  mockDescription: string;
  mockBankStats?: BankStats;
  migrateHint?: string;
};

function usagePct(used: number, limit: number) {
  if (isUnlimitedQuota(limit) || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function SpeakingHubClient({
  trackLabel,
  skillName = "Speaking",
  quotaHint,
  usage,
  practiceParts,
  mockPaper,
  mockTitle,
  mockDescription,
  mockBankStats,
  migrateHint = "Chưa có đề — chạy migrate Speaking",
}: Props) {
  const practiceLocked = isQuotaExhausted(usage.practiceUsed, usage.practiceLimit);
  const mockLocked = isQuotaExhausted(usage.mockUsed, usage.mockLimit);

  return (
    <div className="space-y-8">
      <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50/60 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-extrabold">
            Quyền lợi hôm nay · {usage.planName}
          </CardTitle>
          <CardDescription>{quotaHint}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex justify-between text-sm font-semibold">
              <span>Luyện tập (1 câu / Part)</span>
              <span>{formatQuotaRatio(usage.practiceUsed, usage.practiceLimit)}</span>
            </div>
            <Progress value={usagePct(usage.practiceUsed, usage.practiceLimit)} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm font-semibold">
              <span>Mock test ({usage.mockPeriod === "week" ? "tuần" : "ngày"})</span>
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
          </Link>{" "}
          để luyện thêm.
        </p>
      )}

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-purple-800">Luyện tập theo Part</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {practiceParts.map((part) => (
            <Card key={part.part} className="border-2 border-purple-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-extrabold">{part.shortLabel}</CardTitle>
                  {part.done && (
                    <Badge variant="secondary" className="text-xs">
                      Đã làm
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm leading-relaxed">{part.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{part.practiceInfo}</p>
                {part.bankStats && (
                  <p className="text-xs font-semibold text-violet-700">
                    📚 {formatBankStatsLine(part.bankStats)}
                  </p>
                )}
                {part.paper ? (
                  practiceLocked ? (
                    <Button className="w-full rounded-full" disabled>
                      Hết lượt hôm nay
                    </Button>
                  ) : (
                    <Button asChild className="kid-btn-fun w-full rounded-full">
                      <Link href={`/practice/${part.paper.id}`}>Bắt đầu luyện tập</Link>
                    </Button>
                  )
                ) : (
                  <p className="text-sm text-amber-700">{migrateHint}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-amber-800">Mock test {skillName} full</h2>
        <Card className="border-2 border-amber-200 bg-amber-50/40">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg font-extrabold">{mockTitle}</CardTitle>
              {mockPaper?.done && <Badge variant="secondary">Đã làm ít nhất 1 lần</Badge>}
            </div>
            <CardDescription className="text-base leading-relaxed">{mockDescription}</CardDescription>
            {mockBankStats && (
              <p className="text-xs font-semibold text-amber-800">
                📚 {formatBankStatsLine(mockBankStats)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {mockPaper ? (
              mockLocked ? (
                <Button className="rounded-full bg-amber-600" disabled>
                  {usage.mockPeriod === "week" ? "Hết lượt tuần này" : "Hết lượt hôm nay"}
                </Button>
              ) : (
                <Button asChild className="kid-btn-fun rounded-full bg-amber-600 hover:bg-amber-700">
                  <Link href={`/practice/${mockPaper.id}`}>Bắt đầu mock test</Link>
                </Button>
              )
            ) : (
              <p className="text-sm text-amber-700">{migrateHint}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
