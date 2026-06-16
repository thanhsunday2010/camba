import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_MODELS,
  detectCredentialType,
  getGeminiApiKey,
  requireGeminiApiKey,
  isVertexAiEnabled,
} from "./config";

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

  // Auth-scoped (AQ.) and standard (AIza) keys both use apiKey with @google/genai
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

type GeminiTextResponse = {
  text?: string;
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function extractText(response: GeminiTextResponse): string {
  const direct = response.text?.trim();
  if (direct) return direct;

  const fromParts = (response.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  if (fromParts) return fromParts;

  throw new Error("Empty Gemini response");
}

/** Strip optional models/ prefix from env overrides */
export function normalizeGeminiModelName(modelName: string): string {
  return modelName.replace(/^models\//, "").trim();
}

type GeminiCallOptions = {
  maxOutputTokens?: number;
  temperature?: number;
};

export async function callGeminiJson(
  system: string,
  user: string,
  modelName: string,
  options: GeminiCallOptions = {}
): Promise<unknown> {
  const ai = getGeminiClient();
  const model = normalizeGeminiModelName(modelName);
  const response = await ai.models.generateContent({
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
  });

  return parseJsonResponse(extractText(response));
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

  return extractText(response) || "Không thể giải thích.";
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

  return extractText(response);
}

/** @deprecated Use getGeminiClient — kept for internal clarity */
export function getClient() {
  return getGeminiClient();
}

export { getGeminiApiKey, detectCredentialType };
