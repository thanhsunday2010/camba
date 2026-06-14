import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-session";
import { parseBillingCycle, parsePlanId } from "@/lib/subscription/plans";
import { getAvailablePaymentGroups } from "@/lib/payment/config";
import { CheckoutForm } from "@/components/pricing/checkout-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/pricing");

  const params = await searchParams;
  const planId = parsePlanId(params.plan);
  const cycle = parseBillingCycle(params.cycle) ?? "MONTHLY";

  if (!planId || planId === "FREE") {
    redirect("/pricing");
  }

  const paymentGroups = getAvailablePaymentGroups();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold kid-gradient-text">Thanh toán gói</h1>
          <p className="mt-1 text-muted-foreground">Bước cuối để nâng cấp tài khoản</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/pricing">← Quay lại bảng giá</Link>
        </Button>
      </div>
      <CheckoutForm planId={planId} billingCycle={cycle} paymentGroups={paymentGroups} />
    </div>
  );
}
