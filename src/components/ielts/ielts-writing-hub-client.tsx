"use client";

import { SpeakingHubClient } from "@/components/exam/speaking-hub-client";
import type { IeltsWritingUsageSnapshot } from "@/lib/subscription/ielts-writing-limit";
import {
  getIeltsWritingMockQuestionCount,
  IELTS_WRITING_TASK_DEFS,
  IELTS_WRITING_TASKS,
} from "@/lib/exam/ielts-writing-config";

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
  usage: IeltsWritingUsageSnapshot;
  practiceParts: PracticePart[];
  mockPaper: (PaperCard & { done: boolean }) | null;
};

export function IeltsWritingHubClient({ usage, practiceParts, mockPaper }: Props) {
  const mockCount = getIeltsWritingMockQuestionCount();

  return (
    <SpeakingHubClient
      trackLabel="IELTS"
      skillName="Writing"
      quotaHint="Free: 3 luyện/ngày · 1 mock/tuần · Pro: 10 luyện + 1 mock/ngày · VIP: 20 luyện + 3 mock/ngày"
      usage={usage}
      practiceParts={practiceParts}
      mockPaper={mockPaper}
      mockTitle="Mock — Task 1 + Task 2"
      mockDescription={`${mockCount} câu theo format IELTS Writing: Task 1 rồi Task 2 · câu hỏi ngẫu nhiên · AI chấm band IELTS.`}
      migrateHint="Chưa có đề — chạy migrate IELTS Writing"
    />
  );
}

export { IELTS_WRITING_TASK_DEFS, IELTS_WRITING_TASKS };
