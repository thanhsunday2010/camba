import type { PromoCode } from "@prisma/client";

export function describePromoBenefit(
  promo: Pick<
    PromoCode,
    "plan" | "billingCycle" | "benefitType" | "discountPercent" | "discountAmount"
  >
): string {
  const planLabel = promo.plan === "PRO" ? "Pro" : "VIP";
  const cycleLabel = promo.billingCycle === "YEARLY" ? "12 tháng" : "1 tháng";

  if (promo.benefitType === "FREE_PERIOD") {
    return `Miễn phí gói ${planLabel} ${cycleLabel}`;
  }
  if (promo.benefitType === "PERCENT_OFF" && promo.discountPercent) {
    return `Giảm ${promo.discountPercent}% gói ${planLabel} (${cycleLabel})`;
  }
  if (promo.benefitType === "FIXED_AMOUNT_OFF" && promo.discountAmount) {
    return `Giảm ${promo.discountAmount.toLocaleString("vi-VN")}đ gói ${planLabel} (${cycleLabel})`;
  }
  return `Ưu đãi gói ${planLabel}`;
}
