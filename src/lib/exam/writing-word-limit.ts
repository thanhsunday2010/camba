/** Buffer trên giới hạn từ ghi trong đề (format thi thật). */
export const WRITING_EXAM_LIMIT_PADDING = 1.2;

export const WRITING_WORD_LIMIT_POLICY_LABEL = "Theo giới hạn đề thi (+ 20%)";

/** Giới hạn nộp bài Writing = wordLimit của câu hỏi × 1.2 (làm tròn lên). */
export function getWritingSubmissionWordLimit(examWordLimit?: number | null): number | undefined {
  if (examWordLimit == null || !Number.isFinite(examWordLimit) || examWordLimit <= 0) {
    return undefined;
  }
  return Math.ceil(examWordLimit * WRITING_EXAM_LIMIT_PADDING);
}

export function formatWritingWordLimitHint(
  examWordLimit?: number | null
): string | null {
  const limit = getWritingSubmissionWordLimit(examWordLimit);
  if (limit == null) return null;
  if (examWordLimit != null && examWordLimit > 0) {
    return `Giới hạn: ${limit} từ (đề ${examWordLimit} từ + 20%)`;
  }
  return `Giới hạn: ${limit} từ`;
}
