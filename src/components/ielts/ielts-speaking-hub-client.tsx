"use client";

import { SpeakingHubClient } from "@/components/exam/speaking-hub-client";
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

export function IeltsSpeakingHubClient({ usage, practiceParts, mockPaper }: Props) {
  const mockCount = getIeltsSpeakingMockQuestionCount();

  return (
    <SpeakingHubClient
      trackLabel="IELTS"
      quotaHint="Free: 3 luyện/ngày · 1 mock/tuần · Pro: 10 luyện + 1 mock/ngày · VIP: 20 luyện + 3 mock/ngày"
      usage={usage}
      practiceParts={practiceParts}
      mockPaper={mockPaper}
      mockTitle="Mock — Part 1 + 2 + 3"
      mockDescription={`${mockCount} câu theo format thi thật: Part 1 (8 câu hỏi ngắn) → Part 2 (1 cue card, 1 phút chuẩn bị) → Part 3 (5 câu thảo luận). Câu hỏi ngẫu nhiên từ ngân hàng.`}
      migrateHint="Chưa có đề — chạy migrate IELTS Speaking"
    />
  );
}
