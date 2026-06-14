"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { requireSuperAdmin } from "@/lib/admin/access";
import { db } from "@/lib/db";
import {
  getPromoOfferForUser,
  normalizePromoCode,
  parsePromoBenefitType,
  parseSubscriptionPlan,
  validatePromoForCheckout,
} from "@/lib/promo/service";
import { describePromoBenefit } from "@/lib/promo/labels";
import { parseBillingCycle, parsePlanId } from "@/lib/subscription/plans";
import { BillingCycle, PromoBenefitType, SubscriptionPlan } from "@prisma/client";

export async function validatePromoCodeAction(input: {
  code: string;
  plan: string;
  billingCycle: string;
}) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const planId = parsePlanId(input.plan);
  const cycle = parseBillingCycle(input.billingCycle);
  if (!planId || planId === "FREE" || !cycle) {
    return { error: "Gói hoặc chu kỳ không hợp lệ" };
  }

  const result = await validatePromoForCheckout(
    session.user.id,
    input.code,
    planId,
    cycle
  );

  if (!result.ok) return { error: result.error };

  return {
    valid: true,
    code: result.promo.code,
    benefit: describePromoBenefit(result.promo),
    originalAmount: result.originalAmount,
    finalAmount: result.finalAmount,
    discountAmount: result.discountAmount,
    isFree: result.isFree,
  };
}

export async function getPromoOfferAction() {
  const session = await auth();
  if (!session) return { offer: null };
  const offer = await getPromoOfferForUser(session.user.id);
  return { offer };
}

const promoFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2).max(32),
  description: z.string().optional(),
  plan: z.enum(["PRO", "VIP"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  benefitType: z.enum(["FREE_PERIOD", "PERCENT_OFF", "FIXED_AMOUNT_OFF"]),
  discountPercent: z.coerce.number().int().min(1).max(100).optional(),
  discountAmount: z.coerce.number().int().min(0).optional(),
  maxRedemptions: z.coerce.number().int().min(1).optional().nullable(),
  active: z.coerce.boolean(),
  showInPopup: z.coerce.boolean(),
  popupTitle: z.string().optional(),
  popupMessage: z.string().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function listPromoCodesAction() {
  const denied = await requireSuperAdmin();
  if (denied) return { error: denied };

  const codes = await db.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return { codes };
}

export async function upsertPromoCodeAction(formData: FormData) {
  const denied = await requireSuperAdmin();
  if (denied) return { error: denied };

  const raw = {
    id: (formData.get("id") as string) || undefined,
    code: formData.get("code") as string,
    description: (formData.get("description") as string) || undefined,
    plan: formData.get("plan") as string,
    billingCycle: formData.get("billingCycle") as string,
    benefitType: formData.get("benefitType") as string,
    discountPercent: formData.get("discountPercent") || undefined,
    discountAmount: formData.get("discountAmount") || undefined,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    active: formData.get("active") === "true" || formData.get("active") === "on",
    showInPopup: formData.get("showInPopup") === "true" || formData.get("showInPopup") === "on",
    popupTitle: (formData.get("popupTitle") as string) || undefined,
    popupMessage: (formData.get("popupMessage") as string) || undefined,
    startsAt: (formData.get("startsAt") as string) || undefined,
    expiresAt: (formData.get("expiresAt") as string) || undefined,
  };

  const parsed = promoFormSchema.safeParse(raw);
  if (!parsed.success) return { error: "Dữ liệu mã ưu đãi không hợp lệ" };

  const data = parsed.data;
  const code = normalizePromoCode(data.code);
  const benefitType = parsePromoBenefitType(data.benefitType);
  const plan = parseSubscriptionPlan(data.plan);
  const billingCycle =
    data.billingCycle === "YEARLY" ? BillingCycle.YEARLY : BillingCycle.MONTHLY;

  if (!benefitType || !plan) return { error: "Loại ưu đãi hoặc gói không hợp lệ" };

  if (benefitType === PromoBenefitType.PERCENT_OFF && !data.discountPercent) {
    return { error: "Cần nhập % giảm giá" };
  }
  if (benefitType === PromoBenefitType.FIXED_AMOUNT_OFF && data.discountAmount == null) {
    return { error: "Cần nhập số tiền giảm" };
  }

  const payload = {
    code,
    description: data.description?.trim() || null,
    plan: plan as SubscriptionPlan,
    billingCycle,
    benefitType,
    discountPercent:
      benefitType === PromoBenefitType.PERCENT_OFF ? data.discountPercent : null,
    discountAmount:
      benefitType === PromoBenefitType.FIXED_AMOUNT_OFF ? data.discountAmount : null,
    maxRedemptions: data.maxRedemptions ?? null,
    active: data.active,
    showInPopup: data.showInPopup,
    popupTitle: data.popupTitle?.trim() || null,
    popupMessage: data.popupMessage?.trim() || null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  };

  if (data.id) {
    const existing = await db.promoCode.findUnique({ where: { id: data.id } });
    if (!existing) return { error: "Không tìm thấy mã" };

    const duplicate = await db.promoCode.findFirst({
      where: { code, NOT: { id: data.id } },
    });
    if (duplicate) return { error: "Mã đã tồn tại" };

    await db.promoCode.update({ where: { id: data.id }, data: payload });
  } else {
    const duplicate = await db.promoCode.findUnique({ where: { code } });
    if (duplicate) return { error: "Mã đã tồn tại" };
    await db.promoCode.create({ data: payload });
  }

  revalidatePath("/admin/promo");
  return { ok: true };
}

export async function deletePromoCodeAction(id: string) {
  const denied = await requireSuperAdmin();
  if (denied) return { error: denied };

  const redemptions = await db.promoRedemption.count({ where: { promoCodeId: id } });
  if (redemptions > 0) {
    await db.promoCode.update({ where: { id }, data: { active: false } });
    revalidatePath("/admin/promo");
    return { ok: true, deactivated: true };
  }

  await db.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promo");
  return { ok: true };
}
