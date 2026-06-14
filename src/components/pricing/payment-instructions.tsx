"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPaymentMethodLabel, getBankTransferConfig } from "@/lib/payment/config";
import { getVietQrImageUrl } from "@/lib/payment/vietqr";
import { formatVnd, getPlan } from "@/lib/subscription/plans";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { confirmBankTransferAction } from "@/lib/actions/subscription";
import Link from "next/link";

interface PaymentInstructionsProps {
  order: {
    id: string;
    plan: string;
    billingCycle: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transferCode: string | null;
    paidAt: Date | null;
  };
  isAdmin?: boolean;
  paymentStatus?: string | null;
}

export function PaymentInstructions({ order, isAdmin, paymentStatus }: PaymentInstructionsProps) {
  const [pending, startTransition] = useTransition();
  const bank = getBankTransferConfig();
  const plan = getPlan(order.plan as "FREE" | "PRO" | "VIP");
  const transferContent = order.transferCode ?? order.id.slice(-8).toUpperCase();
  const vietQrUrl =
    order.status === "PENDING"
      ? getVietQrImageUrl({ amount: order.amount, transferCode: transferContent })
      : null;

  const confirmAdmin = () => {
    startTransition(async () => {
      const res = await confirmBankTransferAction(order.id);
      if ("error" in res && res.error) toast.error(res.error);
      else toast.success("Đã kích hoạt gói cho học sinh");
    });
  };

  return (
    <div className="space-y-6">
      {paymentStatus === "success" && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-semibold text-emerald-800">
          ✅ Thanh toán thành công! Gói {plan.name} đã được kích hoạt.
        </div>
      )}
      {paymentStatus === "failed" && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 font-semibold text-red-800">
          Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác.
        </div>
      )}

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Đơn hàng #{order.id.slice(-8).toUpperCase()}
            <Badge variant={order.status === "COMPLETED" ? "success" : "outline"}>
              {order.status === "COMPLETED" ? "Đã thanh toán" : "Chờ thanh toán"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {plan.name} · {order.billingCycle === "YEARLY" ? "12 tháng" : "1 tháng"} ·{" "}
            {getPaymentMethodLabel(order.method)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-extrabold text-purple-700">{formatVnd(order.amount)}</p>

          {order.status === "PENDING" && order.method === "BANK_TRANSFER" && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm space-y-2">
              <p className="font-bold text-amber-900">🏦 Chuyển khoản ngân hàng</p>
              <p>
                <strong>Ngân hàng:</strong> {bank.bankName}
                {bank.branch && ` — ${bank.branch}`}
              </p>
              <p>
                <strong>Số tài khoản:</strong> {bank.accountNumber}
              </p>
              <p>
                <strong>Chủ tài khoản:</strong> {bank.accountName}
              </p>
              <p>
                <strong>Số tiền:</strong> {formatVnd(order.amount)}
              </p>
              <p className="font-bold text-purple-800">
                <strong>Nội dung CK:</strong> {transferContent}
              </p>
              {vietQrUrl && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <p className="font-semibold text-amber-900">Quét mã VietQR</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vietQrUrl}
                    alt="Mã QR chuyển khoản VietQR"
                    className="max-w-[220px] rounded-lg border bg-white p-2"
                  />
                </div>
              )}
              <p className="text-muted-foreground">
                Sau khi chuyển khoản, gói sẽ được kích hoạt trong 1–24 giờ. Liên hệ hỗ trợ nếu cần
                gấp.
              </p>
            </div>
          )}

          {order.status === "PENDING" &&
            (order.method === "QR" || order.method === "BANK_TRANSFER") &&
            vietQrUrl &&
            order.method === "QR" && (
              <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4 text-center">
                <p className="mb-2 font-bold text-sky-900">📱 Quét QR VietQR</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vietQrUrl}
                  alt="Mã QR thanh toán"
                  className="mx-auto max-w-[220px] rounded-lg border bg-white p-2"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Nội dung: <strong>{transferContent}</strong> · {formatVnd(order.amount)}
                </p>
              </div>
            )}

          {order.status === "PENDING" &&
            order.method !== "BANK_TRANSFER" &&
            order.method !== "QR" &&
            paymentStatus !== "success" && (
              <p className="text-sm text-muted-foreground">
                Nếu cổng thanh toán chưa mở, bạn có thể quay lại chọn <strong>Chuyển khoản</strong>{" "}
                hoặc liên hệ admin.
              </p>
            )}

          {order.status === "COMPLETED" && order.paidAt && (
            <p className="text-sm text-emerald-700">
              Đã thanh toán lúc {new Date(order.paidAt).toLocaleString("vi-VN")}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard">Về trang chủ</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/pricing">Xem bảng giá</Link>
            </Button>
            {isAdmin && order.status === "PENDING" && (
              <Button
                className="rounded-full"
                disabled={pending}
                onClick={confirmAdmin}
              >
                {pending ? "..." : "Admin: Xác nhận đã nhận tiền"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
