type GeminiApiError = {
  status?: number;
  message?: string;
};

function parseErrorBody(message: string): { code?: number; status?: string } | null {
  try {
    const parsed = JSON.parse(message) as { error?: { code?: number; status?: string } };
    return parsed.error ?? null;
  } catch {
    return null;
  }
}

export function getGeminiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const err = error as GeminiApiError;
  if (typeof err.status === "number") return err.status;

  const body = typeof err.message === "string" ? parseErrorBody(err.message) : null;
  if (typeof body?.code === "number") return body.code;
  return undefined;
}

export function isGeminiQuotaError(error: unknown): boolean {
  const status = getGeminiErrorStatus(error);
  if (status === 429) return true;

  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.toLowerCase().includes("quota exceeded") ||
    msg.toLowerCase().includes("exceeded your current quota")
  );
}

export function formatGeminiUserError(error: unknown): string {
  if (isGeminiQuotaError(error)) {
    return "Đã hết quota Gemini free tier hôm nay (Writing, Speaking và Giải thích dùng chung). Bật billing trên Google AI Studio để tăng giới hạn, hoặc thử lại sau.";
  }

  const status = getGeminiErrorStatus(error);
  const msg = error instanceof Error ? error.message : String(error);

  if (status === 404 || msg.toLowerCase().includes("not found")) {
    return "Model Gemini không khả dụng. Kiểm tra GEMINI_MODEL_EXPLAIN trong .env.";
  }

  if (
    status === 401 ||
    status === 403 ||
    msg.includes("API key") ||
    msg.toLowerCase().includes("permission")
  ) {
    return "Không thể gọi Gemini. Kiểm tra GOOGLE_AI_API_KEY.";
  }

  return "Không thể giải thích lúc này. Thử lại sau.";
}
