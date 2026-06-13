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
  errors: z.array(writingErrorSchema),
  improvedVersion: z.string(),
  tips_vi: z.array(z.string()).min(1).max(5),
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
  errors: z.array(writingErrorSchema),
  tips_vi: z.array(z.string()).min(1).max(5),
  summary_vi: z.string(),
});

export type SpeakingFeedback = z.infer<typeof speakingFeedbackSchema>;

export const AI_DAILY_LIMIT = 10;
