import { ExamLevel } from "@prisma/client";
import {
  buildExplainWrongAnswerPrompt,
  buildSpeakingPrompt,
  buildWritingPrompt,
} from "./prompts";
import {
  explainWrongAnswerSchema,
  formatExplainWrongAnswer,
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
  const { system, user } = buildExplainWrongAnswerPrompt(params);

  let lastError: Error | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      const raw = await callGeminiJson(system, user, GEMINI_MODELS.explain, {
        maxOutputTokens: 512,
        temperature: 0.2,
      });
      const parsed = explainWrongAnswerSchema.parse(raw);
      return formatExplainWrongAnswer(parsed);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Parse failed");
    }
  }

  try {
    const text = await callGeminiText(system, user, GEMINI_MODELS.explain);
    if (text.trim()) return text.trim();
  } catch (e) {
    lastError = e instanceof Error ? e : lastError;
  }

  throw lastError ?? new Error("AI explain failed");
}
