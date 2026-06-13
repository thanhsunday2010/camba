/** Google AI Studio (Gemini) configuration — supports standard & auth-scoped keys */

export type GeminiCredentialType = "auth_scoped" | "standard" | "vertex_adc";

/** Auth-scoped keys (OAuth-bound) from AI Studio typically start with "AQ." */
export function detectCredentialType(key: string): GeminiCredentialType {
  if (key.startsWith("AQ.")) return "auth_scoped";
  if (key.startsWith("AIza")) return "standard";
  return "standard";
}

/** Resolve API key from env (supports AI Studio auth keys and legacy standard keys) */
export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    undefined
  );
}

export function requireGeminiApiKey(): string {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error(
      "Thiếu API key Gemini. Đặt GOOGLE_AI_API_KEY (hoặc GEMINI_API_KEY / GOOGLE_API_KEY) trong .env"
    );
  }
  return key;
}

export function isVertexAiEnabled(): boolean {
  return process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";
}

/** Default to Flash for lowest cost; set GEMINI_MODEL_*=gemini-2.5-pro for higher quality */
export const GEMINI_MODELS = {
  writing: process.env.GEMINI_MODEL_WRITING ?? "gemini-2.5-flash",
  speaking: process.env.GEMINI_MODEL_SPEAKING ?? "gemini-2.5-flash",
  explain: process.env.GEMINI_MODEL_EXPLAIN ?? "gemini-2.5-flash",
  audio: process.env.GEMINI_MODEL_AUDIO ?? "gemini-2.5-flash",
} as const;

export type SpeechToTextMode = "browser" | "gemini";

export function getSpeechToTextMode(): SpeechToTextMode {
  const mode = process.env.SPEECH_TO_TEXT_MODE ?? "browser";
  return mode === "gemini" ? "gemini" : "browser";
}
