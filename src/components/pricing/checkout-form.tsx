"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaymentMethodOption, type PaymentMethodGroup } from "@/lib/payment/config";
import { createPaymentOrderAction, getPaymentRedirectUrlAction } from "@/lib/actions/subscription";
import { formatVnd, getPlan, getPlanPrice, type PlanId } from "@/lib/subscription/plans";
import { BillingCycle, PaymentMethod } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  planId: PlanId;
  billingCycle: BillingCycle;
  paymentGroups: PaymentMethodGroup[];
}

export function CheckoutForm({ planId, billingCycle, paymentGroups }: CheckoutFormProps) {
  const router = useRouter();
  const defaultMethod =
    paymentGroups.flatMap((g) => g.methods).find((m) => m === "BANK_TRANSFER") ??
    paymentGroups[0]?.methods[0] ??
    "BANK_TRANSFER";
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);
  const [pending, startTransition] = useTransition();
  const plan = getPlan(planId);
  const amount = getPlanPrice(planId, billingCycle);

  const handlePay = () => {
    startTransition(async () => {
      const created = await createPaymentOrderAction({
        plan: planId,
        billingCycle,
        method,
      });
      if ("error" in created && created.error) {
        toast.error(created.error);
        return;
      }
      if (!created.orderId) {
        toast.error("Không tạo được đơn hàng");
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
          <p className="text-2xl font-extrabold text-purple-700">{formatVnd(amount)}</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle>Phương thức thanh toán</CardTitle>
          <CardDescription>Các kênh phổ biến tại Việt Nam</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
          <Button
            className="mt-2 w-full kid-btn-fun rounded-full"
            size="lg"
            disabled={pending}
            onClick={handlePay}
          >
            {pending ? "Đang xử lý..." : "Tiếp tục thanh toán"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
