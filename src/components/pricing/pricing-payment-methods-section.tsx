import {
  getAvailablePaymentGroups,
  getPaymentMethodOption,
} from "@/lib/payment/config";
import { PricingSignupNote } from "@/components/pricing/pricing-signup-note";

export async function PricingPaymentMethodsSection() {
  const paymentGroups = await getAvailablePaymentGroups();

  return (
    <section className="mt-16 rounded-3xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <h2 className="text-2xl font-extrabold text-purple-800">Phương thức thanh toán</h2>
      <p className="mt-2 text-muted-foreground">
        Hiện hỗ trợ chuyển khoản ngân hàng (VietQR)
      </p>
      {paymentGroups.length === 0 ? (
        <p className="mt-4 text-sm text-amber-800">
          Chưa cấu hình tài khoản nhận tiền. Liên hệ admin.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {paymentGroups.map((group) => (
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
      )}
      <PricingSignupNote />
    </section>
  );
}
