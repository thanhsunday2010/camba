"use client";

import { SpeakingHubClient } from "@/components/exam/speaking-hub-client";
import type { IeltsSpeakingUsageSnapshot } from "@/lib/subscription/ielts-speaking-limit";
import { getIeltsSpeakingMockQuestionCount } from "@/lib/exam/ielts-speaking-config";
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
  usage: IeltsSpeakingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
  mockBankStats?: import("@/lib/exam/bank-stats").BankStats;
};

export function IeltsSpeakingHubClient({
  module,
  usage,
  practiceParts,
  mockPaper,
  mockBankStats,
}: Props) {
  const mockCount = getIeltsSpeakingMockQuestionCount();
  const meta = IELTS_MODULE_META[module];

  return (
    <SpeakingHubClient
      trackLabel={meta.label}
      ieltsModule={module}
      quotaHint="Luyện tập & mock không giới hạn · giới hạn AI theo gói (Free 3 · Pro 10 · VIP 20 lượt/ngày)"
      usage={usage}
      practiceParts={practiceParts}
      mockPaper={mockPaper}
      mockTitle="Mock — Part 1 + 2 + 3"
      mockDescription={`${mockCount} câu theo format ${meta.label}: Part 1 (8 câu hỏi ngắn) → Part 2 (1 cue card, 1 phút chuẩn bị) → Part 3 (5 câu thảo luận). Câu hỏi ngẫu nhiên từ ngân hàng.`}
      mockBankStats={mockBankStats}
      migrateHint="Chưa có đề — chạy migrate IELTS Speaking"
    />
  );
}
