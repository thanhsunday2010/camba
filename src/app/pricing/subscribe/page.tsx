import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-session";
import { parseBillingCycle, parsePlanId } from "@/lib/subscription/plans";
import { getAvailablePaymentGroups } from "@/lib/payment/config";
import { CheckoutForm } from "@/components/pricing/checkout-form";
import { Button } from "@/components/ui/button";

import { SubscribePageHeader } from "@/components/inline-edit/page-editable-sections";

export const dynamic = "force-dynamic";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string; promo?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/pricing");

  const params = await searchParams;
  const planId = parsePlanId(params.plan);
  const cycle = parseBillingCycle(params.cycle) ?? "MONTHLY";

  if (!planId || planId === "FREE") {
    redirect("/pricing");
  }

  const paymentGroups = await getAvailablePaymentGroups();

  return (
    <div className="page-shell max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8 sm:gap-4">
        <div>
          <SubscribePageHeader />
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/pricing">← Quay lại bảng giá</Link>
        </Button>
      </div>
      <CheckoutForm
        planId={planId}
        initialBillingCycle={cycle}
        paymentGroups={paymentGroups}
        initialPromoCode={params.promo ?? ""}
      />
    </div>
  );
}
