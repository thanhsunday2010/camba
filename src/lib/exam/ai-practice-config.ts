import { isCambridgeSpeakingPracticePoolKey } from "@/lib/exam/cambridge-speaking-config";
import { isCambridgeWritingPracticePoolKey } from "@/lib/exam/cambridge-writing-config";
import { isIeltsSpeakingPracticePoolKey } from "@/lib/exam/ielts-speaking-config";
import { isIeltsWritingPracticePoolKey } from "@/lib/exam/ielts-writing-config";

/** Luyện tập Writing/Speaking theo Part: 1 câu ngẫu nhiên + AI chấm ngay. */
export function isPartAiPracticePaper(paper: {
  paperKind?: string;
  practicePoolKey?: string | null;
}): boolean {
  if (paper.paperKind !== "PRACTICE") return false;
  const key = paper.practicePoolKey;
  if (!key) return false;
  return (
    isCambridgeSpeakingPracticePoolKey(key) ||
    isCambridgeWritingPracticePoolKey(key) ||
    isIeltsSpeakingPracticePoolKey(key) ||
    isIeltsWritingPracticePoolKey(key)
  );
}
