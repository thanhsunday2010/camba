import { Skill } from "@prisma/client";

/** Format IELTS đầy đủ — 4 kỹ năng theo thứ tự thi thật */
export const IELTS_FULL = {
  listeningQuestions: 40,
  listeningMinutes: 30,
  readingQuestions: 40,
  readingMinutes: 60,
  writingTasks: 2,
  writingMinutes: 60,
  speakingParts: 2,
  speakingMinutes: 14,
} as const;

/** Rút gọn ~một nửa thời gian & nội dung */
export const IELTS_SHORT = {
  listeningQuestions: 20,
  listeningMinutes: 15,
  readingQuestions: 20,
  readingMinutes: 30,
  writingTasks: 1,
  writingMinutes: 30,
  speakingParts: 1,
  speakingMinutes: 7,
} as const;

export type IeltsFormat = typeof IELTS_FULL | typeof IELTS_SHORT;

export type IeltsSectionPool = "listening" | "reading" | "writing" | "speaking";

export type IeltsSectionOrder = {
  pool: IeltsSectionPool;
  label: string;
  timeLimitSeconds: number;
};

export function ieltsSectionOrder(
  format: IeltsFormat,
  readingLabel: string,
  gt: boolean
): IeltsSectionOrder[] {
  const writingLabel = gt
    ? "Writing — Task 1 (Letter) & Task 2 (Essay)"
    : "Writing — Task 1 (Report) & Task 2 (Essay)";
  const writingLabelShort = gt ? "Writing — Task 2 (Essay)" : "Writing — Task 2 (Essay)";

  return [
    {
      pool: "listening",
      label: "Listening (4 sections)",
      timeLimitSeconds: format.listeningMinutes * 60,
    },
    {
      pool: "reading",
      label: readingLabel,
      timeLimitSeconds: format.readingMinutes * 60,
    },
    {
      pool: "writing",
      label: format.writingTasks === 2 ? writingLabel : writingLabelShort,
      timeLimitSeconds: format.writingMinutes * 60,
    },
    {
      pool: "speaking",
      label:
        format.speakingParts === 2
          ? "Speaking — Part 1 & Part 2"
          : "Speaking — Part 2 (Cue card)",
      timeLimitSeconds: format.speakingMinutes * 60,
    },
  ];
}

export function ieltsTotalSeconds(format: IeltsFormat): number {
  return (
    (format.listeningMinutes +
      format.readingMinutes +
      format.writingMinutes +
      format.speakingMinutes) *
    60
  );
}

export function ieltsDescription(variantLabel: string, format: IeltsFormat): string {
  const mcq = format.listeningQuestions + format.readingQuestions;
  const mins =
    format.listeningMinutes +
    format.readingMinutes +
    format.writingMinutes +
    format.speakingMinutes;
  return (
    `${variantLabel} · ${mins} phút · 4 kỹ năng IELTS — ` +
    `Listening ${format.listeningMinutes}′ (${format.listeningQuestions} câu) → ` +
    `Reading ${format.readingMinutes}′ (${format.readingQuestions} câu) → ` +
    `Writing ${format.writingMinutes}′ (${format.writingTasks} task) → ` +
    `Speaking ${format.speakingMinutes}′ (${format.speakingParts} phần). ` +
    `Tổng ${mcq} câu trắc nghiệm + ${format.writingTasks + format.speakingParts} bài AI chấm`
  );
}

/** Map % sang band IELTS (ước lượng) */
export function mapIeltsBand(percent: number): string {
  if (percent >= 92) return "9.0";
  if (percent >= 87) return "8.5";
  if (percent >= 82) return "8.0";
  if (percent >= 77) return "7.5";
  if (percent >= 72) return "7.0";
  if (percent >= 67) return "6.5";
  if (percent >= 62) return "6.0";
  if (percent >= 57) return "5.5";
  if (percent >= 52) return "5.0";
  if (percent >= 47) return "4.5";
  if (percent >= 42) return "4.0";
  if (percent >= 37) return "3.5";
  return "3.0";
}

export function ieltsBandToCefr(band: string): string {
  const n = parseFloat(band);
  if (n >= 8.5) return "C1";
  if (n >= 7.0) return "B2";
  if (n >= 5.5) return "B1";
  if (n >= 4.0) return "A2";
  return "A1";
}

export const IELTS_SKILLS: Skill[] = [
  Skill.LISTENING,
  Skill.READING,
  Skill.WRITING,
  Skill.SPEAKING,
];
