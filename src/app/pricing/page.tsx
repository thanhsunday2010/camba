import { Suspense } from "react";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { PricingTable } from "@/components/pricing/pricing-table";
import { PricingPaymentMethodsSection } from "@/components/pricing/pricing-payment-methods-section";
import { PricingPageHero } from "@/components/inline-edit/page-editable-sections";

export const metadata = {
  title: "Bảng giá | Camba",
  description: "Gói Free, Pro, VIP — luyện thi Cambridge với AI chấm sửa",
};

export const revalidate = 3600;

export default function PricingPage() {
  return (
    <div className="page-shell">
      <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
        <CambaMascot size="lg" mood="happy" className="mb-3 sm:mb-4" />
        <PricingPageHero />
      </div>

      <PricingTable />

      <Suspense fallback={null}>
        <PricingPaymentMethodsSection />
      </Suspense>
    </div>
  );
}
