import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { PaymentInstructions } from "@/components/pricing/payment-instructions";

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
      return (
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <PaymentInstructions
            order={adminOrder}
            isAdmin
            paymentStatus={query.status}
          />
        </div>
      );
    }
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-extrabold kid-gradient-text">Thanh toán</h1>
      <PaymentInstructions
        order={order}
        isAdmin={session.user.role === "ADMIN"}
        paymentStatus={query.status}
      />
    </div>
  );
}
