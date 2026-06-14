export const FREE_LIMIT_HIT_EVENT = "camba:free-limit-hit";

export function notifyFreeLimitHit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FREE_LIMIT_HIT_EVENT));
}
