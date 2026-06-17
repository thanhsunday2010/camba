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
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <SubscribePageHeader />
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/pricing">← Quay lại bảng giá</Link>
        </Button>
      </div>
      <CheckoutForm
        planId={planId}
        billingCycle={cycle}
        paymentGroups={paymentGroups}
        initialPromoCode={params.promo ?? ""}
      />
    </div>
  );
}
