import { z } from "zod";

export const writingErrorSchema = z.object({
  original: z.string(),
  correction: z.string(),
  type: z.string(),
  explanation_vi: z.string(),
});

export const writingFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  cambridgeBand: z.string(),
  criteria: z.object({
    content: z.number().min(0).max(5),
    communicativeAchievement: z.number().min(0).max(5),
    organisation: z.number().min(0).max(5),
    language: z.number().min(0).max(5),
  }),
  errors: z.array(writingErrorSchema).max(3),
  improvedVersion: z.string().optional().default(""),
  tips_vi: z.array(z.string()).min(1).max(2),
  summary_vi: z.string(),
});

export type WritingFeedback = z.infer<typeof writingFeedbackSchema>;

export const speakingFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  cambridgeBand: z.string(),
  criteria: z.object({
    fluency: z.number().min(0).max(5),
    pronunciation: z.number().min(0).max(5),
    grammar: z.number().min(0).max(5),
    vocabulary: z.number().min(0).max(5),
    taskAchievement: z.number().min(0).max(5),
  }),
  errors: z.array(writingErrorSchema).max(3),
  tips_vi: z.array(z.string()).min(1).max(2),
  summary_vi: z.string(),
  weakPartPractice: z.string().optional(),
});

export type SpeakingFeedback = z.infer<typeof speakingFeedbackSchema>;

/** Giải thích câu sai — tối đa vài câu ngắn */
export const explainWrongAnswerSchema = z.object({
  mistake_vi: z.string().min(1),
  correct_vi: z.string().min(1),
  tip_vi: z.string().nullable().optional(),
});

export type ExplainWrongAnswer = z.infer<typeof explainWrongAnswerSchema>;

export function formatExplainWrongAnswer(feedback: ExplainWrongAnswer): string {
  const lines = [`Sai: ${feedback.mistake_vi}`, `Đúng: ${feedback.correct_vi}`];
  if (feedback.tip_vi?.trim()) {
    lines.push(`Gợi ý: ${feedback.tip_vi.trim()}`);
  }
  return lines.join("\n");
}

export const AI_DAILY_LIMIT = 10;
