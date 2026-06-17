"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatQuotaRatio, isQuotaExhausted, isUnlimitedQuota } from "@/lib/subscription/plans";
import type { BankStats } from "@/lib/exam/bank-stats";
import { IeltsModuleBadge } from "@/components/ielts/ielts-module-badge";
import type { IeltsModule } from "@/lib/exam/ielts-module";

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
};

function usagePct(used: number, limit: number) {
  if (isUnlimitedQuota(limit) || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
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
  mockBankStats: _mockBankStats,
  migrateHint = "Chưa có đề — chạy migrate Speaking",
}: Props) {
  const practiceLocked = isQuotaExhausted(usage.practiceUsed, usage.practiceLimit);
  const mockLocked = isQuotaExhausted(usage.mockUsed, usage.mockLimit);

  return (
    <div className="space-y-8">
      <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50/60 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-extrabold">
            Hôm nay · {usage.planName}
          </CardTitle>
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
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="page-section-title text-purple-800">Luyện tập theo Part</h2>
          {ieltsModule && <IeltsModuleBadge module={ieltsModule} size="sm" />}
        </div>
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
              </CardHeader>
              <CardContent>
                {part.paper ? (
                  practiceLocked ? (
                    <Button className="w-full rounded-full" disabled>
                      Hết lượt hôm nay
                    </Button>
                  ) : (
                    <Button asChild className="kid-btn-fun w-full rounded-full">
                      <Link href={`/practice/${part.paper.id}`}>Luyện tập</Link>
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
        <h2 className="page-section-title mb-3 text-amber-800 sm:mb-4">Mock full</h2>
        <Card className="border-2 border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg font-extrabold">{mockTitle}</CardTitle>
              {mockPaper?.done && <Badge variant="secondary">Đã làm</Badge>}
            </div>
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
    </div>
  );
}
