import { NextRequest, NextResponse } from "next/server";
import { verifyVnpayReturn } from "@/lib/payment/vnpay";
import { completePaymentOrderAction } from "@/lib/actions/subscription";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = verifyVnpayReturn(params);

  if (!result.valid || !result.orderId) {
    return NextResponse.redirect(new URL("/pricing?payment=invalid", req.url));
  }

  if (result.success) {
    await completePaymentOrderAction(result.orderId, result.transactionNo);
    return NextResponse.redirect(
      new URL(`/pricing/payment/${result.orderId}?status=success`, req.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/pricing/payment/${result.orderId}?status=failed`, req.url)
  );
}
