import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { completePaymentOrderAction } from "@/lib/actions/subscription";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = body as Record<string, string>;

  const secretKey = process.env.MOMO_SECRET_KEY;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  if (!secretKey || !accessKey) {
    return NextResponse.json({ message: "Not configured" }, { status: 503 });
  }

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
  const expected = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (resultCode === "0" && orderId) {
    await completePaymentOrderAction(orderId, transId);
  }

  return NextResponse.json({ message: "OK" });
}
