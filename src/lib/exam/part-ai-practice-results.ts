import type { ExamLevel } from "@prisma/client";
import { isPartAiPracticePaper } from "@/lib/exam/ai-practice-config";
import { parseCambridgeSpeakingPracticePoolKey } from "@/lib/exam/cambridge-speaking-config";
import { parseCambridgeWritingPracticePoolKey } from "@/lib/exam/cambridge-writing-config";
import { isIeltsSpeakingPracticePoolKey } from "@/lib/exam/ielts-speaking-config";
import { isIeltsWritingPracticePoolKey } from "@/lib/exam/ielts-writing-config";
import { getCambridgeSpeakingUsageSnapshot } from "@/lib/subscription/cambridge-speaking-limit";
import { getCambridgeWritingUsageSnapshot } from "@/lib/subscription/cambridge-writing-limit";
import { getIeltsSpeakingUsageSnapshot } from "@/lib/subscription/ielts-speaking-limit";
import { getIeltsWritingUsageSnapshot } from "@/lib/subscription/ielts-writing-limit";

export type PartAiPracticeResultsMeta = {
  paperId: string;
  skillLabel: "Writing" | "Speaking";
  trackLabel: string;
  practiceUsed: number;
  practiceLimit: number;
  practiceRemaining: number;
  planName: string;
  hubHref: string;
  nextPracticeHref: string;
  canStartNext: boolean;
};

type PaperLike = {
  id: string;
  paperKind?: string;
  practicePoolKey?: string | null;
  level?: ExamLevel;
};

function usageFields(snapshot: {
  planName: string;
  practiceUsed: number;
  practiceLimit: number;
  practiceRemaining: number;
}) {
  return {
    planName: snapshot.planName,
    practiceUsed: snapshot.practiceUsed,
    practiceLimit: snapshot.practiceLimit,
    practiceRemaining: snapshot.practiceRemaining,
    canStartNext: snapshot.practiceRemaining > 0,
  };
}

export async function getPartAiPracticeResultsMeta(
  userId: string,
  paper: PaperLike
): Promise<PartAiPracticeResultsMeta | null> {
  if (!isPartAiPracticePaper(paper)) return null;

  const key = paper.practicePoolKey;
  if (!key) return null;

  const nextPracticeHref = `/practice/${paper.id}`;

  if (isIeltsWritingPracticePoolKey(key)) {
    const usage = await getIeltsWritingUsageSnapshot(userId);
    return {
      paperId: paper.id,
      skillLabel: "Writing",
      trackLabel: "IELTS",
      hubHref: "/ielts/writing",
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  if (isIeltsSpeakingPracticePoolKey(key)) {
    const usage = await getIeltsSpeakingUsageSnapshot(userId);
    return {
      paperId: paper.id,
      skillLabel: "Speaking",
      trackLabel: "IELTS",
      hubHref: "/ielts/speaking",
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  const writingParsed = parseCambridgeWritingPracticePoolKey(key);
  if (writingParsed) {
    const usage = await getCambridgeWritingUsageSnapshot(userId, writingParsed.level);
    return {
      paperId: paper.id,
      skillLabel: "Writing",
      trackLabel: `Cambridge ${writingParsed.level}`,
      hubHref: `/exams/${writingParsed.level.toLowerCase()}/writing`,
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  const speakingParsed = parseCambridgeSpeakingPracticePoolKey(key);
  if (speakingParsed) {
    const usage = await getCambridgeSpeakingUsageSnapshot(userId, speakingParsed.level);
    return {
      paperId: paper.id,
      skillLabel: "Speaking",
      trackLabel: `Cambridge ${speakingParsed.level}`,
      hubHref: `/exams/${speakingParsed.level.toLowerCase()}/speaking`,
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  return null;
}
