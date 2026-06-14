import Link from "next/link";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd, getPlan } from "@/lib/subscription/plans";
import { getPaymentMethodLabel } from "@/lib/payment/config";
import { requireAdminPage } from "@/lib/admin/access";

export default async function AdminPaymentsPage() {
  const { access } = await requireAdminPage("payments.manage");

  const orders = await db.paymentOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNav currentPath="/admin/payments" permissions={access.permissions} />
      <h1 className="mb-6 text-2xl font-bold">Thanh toán & gói</h1>
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-muted-foreground">Chưa có đơn hàng.</p>
          ) : (
            orders.map((order) => {
              const plan = getPlan(order.plan);
              return (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {order.user.name ?? order.user.email} — {plan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatVnd(order.amount)} · {getPaymentMethodLabel(order.method)} ·{" "}
                      {order.createdAt.toLocaleString("vi-VN")}
                    </p>
                    {order.transferCode && (
                      <p className="text-xs font-mono text-purple-700">CK: {order.transferCode}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={order.status === "COMPLETED" ? "success" : "outline"}>
                      {order.status}
                    </Badge>
                    {order.status === "PENDING" && (
                      <Button asChild size="sm">
                        <Link href={`/pricing/payment/${order.id}`}>Xử lý</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
