import { Suspense } from "react";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { PricingTable } from "@/components/pricing/pricing-table";
import { PricingPaymentMethodsSection } from "@/components/pricing/pricing-payment-methods-section";

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
        <h1 className="text-4xl font-extrabold kid-gradient-text">Bảng giá Camba</h1>
        <p className="mt-3 max-w-2xl text-lg font-medium text-muted-foreground">
          Chọn gói phù hợp — luyện tập Cambridge, lượt AI chấm sửa & giải thích dùng chung mỗi ngày.
        </p>
      </div>

      <PricingTable />

      <Suspense fallback={null}>
        <PricingPaymentMethodsSection />
      </Suspense>
    </div>
  );
}
