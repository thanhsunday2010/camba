"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PLAN_ORDER,
  PLANS,
  formatVnd,
  yearlySavingsPercent,
  type PlanId,
} from "@/lib/subscription/plans";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PricingTableProps {
  currentPlanId?: PlanId;
}

export function PricingTable({ currentPlanId = "FREE" }: PricingTableProps) {
  const { data: session } = useSession();
  const [yearly, setYearly] = useState(true);
  const maxYearlySavings = Math.max(
    ...PLAN_ORDER.filter((id) => id !== "FREE").map((id) => yearlySavingsPercent(id))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex rounded-full border-2 border-purple-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            className={cn(
              "rounded-full px-5 py-2 text-sm font-bold transition-colors",
              !yearly ? "bg-purple-600 text-white" : "text-purple-700"
            )}
            onClick={() => setYearly(false)}
          >
            Theo tháng
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full px-5 py-2 text-sm font-bold transition-colors",
              yearly ? "bg-purple-600 text-white" : "text-purple-700"
            )}
            onClick={() => setYearly(true)}
          >
            Theo năm
          </button>
        </div>
        {yearly && maxYearlySavings > 0 && (
          <p className="text-sm font-semibold text-emerald-700">
            Tiết kiệm đến {maxYearlySavings}% khi trả theo năm 🎉
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = currentPlanId === planId;
          const price = yearly ? plan.pricing.yearly : plan.pricing.monthly;
          const savings = yearly ? yearlySavingsPercent(planId) : 0;
          const cycle = yearly ? "yearly" : "monthly";

          return (
            <Card
              key={planId}
              className={cn(
                "relative flex flex-col border-2 transition-shadow hover:shadow-lg",
                plan.highlighted
                  ? "border-purple-400 bg-gradient-to-b from-purple-50 to-white shadow-md"
                  : "border-purple-100"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                  Phổ biến nhất
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-extrabold">{plan.name}</CardTitle>
                <CardDescription className="font-medium">{plan.tagline}</CardDescription>
                <div className="pt-2">
                  {planId === "FREE" ? (
                    <p className="text-3xl font-extrabold text-emerald-600">Miễn phí</p>
                  ) : (
                    <>
                      <p className="text-3xl font-extrabold text-purple-700">
                        {formatVnd(price)}
                        <span className="text-base font-semibold text-muted-foreground">
                          /{yearly ? "năm" : "tháng"}
                        </span>
                      </p>
                      {yearly && savings > 0 && (
                        <p className="mt-1 text-sm font-semibold text-emerald-600">
                          Tiết kiệm {savings}% so với trả 12 tháng
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                {isCurrent ? (
                  <Button disabled className="w-full rounded-full" variant="outline">
                    Gói hiện tại ✓
                  </Button>
                ) : planId === "FREE" ? (
                  <Button asChild className="w-full rounded-full" variant="outline">
                    <Link href={session ? "/dashboard" : "/register"}>
                      {session ? "Dùng miễn phí" : "Đăng ký miễn phí"}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full kid-btn-fun rounded-full">
                    <Link href={session ? `/pricing/subscribe?plan=${plan.slug}&cycle=${cycle}` : `/login?callbackUrl=/pricing/subscribe?plan=${plan.slug}%26cycle=${cycle}`}>
                      Nâng cấp {plan.name}
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
