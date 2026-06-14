import Link from "next/link";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { PricingTable } from "@/components/pricing/pricing-table";
import { PricingSignupNote } from "@/components/pricing/pricing-signup-note";
import { PAYMENT_GROUPS, getPaymentMethodOption } from "@/lib/payment/config";

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
          Chọn gói phù hợp — luyện tập Cambridge, AI chấm Writing & Speaking mỗi ngày.
        </p>
      </div>

      <PricingTable />

      <section className="mt-16 rounded-3xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-8">
        <h2 className="text-2xl font-extrabold text-purple-800">Phương thức thanh toán</h2>
        <p className="mt-2 text-muted-foreground">
          Hỗ trợ đầy đủ các kênh phổ biến tại Việt Nam
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PAYMENT_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-xl border border-purple-100 bg-white p-4"
            >
              <p className="font-bold text-purple-800">{group.title}</p>
              {group.description && (
                <p className="mb-2 text-xs text-muted-foreground">{group.description}</p>
              )}
              <ul className="space-y-1 text-sm">
                {group.methods.map((id) => {
                  const m = getPaymentMethodOption(id);
                  if (!m) return null;
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <PricingSignupNote />
      </section>
    </div>
  );
}
