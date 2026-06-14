"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireAdminPermission } from "@/lib/admin/access";
import { db } from "@/lib/db";
import {
  BillingCycle,
  PaymentMethod,
  PaymentStatus,
  SubscriptionPlan,
} from "@prisma/client";
import {
  getPlanPrice,
  parseBillingCycle,
  parsePlanId,
} from "@/lib/subscription/plans";
import { activateSubscription } from "@/lib/subscription/service";
import {
  recordPromoRedemption,
  validatePromoForCheckout,
} from "@/lib/promo/service";
import {
  createVnpayPaymentUrl,
  vnpayBankCodeForMethod,
} from "@/lib/payment/vnpay";
import { getAppBaseUrl, isMomoConfigured, isVnpayConfigured, isZaloPayConfigured, isShopeePayConfigured } from "@/lib/payment/config";
import { createZaloPayRedirectUrl } from "@/lib/payment/zalopay";
import crypto from "crypto";

function generateTransferCode(): string {
  return `CAMBA${Date.now().toString(36).toUpperCase()}`;
}

export async function createPaymentOrderAction(input: {
  plan: string;
  billingCycle: string;
  method: PaymentMethod;
  promoCode?: string;
}) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const planId = parsePlanId(input.plan);
  const cycle = parseBillingCycle(input.billingCycle);
  if (!planId || planId === "FREE") return { error: "Gói không hợp lệ" };
  if (!cycle) return { error: "Chu kỳ thanh toán không hợp lệ" };

  let amount = getPlanPrice(planId, cycle);
  let originalAmount: number | undefined;
  let promoCodeId: string | undefined;

  if (input.promoCode?.trim()) {
    const promoResult = await validatePromoForCheckout(
      session.user.id,
      input.promoCode,
      planId,
      cycle
    );
    if (!promoResult.ok) return { error: promoResult.error };
    amount = promoResult.finalAmount;
    originalAmount = promoResult.originalAmount;
    promoCodeId = promoResult.promo.id;
  }

  const transferCode = generateTransferCode();

  const order = await db.paymentOrder.create({
    data: {
      userId: session.user.id,
      plan: planId as SubscriptionPlan,
      billingCycle: cycle as BillingCycle,
      amount,
      originalAmount,
      promoCodeId,
      method: input.method,
      transferCode,
    },
  });

  revalidatePath("/pricing");
  return {
    orderId: order.id,
    transferCode: order.transferCode,
    isFree: amount === 0,
  };
}

export async function getPaymentRedirectUrlAction(orderId: string) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const order = await db.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return { error: "Không tìm thấy đơn hàng" };
  }
  if (order.status !== PaymentStatus.PENDING) {
    return { error: "Đơn hàng đã được xử lý" };
  }

  const planLabel = order.plan === "PRO" ? "Camba Pro" : "Camba VIP";
  const cycleLabel = order.billingCycle === "YEARLY" ? "năm" : "tháng";
  const orderInfo = `${planLabel} - ${cycleLabel}`;

  if (
    order.method === "VNPAY" ||
    order.method === "VISA" ||
    order.method === "ATM" ||
    order.method === "QR"
  ) {
    const url = createVnpayPaymentUrl({
      orderId: order.id,
      amount: order.amount,
      orderInfo,
      bankCode: vnpayBankCodeForMethod(order.method),
    });
    if (url) return { redirectUrl: url };
    if (!isVnpayConfigured()) {
      return {
        manual: true,
        message: "VNPay chưa được cấu hình. Vui lòng chọn chuyển khoản ngân hàng.",
      };
    }
  }

  if (order.method === "MOMO") {
    if (!isMomoConfigured()) {
      return {
        manual: true,
        message: "MoMo chưa được cấu hình. Vui lòng chọn chuyển khoản ngân hàng.",
      };
    }
    const baseUrl = getAppBaseUrl();
    const partnerCode = process.env.MOMO_PARTNER_CODE!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    const secretKey = process.env.MOMO_SECRET_KEY!;
    const requestId = order.id;
    const orderIdMomo = order.id;
    const requestType = "captureWallet";
    const extraData = "";
    const rawSignature = `accessKey=${accessKey}&amount=${order.amount}&extraData=${extraData}&ipnUrl=${baseUrl}/api/payment/momo/ipn&orderId=${orderIdMomo}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${baseUrl}/pricing/payment/${order.id}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const endpoint =
      process.env.MOMO_ENDPOINT ?? "https://test-payment.momo.vn/v2/gateway/api/create";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerCode,
        accessKey,
        requestId,
        amount: order.amount,
        orderId: orderIdMomo,
        orderInfo,
        redirectUrl: `${baseUrl}/pricing/payment/${order.id}`,
        ipnUrl: `${baseUrl}/api/payment/momo/ipn`,
        extraData,
        requestType,
        signature,
        lang: "vi",
      }),
    });

    const data = (await res.json()) as { payUrl?: string; message?: string };
    if (data.payUrl) return { redirectUrl: data.payUrl };
    return { error: data.message ?? "Không thể tạo link MoMo" };
  }

  if (order.method === "ZALOPAY") {
    if (!isZaloPayConfigured()) {
      return {
        manual: true,
        message: "ZaloPay chưa được cấu hình. Vui lòng chọn chuyển khoản ngân hàng.",
      };
    }
    const url = await createZaloPayRedirectUrl({
      orderId: order.id,
      amount: order.amount,
      description: orderInfo,
    });
    if (url) return { redirectUrl: url };
    return { error: "Không thể tạo link ZaloPay" };
  }

  if (order.method === "SHOPEEPAY") {
    if (!isShopeePayConfigured()) {
      return {
        manual: true,
        message: "ShopeePay chưa được cấu hình. Vui lòng chọn chuyển khoản ngân hàng.",
      };
    }
    return {
      manual: true,
      message: "ShopeePay: liên hệ admin để hoàn tất thanh toán hoặc chọn chuyển khoản.",
    };
  }

  return { manual: true };
}

export async function completePaymentOrderAction(
  orderId: string,
  providerRef?: string
) {
  const order = await db.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Không tìm thấy đơn hàng" };
  if (order.status === PaymentStatus.COMPLETED) return { ok: true };

  const subscription = await activateSubscription(
    order.userId,
    order.plan,
    order.billingCycle
  );

  await db.paymentOrder.update({
    where: { id: orderId },
    data: {
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
      providerRef,
      subscriptionId: subscription.id,
    },
  });

  if (order.promoCodeId) {
    const existing = await db.promoRedemption.findUnique({
      where: {
        promoCodeId_userId: { promoCodeId: order.promoCodeId, userId: order.userId },
      },
    });
    if (!existing) {
      await recordPromoRedemption(order.promoCodeId, order.userId, orderId);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { ok: true };
}

export async function completeFreePromoOrderAction(orderId: string) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const order = await db.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return { error: "Không tìm thấy đơn hàng" };
  }
  if (order.status !== PaymentStatus.PENDING) {
    return { error: "Đơn hàng đã được xử lý" };
  }
  if (order.amount !== 0 || !order.promoCodeId) {
    return { error: "Đơn hàng không áp dụng miễn phí qua mã ưu đãi" };
  }

  return completePaymentOrderAction(orderId, "promo-free");
}

export async function confirmBankTransferAction(orderId: string) {
  const { error: authError } = await requireAdminPermission("payments.manage");
  if (authError) return { error: authError };
  return completePaymentOrderAction(orderId);
}

export async function recordPracticeAnswerAction(count = 1) {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const { recordPracticeUsage } = await import("@/lib/subscription/service");
  return recordPracticeUsage(session.user.id, count);
}

export async function getSubscriptionUsageAction() {
  const session = await auth();
  if (!session) return { error: "Chưa đăng nhập" };

  const { getSubscriptionSummary } = await import("@/lib/subscription/service");
  return getSubscriptionSummary(session.user.id);
}
