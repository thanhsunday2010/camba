"use client";

import { SpeakingHubClient } from "@/components/exam/speaking-hub-client";
import type { CambridgeWritingUsageSnapshot } from "@/lib/subscription/cambridge-writing-limit";
import {
  getCambridgeWritingMockQuestionCount,
  getCambridgeWritingParts,
  isYleWritingLevel,
} from "@/lib/exam/cambridge-writing-config";
import { formatExamLevel } from "@/lib/constants";

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
  usage: CambridgeWritingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
  mockBankStats?: import("@/lib/exam/bank-stats").BankStats;
};

export function CambridgeWritingHubClient({ usage, practiceParts, mockPaper, mockBankStats }: Props) {
  const level = usage.level;
  const mockCount = getCambridgeWritingMockQuestionCount(level);
  const parts = getCambridgeWritingParts(level);
  const levelLabel = formatExamLevel(level);
  const partRange = isYleWritingLevel(level) ? "Part 1" : "Part 1 + 2";

  return (
    <SpeakingHubClient
      trackLabel={levelLabel}
      skillName="Writing"
      quotaHint="Free: 3 luyện/ngày · 1 mock/tuần · Pro: 10 luyện + 1 mock/ngày · VIP: 20 luyện + 3 mock/ngày (theo từng level Cambridge)"
      usage={usage}
      practiceParts={practiceParts}
      mockPaper={mockPaper}
      mockTitle={`Mock — ${partRange}`}
      mockDescription={`${mockCount} câu theo format Cambridge ${levelLabel}: ${parts.length} phần liên tiếp · câu hỏi ngẫu nhiên · AI chấm band Cambridge.`}
      mockBankStats={mockBankStats}
      migrateHint="Chưa có đề — chạy migrate Cambridge Writing"
    />
  );
}
