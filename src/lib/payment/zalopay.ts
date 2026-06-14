import crypto from "crypto";
import { getAppBaseUrl, isZaloPayConfigured } from "@/lib/payment/config";

/** ZaloPay requires server-side create then redirect */
export async function createZaloPayRedirectUrl(params: {
  orderId: string;
  amount: number;
  description: string;
}): Promise<string | null> {
  if (!isZaloPayConfigured()) return null;

  const appId = process.env.ZALOPAY_APP_ID!;
  const key1 = process.env.ZALOPAY_KEY1!;
  const endpoint =
    process.env.ZALOPAY_ENDPOINT ?? "https://sb-openapi.zalopay.vn/v2/create";

  const embedData = JSON.stringify({
    redirecturl: `${getAppBaseUrl()}/pricing/payment/${params.orderId}`,
  });
  const items = JSON.stringify([
    { itemid: params.orderId, itemname: params.description, itemprice: params.amount },
  ]);
  const appTransId = `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${params.orderId.slice(-8)}`;
  const appTime = Date.now();
  const rawSignature = `${appId}|${appTransId}|${params.description}|${embedData}|${appTime}|${params.amount}|${key1}`;
  const mac = crypto.createHmac("sha256", key1).update(rawSignature).digest("hex");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      app_id: appId,
      app_trans_id: appTransId,
      app_user: "camba_user",
      app_time: String(appTime),
      amount: String(params.amount),
      item: items,
      description: params.description,
      embed_data: embedData,
      bank_code: "",
      mac,
    }),
  });

  const data = (await res.json()) as { order_url?: string; return_code?: number };
  if (data.return_code === 1 && data.order_url) return data.order_url;
  return null;
}
