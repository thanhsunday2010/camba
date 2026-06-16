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
import { isGeminiQuotaError } from "./gemini-errors";
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
      const raw = await callGeminiJson(system, user, GEMINI_MODELS.writing, {
        maxOutputTokens: 768,
        temperature: 0.25,
      });
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
  track?: "cambridge" | "ielts";
  ieltsPart?: 1 | 2 | 3;
}): Promise<{ feedback: SpeakingFeedback; raw: unknown }> {
  const { system, user } = buildSpeakingPrompt(
    params.examLevel,
    params.prompt,
    params.transcript,
    { track: params.track, ieltsPart: params.ieltsPart }
  );

  let lastError: Error | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      const raw = await callGeminiJson(system, user, GEMINI_MODELS.speaking, {
        maxOutputTokens: 512,
        temperature: 0.25,
      });
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
  const model = GEMINI_MODELS.explain;

  try {
    const raw = await callGeminiJson(system, user, model, {
      maxOutputTokens: 512,
      temperature: 0.2,
    });
    return formatExplainWrongAnswer(explainWrongAnswerSchema.parse(raw));
  } catch (e) {
    if (isGeminiQuotaError(e)) throw e;

    try {
      const text = await callGeminiText(system, user, model);
      if (text.trim()) return text.trim();
    } catch (textError) {
      if (isGeminiQuotaError(textError)) throw textError;
    }

    throw e instanceof Error ? e : new Error("AI explain failed");
  }
}
