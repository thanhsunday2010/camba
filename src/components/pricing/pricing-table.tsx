"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PLAN_ORDER,
  PLANS,
  formatVnd,
  type PlanId,
} from "@/lib/subscription/plans";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PricingTableProps {
  currentPlanId?: PlanId;
}

export function PricingTable({ currentPlanId: currentPlanIdProp }: PricingTableProps) {
  const { data: session } = useSession();
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>(currentPlanIdProp ?? "FREE");

  useEffect(() => {
    if (currentPlanIdProp) {
      setCurrentPlanId(currentPlanIdProp);
      return;
    }

    if (!session?.user) {
      setCurrentPlanId("FREE");
      return;
    }

    let cancelled = false;

    fetch("/api/subscription/usage")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.planId) {
          setCurrentPlanId(data.planId as PlanId);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session?.user, currentPlanIdProp]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PLAN_ORDER.map((planId) => {
        const plan = PLANS[planId];
        const isCurrent = currentPlanId === planId;
        const price = plan.pricing.monthly;

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
                <CardTitle className="font-extrabold">{plan.name}</CardTitle>
                <CardDescription className="font-medium">{plan.tagline}</CardDescription>
                <div className="pt-2">
                  {planId === "FREE" ? (
                    <p className="page-stat-value text-emerald-600">Miễn phí</p>
                  ) : (
                    <>
                      <p className="page-stat-value text-purple-700">
                        {formatVnd(price)}
                        <span className="text-sm font-semibold text-muted-foreground sm:text-base">
                          /tháng
                        </span>
                      </p>
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
                    <Link
                      href={
                        session
                          ? `/pricing/subscribe?plan=${plan.slug}`
                          : `/login?callbackUrl=/pricing/subscribe?plan=${plan.slug}`
                      }
                    >
                      Nâng cấp {plan.name}
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
    </div>
  );
}
