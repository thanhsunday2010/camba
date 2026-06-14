"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPaymentMethodOption, type PaymentMethodGroup } from "@/lib/payment/config";
import {
  completeFreePromoOrderAction,
  createPaymentOrderAction,
  getPaymentRedirectUrlAction,
} from "@/lib/actions/subscription";
import { validatePromoCodeAction } from "@/lib/actions/promo";
import { formatVnd, getPlan, getPlanPrice, type PlanId } from "@/lib/subscription/plans";
import { BillingCycle, PaymentMethod } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  planId: PlanId;
  billingCycle: BillingCycle;
  paymentGroups: PaymentMethodGroup[];
  initialPromoCode?: string;
}

interface AppliedPromo {
  code: string;
  benefit: string;
  originalAmount: number;
  finalAmount: number;
  discountAmount: number;
  isFree: boolean;
}

export function CheckoutForm({
  planId,
  billingCycle,
  paymentGroups,
  initialPromoCode = "",
}: CheckoutFormProps) {
  const router = useRouter();
  const defaultMethod =
    paymentGroups.flatMap((g) => g.methods).find((m) => m === "BANK_TRANSFER") ??
    paymentGroups[0]?.methods[0] ??
    "BANK_TRANSFER";
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);
  const [promoInput, setPromoInput] = useState(initialPromoCode);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [validatingPromo, startValidatePromo] = useTransition();
  const [pending, startTransition] = useTransition();
  const plan = getPlan(planId);
  const listAmount = getPlanPrice(planId, billingCycle);
  const displayAmount = appliedPromo?.finalAmount ?? listAmount;

  useEffect(() => {
    if (initialPromoCode.trim()) {
      startValidatePromo(async () => {
        const res = await validatePromoCodeAction({
          code: initialPromoCode,
          plan: planId,
          billingCycle,
        });
        if ("valid" in res && res.valid) {
          setAppliedPromo({
            code: res.code!,
            benefit: res.benefit!,
            originalAmount: res.originalAmount!,
            finalAmount: res.finalAmount!,
            discountAmount: res.discountAmount!,
            isFree: res.isFree!,
          });
        }
      });
    }
  }, [initialPromoCode, planId, billingCycle]);

  const handleApplyPromo = () => {
    startValidatePromo(async () => {
      const res = await validatePromoCodeAction({
        code: promoInput,
        plan: planId,
        billingCycle,
      });
      if ("error" in res && res.error) {
        toast.error(res.error);
        setAppliedPromo(null);
        return;
      }
      if ("valid" in res && res.valid) {
        setAppliedPromo({
          code: res.code!,
          benefit: res.benefit!,
          originalAmount: res.originalAmount!,
          finalAmount: res.finalAmount!,
          discountAmount: res.discountAmount!,
          isFree: res.isFree!,
        });
        toast.success(`Đã áp mã ${res.code}`);
      }
    });
  };

  const handlePay = () => {
    startTransition(async () => {
      const created = await createPaymentOrderAction({
        plan: planId,
        billingCycle,
        method,
        promoCode: (appliedPromo?.code ?? promoInput.trim()) || undefined,
      });
      if ("error" in created && created.error) {
        toast.error(created.error);
        return;
      }
      if (!created.orderId) {
        toast.error("Không tạo được đơn hàng");
        return;
      }

      if (created.isFree) {
        const free = await completeFreePromoOrderAction(created.orderId);
        if ("error" in free && free.error) {
          toast.error(free.error);
          return;
        }
        toast.success("Kích hoạt gói thành công!");
        router.push("/dashboard?promo=success");
        router.refresh();
        return;
      }

      const redirect = await getPaymentRedirectUrlAction(created.orderId);
      if ("error" in redirect && redirect.error) {
        toast.error(redirect.error);
        return;
      }
      if ("message" in redirect && redirect.message) {
        toast.info(redirect.message);
      }
      if ("redirectUrl" in redirect && redirect.redirectUrl) {
        window.location.href = redirect.redirectUrl;
        return;
      }

      router.push(`/pricing/payment/${created.orderId}`);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle>Thông tin gói</CardTitle>
          <CardDescription>Xác nhận trước khi thanh toán</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Gói:</strong> {plan.name}
          </p>
          <p>
            <strong>Chu kỳ:</strong> {billingCycle === "YEARLY" ? "12 tháng" : "1 tháng"}
          </p>
          {appliedPromo && appliedPromo.discountAmount > 0 && (
            <p className="text-muted-foreground line-through">{formatVnd(appliedPromo.originalAmount)}</p>
          )}
          <p className="text-2xl font-extrabold text-purple-700">
            {displayAmount === 0 ? "Miễn phí" : formatVnd(displayAmount)}
          </p>
          {appliedPromo && (
            <p className="text-xs font-semibold text-green-700">
              {appliedPromo.benefit} · Mã {appliedPromo.code}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle>Phương thức thanh toán</CardTitle>
          <CardDescription>Các kênh phổ biến tại Việt Nam</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2 rounded-xl border-2 border-purple-100 bg-purple-50/40 p-3">
            <Label htmlFor="promo-code" className="text-sm font-bold text-purple-800">
              Mã ưu đãi
            </Label>
            <div className="flex gap-2">
              <Input
                id="promo-code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="VD: CAMBA"
                className="rounded-full border-purple-200"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-full"
                disabled={validatingPromo || !promoInput.trim()}
                onClick={handleApplyPromo}
              >
                {validatingPromo ? "..." : "Áp dụng"}
              </Button>
            </div>
          </div>

          {!appliedPromo?.isFree && (
            <>
              {paymentGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có phương thức thanh toán. Vui lòng liên hệ admin.
                </p>
              ) : (
                paymentGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-sm font-extrabold text-purple-800">{group.title}</p>
                    {group.description && (
                      <p className="mb-2 text-xs text-muted-foreground">{group.description}</p>
                    )}
                    <div className="space-y-2">
                      {group.methods.map((methodId) => {
                        const opt = getPaymentMethodOption(methodId);
                        if (!opt) return null;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setMethod(opt.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors",
                              method === opt.id
                                ? "border-purple-500 bg-purple-50"
                                : "border-purple-100 hover:border-purple-200"
                            )}
                          >
                            <span className="text-xl">{opt.icon}</span>
                            <span>
                              <span className="block text-sm font-bold">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          <Button
            className="mt-2 w-full kid-btn-fun rounded-full"
            size="lg"
            disabled={pending || validatingPromo || (!appliedPromo?.isFree && paymentGroups.length === 0)}
            onClick={handlePay}
          >
            {pending
              ? "Đang xử lý..."
              : appliedPromo?.isFree
                ? "Kích hoạt gói miễn phí"
                : "Tiếp tục thanh toán"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
