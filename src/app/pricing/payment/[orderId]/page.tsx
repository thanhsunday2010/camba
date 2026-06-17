import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { PaymentInstructions } from "@/components/pricing/payment-instructions";
import { getBankTransferSettings } from "@/lib/payment/get-bank-transfer-settings";
import { getVietQrImageUrl } from "@/lib/payment/vietqr";

import { PaymentPageTitle } from "@/components/inline-edit/page-editable-sections";

async function buildPaymentView(order: {
  id: string;
  amount: number;
  status: string;
  method: string;
  transferCode: string | null;
}) {
  const bank = await getBankTransferSettings();
  const transferContent = order.transferCode ?? order.id.slice(-8).toUpperCase();
  const showQr =
    order.status === "PENDING" &&
    (order.method === "BANK_TRANSFER" || order.method === "QR");
  const vietQrUrl = showQr
    ? getVietQrImageUrl(bank, { amount: order.amount, transferCode: transferContent })
    : null;

  return { bank, transferContent, vietQrUrl };
}

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [{ orderId }, query] = await Promise.all([params, searchParams]);
  const order = await db.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    if (session.user.role === "ADMIN") {
      const adminOrder = await db.paymentOrder.findUnique({ where: { id: orderId } });
      if (!adminOrder) notFound();
      const view = await buildPaymentView(adminOrder);
      return (
        <div className="page-shell max-w-2xl">
          <PaymentInstructions
            order={adminOrder}
            bank={view.bank}
            transferContent={view.transferContent}
            vietQrUrl={view.vietQrUrl}
            isAdmin
            paymentStatus={query.status}
          />
        </div>
      );
    }
    notFound();
  }

  const view = await buildPaymentView(order);

  return (
    <div className="page-shell max-w-2xl">
      <PaymentPageTitle />
      <PaymentInstructions
        order={order}
        bank={view.bank}
        transferContent={view.transferContent}
        vietQrUrl={view.vietQrUrl}
        isAdmin={session.user.role === "ADMIN"}
        paymentStatus={query.status}
      />
    </div>
  );
}
