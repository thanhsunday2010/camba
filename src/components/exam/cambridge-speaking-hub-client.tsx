"use client";

import { SpeakingHubClient } from "@/components/exam/speaking-hub-client";
import type { CambridgeSpeakingUsageSnapshot } from "@/lib/subscription/cambridge-speaking-limit";
import {
  getCambridgeSpeakingMockQuestionCount,
  getCambridgeSpeakingParts,
  isYleSpeakingLevel,
} from "@/lib/exam/cambridge-speaking-config";
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
  paper?: PaperCard;
  done: boolean;
};

type Props = {
  usage: CambridgeSpeakingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
};

export function CambridgeSpeakingHubClient({ usage, practiceParts, mockPaper }: Props) {
  const level = usage.level;
  const mockCount = getCambridgeSpeakingMockQuestionCount(level);
  const parts = getCambridgeSpeakingParts(level);
  const levelLabel = formatExamLevel(level);
  const partRange = isYleSpeakingLevel(level) ? "Part 1 + 2" : "Part 1 + 2 + 3";

  return (
    <SpeakingHubClient
      trackLabel={levelLabel}
      quotaHint="Free: 3 luyện/ngày · 1 mock/tuần · Pro: 10 luyện + 1 mock/ngày · VIP: 20 luyện + 3 mock/ngày (theo từng level Cambridge)"
      usage={usage}
      practiceParts={practiceParts}
      mockPaper={mockPaper}
      mockTitle={`Mock — ${partRange}`}
      mockDescription={`${mockCount} câu theo format Cambridge ${levelLabel}: ${parts.length} phần liên tiếp · câu hỏi ngẫu nhiên · AI chấm band Cambridge.`}
      migrateHint="Chưa có đề — chạy migrate Cambridge Speaking"
    />
  );
}
