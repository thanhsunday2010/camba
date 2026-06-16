"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { IeltsSpeakingUsageSnapshot } from "@/lib/subscription/ielts-speaking-limit";
import { getIeltsSpeakingMockQuestionCount } from "@/lib/exam/ielts-speaking-config";

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
  paper?: PaperCard;
  done: boolean;
};

type Props = {
  usage: IeltsSpeakingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
};

function usagePct(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function IeltsSpeakingHubClient({ usage, practiceParts, mockPaper }: Props) {
  const mockCount = getIeltsSpeakingMockQuestionCount();
  const practiceLocked = usage.practiceRemaining <= 0;
  const mockLocked = usage.mockRemaining <= 0;

  return (
    <div className="space-y-8">
      <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50/60 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-extrabold">Quyền lợi hôm nay · {usage.planName}</CardTitle>
          <CardDescription>
            Free: 3 luyện/ngày · 1 mock/tuần · Pro: 10 luyện + 1 mock/ngày · VIP: 20 luyện + 3
            mock/ngày
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex justify-between text-sm font-semibold">
              <span>Luyện tập (mỗi lần mở 1 Part)</span>
              <span>
                {usage.practiceUsed}/{usage.practiceLimit}
              </span>
            </div>
            <Progress value={usagePct(usage.practiceUsed, usage.practiceLimit)} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm font-semibold">
              <span>Mock test ({usage.mockPeriod === "week" ? "tuần" : "ngày"})</span>
              <span>
                {usage.mockUsed}/{usage.mockLimit}
              </span>
            </div>
            <Progress value={usagePct(usage.mockUsed, usage.mockLimit)} />
          </div>
        </CardContent>
      </Card>

      {practiceLocked && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Đã hết lượt luyện Speaking IELTS hôm nay.{" "}
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
                  <p className="text-sm text-amber-700">Chưa có đề — chạy migrate IELTS Speaking</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-amber-800">Mock test Speaking full</h2>
        <Card className="border-2 border-amber-200 bg-amber-50/40">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg font-extrabold">Mock — Part 1 + 2 + 3</CardTitle>
              {mockPaper?.done && <Badge variant="secondary">Đã làm ít nhất 1 lần</Badge>}
            </div>
            <CardDescription className="text-base leading-relaxed">
              {mockCount} câu theo format thi thật: Part 1 (8 câu hỏi ngắn) → Part 2 (1 cue card,
              1 phút chuẩn bị) → Part 3 (5 câu thảo luận). Câu hỏi ngẫu nhiên từ ngân hàng.
            </CardDescription>
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
              <p className="text-sm text-amber-700">Chưa có đề mock — chạy migrate IELTS Speaking</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
