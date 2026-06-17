import type { ExamLevel } from "@prisma/client";
import { isPartAiPracticePaper } from "@/lib/exam/ai-practice-config";
import { parseCambridgeSpeakingPracticePoolKey } from "@/lib/exam/cambridge-speaking-config";
import { parseCambridgeWritingPracticePoolKey } from "@/lib/exam/cambridge-writing-config";
import { isIeltsSpeakingPracticePoolKey, parseIeltsSpeakingPracticePoolKey } from "@/lib/exam/ielts-speaking-config";
import { isIeltsWritingPracticePoolKey, parseIeltsWritingPracticePoolKey } from "@/lib/exam/ielts-writing-config";
import { IELTS_MODULE_META, ieltsHubPath } from "@/lib/exam/ielts-module";
import { getCambridgeSpeakingUsageSnapshot } from "@/lib/subscription/cambridge-speaking-limit";
import { getCambridgeWritingUsageSnapshot } from "@/lib/subscription/cambridge-writing-limit";
import { isYleLevel, yleSkillPath } from "@/lib/yle/constants";
import type { YleLevel } from "@/lib/yle/constants";
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
    const parsed = parseIeltsWritingPracticePoolKey(key)!;
    const usage = await getIeltsWritingUsageSnapshot(userId);
    const meta = IELTS_MODULE_META[parsed.module];
    return {
      paperId: paper.id,
      skillLabel: "Writing",
      trackLabel: meta.label,
      hubHref: ieltsHubPath("writing", parsed.module),
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  if (isIeltsSpeakingPracticePoolKey(key)) {
    const parsed = parseIeltsSpeakingPracticePoolKey(key)!;
    const usage = await getIeltsSpeakingUsageSnapshot(userId);
    const meta = IELTS_MODULE_META[parsed.module];
    return {
      paperId: paper.id,
      skillLabel: "Speaking",
      trackLabel: meta.label,
      hubHref: ieltsHubPath("speaking", parsed.module),
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  const writingParsed = parseCambridgeWritingPracticePoolKey(key);
  if (writingParsed) {
    const usage = await getCambridgeWritingUsageSnapshot(userId, writingParsed.level);
    const level = writingParsed.level;
    const hubHref = isYleLevel(level)
      ? yleSkillPath(level as YleLevel, "WRITING")
      : `/exams/${level}/writing`;
    return {
      paperId: paper.id,
      skillLabel: "Writing",
      trackLabel: `Cambridge ${level}`,
      hubHref,
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  const speakingParsed = parseCambridgeSpeakingPracticePoolKey(key);
  if (speakingParsed) {
    const usage = await getCambridgeSpeakingUsageSnapshot(userId, speakingParsed.level);
    const level = speakingParsed.level;
    const hubHref = isYleLevel(level)
      ? yleSkillPath(level as YleLevel, "SPEAKING")
      : `/exams/${level}/speaking`;
    return {
      paperId: paper.id,
      skillLabel: "Speaking",
      trackLabel: `Cambridge ${level}`,
      hubHref,
      nextPracticeHref,
      ...usageFields(usage),
    };
  }

  return null;
}
