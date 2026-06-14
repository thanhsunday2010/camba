import { getAppBaseUrl } from "@/lib/payment/config";

export function buildReferralRegisterUrl(referralCode: string): string {
  const base = getAppBaseUrl();
  return `${base}/register?ref=${encodeURIComponent(referralCode)}`;
}

export function buildReferralShareMessage(referralCode: string): string {
  const url = buildReferralRegisterUrl(referralCode);
  return `Tham gia Camba — luyện thi Cambridge với AI! Đăng ký qua link này để nhận Camba Pro 1 tháng miễn phí: ${url}`;
}
