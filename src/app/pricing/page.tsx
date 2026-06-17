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
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 flex flex-col items-center text-center">
        <CambaMascot size="lg" mood="happy" className="mb-4" />
        <PricingPageHero />
      </div>

      <PricingTable />

      <Suspense fallback={null}>
        <PricingPaymentMethodsSection />
      </Suspense>
    </div>
  );
}
