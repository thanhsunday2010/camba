import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_MODELS,
  detectCredentialType,
  getGeminiApiKey,
  requireGeminiApiKey,
  isVertexAiEnabled,
} from "./config";
import { isGeminiRetryableError } from "./gemini-errors";

let clientInstance: GoogleGenAI | null = null;

/**
 * Creates the unified @google/genai client.
 * Supports:
 * - Auth-scoped OAuth keys (AQ.*) from Google AI Studio
 * - Standard API keys (AIza*)
 * - Vertex AI via Application Default Credentials (optional)
 */
export function getGeminiClient(): GoogleGenAI {
  if (clientInstance) return clientInstance;

  if (isVertexAiEnabled()) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
    if (!project) {
      throw new Error("GOOGLE_CLOUD_PROJECT required when GOOGLE_GENAI_USE_VERTEXAI=true");
    }
    clientInstance = new GoogleGenAI({
      vertexai: true,
      project,
      location,
    });
    return clientInstance;
  }

  const apiKey = requireGeminiApiKey();
  const credentialType = detectCredentialType(apiKey);

  clientInstance = new GoogleGenAI({ apiKey });

  if (process.env.NODE_ENV === "development") {
    console.info(
      `[gemini] Client initialized (${credentialType === "auth_scoped" ? "auth-scoped OAuth key" : "standard API key"})`
    );
  }

  return clientInstance;
}

/** Reset client (useful in tests or after env change) */
export function resetGeminiClient() {
  clientInstance = null;
}

function parseJsonResponse(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonStr);
}

type GeminiGenerateResponse = {
  text?: string;
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function extractText(response: GeminiGenerateResponse): string {
  const direct = response.text?.trim();
  if (direct) return direct;

  const fromParts = (response.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  if (fromParts) return fromParts;

  throw new Error("Empty Gemini response");
}

function getFinishReason(response: GeminiGenerateResponse): string | undefined {
  return response.candidates?.[0]?.finishReason;
}

/** Strip optional models/ prefix from env overrides */
export function normalizeGeminiModelName(modelName: string): string {
  return modelName.replace(/^models\//, "").trim();
}

type GeminiCallOptions = {
  maxOutputTokens?: number;
  temperature?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateGeminiJsonOnce(
  system: string,
  user: string,
  modelName: string,
  options: GeminiCallOptions
): Promise<{ raw: unknown; text: string; finishReason?: string }> {
  const ai = getGeminiClient();
  const model = normalizeGeminiModelName(modelName);
  const response = (await ai.models.generateContent({
    model,
    contents: user,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      temperature: options.temperature ?? 0.3,
      ...(options.maxOutputTokens != null
        ? { maxOutputTokens: options.maxOutputTokens }
        : {}),
    },
  })) as GeminiGenerateResponse;

  const text = extractText(response);
  return {
    raw: response,
    text,
    finishReason: getFinishReason(response),
  };
}

export async function callGeminiJson(
  system: string,
  user: string,
  modelName: string,
  options: GeminiCallOptions = {}
): Promise<unknown> {
  const baseTokens = options.maxOutputTokens ?? 1024;
  const tokenSteps = [baseTokens, Math.min(baseTokens * 2, 4096)].filter(
    (value, index, arr) => index === 0 || value > arr[index - 1]!
  );

  let lastError: Error | null = null;

  for (const maxOutputTokens of tokenSteps) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { text, finishReason } = await generateGeminiJsonOnce(system, user, modelName, {
          ...options,
          maxOutputTokens,
        });

        try {
          return parseJsonResponse(text);
        } catch (parseError) {
          const truncated =
            finishReason === "MAX_TOKENS" ||
            (parseError instanceof SyntaxError && /json|JSON/i.test(parseError.message));
          lastError = parseError instanceof Error ? parseError : new Error("JSON parse failed");
          if (truncated && maxOutputTokens < tokenSteps[tokenSteps.length - 1]!) {
            break;
          }
          throw lastError;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (isGeminiRetryableError(error) && attempt === 0) {
          await sleep(800);
          continue;
        }
        if (maxOutputTokens < tokenSteps[tokenSteps.length - 1]!) {
          break;
        }
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Gemini JSON call failed");
}

export async function callGeminiText(
  system: string,
  user: string,
  modelName: string
): Promise<string> {
  const ai = getGeminiClient();
  const model = normalizeGeminiModelName(modelName);
  const response = await ai.models.generateContent({
    model,
    contents: user,
    config: {
      systemInstruction: system,
      temperature: 0.5,
    },
  });

  return extractText(response as GeminiGenerateResponse) || "Không thể giải thích.";
}

export async function transcribeAudioWithGemini(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: normalizeGeminiModelName(GEMINI_MODELS.audio),
    contents: [
      "Transcribe the following English speech accurately. Return ONLY the transcript text in English, with no labels or commentary.",
      {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: buffer.toString("base64"),
        },
      },
    ],
    config: { temperature: 0 },
  });

  return extractText(response as GeminiGenerateResponse);
}

/** @deprecated Use getGeminiClient — kept for internal clarity */
export function getClient() {
  return getGeminiClient();
}

export { getGeminiApiKey, detectCredentialType };
