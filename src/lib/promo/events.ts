export const FREE_LIMIT_HIT_EVENT = "camba:free-limit-hit";
export const GUEST_PLACEMENT_LIMIT_HIT_EVENT = "camba:guest-placement-limit-hit";

export function notifyFreeLimitHit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FREE_LIMIT_HIT_EVENT));
}

export function notifyGuestPlacementLimitHit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GUEST_PLACEMENT_LIMIT_HIT_EVENT));
}
