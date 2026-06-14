import crypto from "crypto";
import { getAppBaseUrl, isVnpayConfigured } from "@/lib/payment/config";

function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = obj[key];
        return acc;
      },
      {} as Record<string, string>
    );
}

function buildSecureHash(data: Record<string, string>, secret: string): string {
  const sorted = sortObject(data);
  const signData = new URLSearchParams(sorted).toString();
  return crypto.createHmac("sha512", secret).update(signData).digest("hex");
}

export function createVnpayPaymentUrl(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
  bankCode?: string;
}): string | null {
  if (!isVnpayConfigured()) return null;

  const tmnCode = process.env.VNPAY_TMN_CODE!;
  const hashSecret = process.env.VNPAY_HASH_SECRET!;
  const vnpUrl = process.env.VNPAY_URL!;
  const baseUrl = getAppBaseUrl();

  const createDate = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const vnpParams: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(params.amount * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: `${baseUrl}/api/payment/vnpay/return`,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: createDate,
  };

  if (params.bankCode) {
    vnpParams.vnp_BankCode = params.bankCode;
  }

  const secureHash = buildSecureHash(vnpParams, hashSecret);
  const query = new URLSearchParams({ ...vnpParams, vnp_SecureHash: secureHash });
  return `${vnpUrl}?${query.toString()}`;
}

export function verifyVnpayReturn(query: Record<string, string>): {
  valid: boolean;
  orderId?: string;
  success?: boolean;
  transactionNo?: string;
} {
  if (!isVnpayConfigured()) return { valid: false };

  const secureHash = query.vnp_SecureHash;
  if (!secureHash) return { valid: false };

  const data = { ...query };
  delete data.vnp_SecureHash;
  delete data.vnp_SecureHashType;

  const expected = buildSecureHash(data, process.env.VNPAY_HASH_SECRET!);
  if (expected !== secureHash) return { valid: false };

  const responseCode = query.vnp_ResponseCode;
  return {
    valid: true,
    orderId: query.vnp_TxnRef,
    success: responseCode === "00",
    transactionNo: query.vnp_TransactionNo,
  };
}

export function vnpayBankCodeForMethod(method: string): string | undefined {
  switch (method) {
    case "VISA":
      return "INTCARD";
    case "ATM":
      return "NCB";
    case "QR":
      return "VNPAYQR";
    default:
      return undefined;
  }
}
