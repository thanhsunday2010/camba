const DEFAULT_AUTH_CALLBACK = "/dashboard";

/** Chỉ cho phép path nội bộ — tránh redirect sang domain khác (vd. camba.vercel.app). */
export function sanitizeAuthCallbackUrl(
  raw: string | null | undefined,
  fallback = DEFAULT_AUTH_CALLBACK
): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

/** Full reload sau login để cookie session chắc chắn được gửi lên server. */
export function redirectAfterAuth(path: string): void {
  window.location.assign(sanitizeAuthCallbackUrl(path));
}
