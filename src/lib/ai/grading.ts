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
      const feedback = writingFeedbackSchema.parse(normalizeWritingFeedback(raw));
      return { feedback, raw };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Parse failed");
    }
  }
  throw lastError ?? new Error("AI grading failed");
}

function normalizeWritingFeedback(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const o = { ...(raw as Record<string, unknown>) };

  if (typeof o.tips_vi === "string") {
    o.tips_vi = [o.tips_vi];
  }
  const tips = Array.isArray(o.tips_vi)
    ? o.tips_vi.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : [];
  if (tips.length === 0) {
    const summary = typeof o.summary_vi === "string" ? o.summary_vi.trim() : "";
    o.tips_vi = summary
      ? [summary.slice(0, 120)]
      : ["Hãy kiểm tra ngữ pháp và từ vựng trong bài viết."];
  } else {
    o.tips_vi = tips.slice(0, 2);
  }

  if (typeof o.summary_vi !== "string" || !o.summary_vi.trim()) {
    o.summary_vi = "AI đã chấm bài viết của bạn.";
  }

  if (typeof o.overallScore === "string") {
    o.overallScore = Number(o.overallScore);
  }

  if (o.criteria && typeof o.criteria === "object") {
    const c = { ...(o.criteria as Record<string, unknown>) };
    for (const key of ["content", "communicativeAchievement", "organisation", "language"]) {
      if (typeof c[key] === "string") c[key] = Number(c[key]);
    }
    o.criteria = c;
  }

  if (!Array.isArray(o.errors)) o.errors = [];

  return o;
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
      const feedback = speakingFeedbackSchema.parse(normalizeSpeakingFeedback(raw));
      return { feedback, raw };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Parse failed");
    }
  }
  throw lastError ?? new Error("AI grading failed");
}

function normalizeSpeakingFeedback(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const o = { ...(raw as Record<string, unknown>) };
  const tips = Array.isArray(o.tips_vi)
    ? o.tips_vi.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : [];
  if (tips.length === 0) {
    const summary = typeof o.summary_vi === "string" ? o.summary_vi.trim() : "";
    o.tips_vi = summary
      ? [summary.slice(0, 120)]
      : ["Hãy luyện nói thêm và thử ghi âm lại để cải thiện."];
  } else {
    o.tips_vi = tips.slice(0, 2);
  }
  if (typeof o.summary_vi !== "string" || !o.summary_vi.trim()) {
    o.summary_vi = "AI đã chấm bài nói của bạn.";
  }
  return o;
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
