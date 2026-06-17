"use client";

import { SpeakingHubClient } from "@/components/exam/speaking-hub-client";
import type { IeltsWritingUsageSnapshot } from "@/lib/subscription/ielts-writing-limit";
import { getIeltsWritingMockQuestionCount } from "@/lib/exam/ielts-writing-config";
import { IELTS_MODULE_META, type IeltsModule } from "@/lib/exam/ielts-module";

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
  bankStats?: import("@/lib/exam/bank-stats").BankStats;
  paper?: PaperCard;
  done: boolean;
};

type Props = {
  module: IeltsModule;
  usage: IeltsWritingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
  mockBankStats?: import("@/lib/exam/bank-stats").BankStats;
};

export function IeltsWritingHubClient({
  module,
  usage,
  practiceParts,
  mockPaper,
  mockBankStats,
}: Props) {
  const mockCount = getIeltsWritingMockQuestionCount();
  const meta = IELTS_MODULE_META[module];

  return (
    <SpeakingHubClient
      trackLabel={meta.label}
      ieltsModule={module}
      skillName="Writing"
      quotaHint="Luyện tập & mock không giới hạn · giới hạn AI theo gói (Free 3 · Pro 10 · VIP 20 lượt/ngày)"
      usage={usage}
      practiceParts={practiceParts}
      mockPaper={mockPaper}
      mockTitle="Mock — Task 1 + Task 2"
      mockDescription={`${mockCount} câu theo format ${meta.label}: Task 1 rồi Task 2 · câu hỏi ngẫu nhiên · AI chấm band IELTS.`}
      mockBankStats={mockBankStats}
      migrateHint="Chưa có đề — chạy migrate IELTS Writing"
    />
  );
}
