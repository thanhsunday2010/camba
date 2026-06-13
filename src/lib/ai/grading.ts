import { ExamLevel } from "@prisma/client";
import { buildSpeakingPrompt, buildWritingPrompt } from "./prompts";
import {
  speakingFeedbackSchema,
  writingFeedbackSchema,
  type SpeakingFeedback,
  type WritingFeedback,
} from "./schemas";
import { callGeminiJson, callGeminiText, transcribeAudioWithGemini } from "./gemini";
import { GEMINI_MODELS } from "./config";

export async function gradeWriting(params: {
  examLevel: ExamLevel;
  taskPrompt: string;
  studentAnswer: string;
  wordLimit?: number;
}): Promise<{ feedback: WritingFeedback; raw: unknown }> {
  const { system, user } = buildWritingPrompt(
    params.examLevel,
    params.taskPrompt,
    params.studentAnswer,
    params.wordLimit
  );

  let lastError: Error | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      const raw = await callGeminiJson(system, user, GEMINI_MODELS.writing);
      const feedback = writingFeedbackSchema.parse(raw);
      return { feedback, raw };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Parse failed");
    }
  }
  throw lastError ?? new Error("AI grading failed");
}

/** Server-side fallback — prefer browser Web Speech API ($0) on the client */
export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  return transcribeAudioWithGemini(buffer, mimeType);
}

export async function gradeSpeaking(params: {
  examLevel: ExamLevel;
  prompt: string;
  transcript: string;
}): Promise<{ feedback: SpeakingFeedback; raw: unknown }> {
  const { system, user } = buildSpeakingPrompt(
    params.examLevel,
    params.prompt,
    params.transcript
  );

  let lastError: Error | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      const raw = await callGeminiJson(system, user, GEMINI_MODELS.speaking);
      const feedback = speakingFeedbackSchema.parse(raw);
      return { feedback, raw };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Parse failed");
    }
  }
  throw lastError ?? new Error("AI grading failed");
}

export async function explainWrongAnswer(params: {
  question: string;
  correctAnswer: string;
  studentAnswer: string;
}): Promise<string> {
  return callGeminiText(
    "You are a Cambridge English tutor. Explain why the student's answer is wrong and why the correct answer is right. Respond in Vietnamese, concise, under 150 words.",
    `Question: ${params.question}\nCorrect: ${params.correctAnswer}\nStudent: ${params.studentAnswer}`,
    GEMINI_MODELS.explain
  );
}
