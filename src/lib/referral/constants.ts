export const REFERRAL_COOKIE_NAME = "camba_ref";
export const REFERRAL_WELCOME_COOKIE = "camba_ref_welcome";
/** Cookie lưu mã giới thiệu — 30 ngày */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const REFERRAL_BUTTON_LABEL = "Giới thiệu App";
export const REFERRAL_TAGLINE = "Người đăng ký mới được tặng 1 tháng Camba Pro";

export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
