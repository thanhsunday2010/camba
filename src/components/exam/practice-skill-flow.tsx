import Link from "next/link";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBankStatsLine, type BankStats } from "@/lib/exam/bank-stats";
import { cn } from "@/lib/utils";

type PaperInfo = {
  id: string;
  title: string;
  timeLimit?: number | null;
};

interface PracticeSkillFlowProps {
  skillLabel: string;
  skillEmoji: string;
  practice?: PaperInfo;
  mock?: PaperInfo;
  practiceDone?: boolean;
  mockDone?: boolean;
  mockLocked?: boolean;
  mockLockedHint?: string;
  practiceBankStats?: BankStats;
  mockBankStats?: BankStats;
  nextSkill?: { href: string; label: string; emoji: string } | null;
  hubHref: string;
}

function formatMinutes(seconds?: number | null): string | null {
  if (seconds == null || seconds <= 0) return null;
  return `${Math.floor(seconds / 60)} phút`;
}

export function PracticeSkillFlow({
  skillLabel,
  skillEmoji,
  practice,
  mock,
  practiceDone,
  mockDone,
  mockLocked,
  mockLockedHint,
  practiceBankStats,
  mockBankStats,
  nextSkill,
  hubHref,
}: PracticeSkillFlowProps) {
  const practiceMinutes = practice ? formatMinutes(practice.timeLimit) : null;

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-2 border-violet-200">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white sm:px-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{skillEmoji}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-violet-100">Bước 1 · Luyện tập</p>
              <h2 className="text-xl font-extrabold">{skillLabel}</h2>
            </div>
            {!practiceDone && practice && (
              <Sparkles className="ml-auto h-5 w-5 text-yellow-200" aria-label="Sẵn sàng luyện" />
            )}
          </div>
        </div>
        <CardContent className="space-y-4 pt-5">
          {practiceBankStats && practiceBankStats.questionCount > 0 && (
            <p className="text-sm text-muted-foreground">{formatBankStatsLine(practiceBankStats)}</p>
          )}
          {practice ? (
            <>
              {practiceMinutes && (
                <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  ~{practiceMinutes} · 10 câu ngẫu nhiên
                </p>
              )}
              <Button asChild size="lg" className="kid-btn-fun w-full rounded-full text-base">
                <Link href={`/practice/${practice.id}`}>
                  {practiceDone ? "Luyện lại" : "Luyện ngay"} →
                </Link>
              </Button>
              {practiceDone && (
                <p className="flex items-center justify-center gap-1 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Đã hoàn thành ít nhất 1 lần
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-amber-800">Chưa có đề luyện tập cho kỹ năng này.</p>
          )}
        </CardContent>
      </Card>

      {mock && (
        <Card className={cn("border-2", mockLocked ? "border-gray-200 opacity-80" : "border-amber-200")}>
          <CardContent className="pt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Bước 2 · Thi thử</p>
            <h3 className="mt-1 text-lg font-extrabold text-amber-950">Mock {skillLabel}</h3>
            {mockBankStats && mockBankStats.questionCount > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{formatBankStatsLine(mockBankStats)}</p>
            )}
            {mockLocked ? (
              <p className="mt-3 text-sm font-semibold text-amber-900">{mockLockedHint}</p>
            ) : (
              <Button
                asChild
                variant={mockDone ? "outline" : "default"}
                className={cn("mt-4 w-full rounded-full", !mockDone && "bg-amber-600 hover:bg-amber-700")}
              >
                <Link href={`/practice/${mock.id}`}>
                  {mockDone ? "Làm lại mock" : "Bắt đầu mock test"}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {nextSkill && (
          <Button asChild variant="secondary" className="rounded-full">
            <Link href={nextSkill.href}>
              Kỹ năng tiếp: {nextSkill.emoji} {nextSkill.label} →
            </Link>
          </Button>
        )}
        <Button asChild variant="ghost" className="rounded-full">
          <Link href={hubHref}>← Về quỹ đạo</Link>
        </Button>
      </div>
    </div>
  );
}
