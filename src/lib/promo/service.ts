import {
  BillingCycle,
  PromoBenefitType,
  SubscriptionPlan,
  type PromoCode,
} from "@prisma/client";
import { db } from "@/lib/db";
import { getPlanPrice, type PlanId } from "@/lib/subscription/plans";
import { describePromoBenefit } from "@/lib/promo/labels";

export { FREE_LIMIT_HIT_EVENT } from "@/lib/promo/events";
export { describePromoBenefit } from "@/lib/promo/labels";

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export interface PromoValidationResult {
  ok: true;
  promo: PromoCode;
  originalAmount: number;
  finalAmount: number;
  discountAmount: number;
  isFree: boolean;
}

export interface PromoValidationError {
  ok: false;
  error: string;
}

export type ValidatePromoResult = PromoValidationResult | PromoValidationError;

function isPromoInDateRange(promo: PromoCode, now = new Date()): boolean {
  if (promo.startsAt && promo.startsAt > now) return false;
  if (promo.expiresAt && promo.expiresAt < now) return false;
  return true;
}

export function calculatePromoAmounts(
  promo: Pick<PromoCode, "benefitType" | "discountPercent" | "discountAmount">,
  originalAmount: number
): { finalAmount: number; discountAmount: number; isFree: boolean } {
  if (promo.benefitType === "FREE_PERIOD") {
    return { finalAmount: 0, discountAmount: originalAmount, isFree: true };
  }

  if (promo.benefitType === "PERCENT_OFF" && promo.discountPercent) {
    const discountAmount = Math.round((originalAmount * promo.discountPercent) / 100);
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    return { finalAmount, discountAmount, isFree: finalAmount === 0 };
  }

  if (promo.benefitType === "FIXED_AMOUNT_OFF" && promo.discountAmount) {
    const discountAmount = Math.min(originalAmount, promo.discountAmount);
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    return { finalAmount, discountAmount, isFree: finalAmount === 0 };
  }

  return { finalAmount: originalAmount, discountAmount: 0, isFree: false };
}

export async function validatePromoForCheckout(
  userId: string,
  rawCode: string,
  planId: PlanId,
  billingCycle: BillingCycle
): Promise<ValidatePromoResult> {
  const code = normalizePromoCode(rawCode);
  if (!code) return { ok: false, error: "Vui lòng nhập mã ưu đãi" };

  const promo = await db.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) {
    return { ok: false, error: "Mã ưu đãi không hợp lệ hoặc đã hết hạn" };
  }

  if (!isPromoInDateRange(promo)) {
    return { ok: false, error: "Mã ưu đãi chưa có hiệu lực hoặc đã hết hạn" };
  }

  if (promo.maxRedemptions != null && promo.redemptionCount >= promo.maxRedemptions) {
    return { ok: false, error: "Mã ưu đãi đã hết lượt sử dụng" };
  }

  if (promo.plan !== planId || promo.billingCycle !== billingCycle) {
    return {
      ok: false,
      error: `Mã này chỉ áp dụng cho gói ${promo.plan === "PRO" ? "Pro" : "VIP"} (${
        promo.billingCycle === "YEARLY" ? "12 tháng" : "1 tháng"
      })`,
    };
  }

  const existing = await db.promoRedemption.findUnique({
    where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
  });
  if (existing) {
    return { ok: false, error: "Bạn đã sử dụng mã này rồi" };
  }

  const originalAmount = getPlanPrice(planId, billingCycle);
  const amounts = calculatePromoAmounts(promo, originalAmount);

  return {
    ok: true,
    promo,
    originalAmount,
    ...amounts,
  };
}

export async function recordPromoRedemption(
  promoCodeId: string,
  userId: string,
  orderId: string
) {
  await db.$transaction([
    db.promoRedemption.create({
      data: { promoCodeId, userId, orderId },
    }),
    db.promoCode.update({
      where: { id: promoCodeId },
      data: { redemptionCount: { increment: 1 } },
    }),
  ]);
}

export interface PromoOfferPayload {
  code: string;
  title: string;
  message: string;
  benefit: string;
  subscribeUrl: string;
  ctaLabel: string;
}

function buildSubscribePath(promo: PromoCode): string {
  const cycle = promo.billingCycle === "YEARLY" ? "yearly" : "monthly";
  return `/pricing/subscribe?plan=${promo.plan.toLowerCase()}&cycle=${cycle}&promo=${encodeURIComponent(promo.code)}`;
}

function promoToOffer(promo: PromoCode, options?: { forGuest?: boolean }): PromoOfferPayload {
  const subscribePath = buildSubscribePath(promo);
  const forGuest = options?.forGuest ?? false;

  return {
    code: promo.code,
    title: promo.popupTitle ?? `Mã ưu đãi ${promo.code}`,
    message:
      promo.popupMessage ??
      `Nhập mã ${promo.code} khi thanh toán để nhận ${describePromoBenefit(promo).toLowerCase()}.`,
    benefit: describePromoBenefit(promo),
    subscribeUrl: forGuest
      ? `/register?callbackUrl=${encodeURIComponent(subscribePath)}`
      : subscribePath,
    ctaLabel: forGuest ? "Đăng ký & dùng mã ✨" : "Dùng mã ngay ✨",
  };
}

async function findActivePopupPromo(now = new Date()): Promise<PromoCode | null> {
  const promos = await db.promoCode.findMany({
    where: { active: true, showInPopup: true },
    orderBy: { createdAt: "asc" },
  });

  for (const promo of promos) {
    if (!isPromoInDateRange(promo, now)) continue;
    if (promo.maxRedemptions != null && promo.redemptionCount >= promo.maxRedemptions) continue;
    return promo;
  }

  return null;
}

/** Popup offer for guest (chưa đăng nhập) — không kiểm tra redemption theo user */
export async function getPromoOfferForGuest(): Promise<PromoOfferPayload | null> {
  const promo = await findActivePopupPromo();
  if (!promo) return null;
  return promoToOffer(promo, { forGuest: true });
}

export async function getPromoOfferForUser(userId: string): Promise<PromoOfferPayload | null> {
  const { getUserPlanId } = await import("@/lib/subscription/service");
  const planId = await getUserPlanId(userId);
  if (planId !== "FREE") return null;

  const promo = await findActivePopupPromo();
  if (!promo) return null;

  const used = await db.promoRedemption.findUnique({
    where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
  });
  if (used) return null;

  return promoToOffer(promo);
}

export function parsePromoBenefitType(value: string): PromoBenefitType | null {
  const upper = value.toUpperCase();
  if (upper === "FREE_PERIOD" || upper === "PERCENT_OFF" || upper === "FIXED_AMOUNT_OFF") {
    return upper as PromoBenefitType;
  }
  return null;
}

export function parseSubscriptionPlan(value: string): SubscriptionPlan | null {
  const upper = value.toUpperCase();
  if (upper === "PRO" || upper === "VIP") return upper;
  return null;
}
