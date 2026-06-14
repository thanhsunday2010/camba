import { PaymentMethod } from "@prisma/client";

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  /** Routes card/ATM/QR through VNPay when configured */
  vnpayChannel?: "card" | "qr";
}

export interface PaymentMethodGroup {
  title: string;
  description?: string;
  methods: PaymentMethod[];
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "MOMO",
    label: "MoMo",
    description: "Ví MoMo — quét QR hoặc thanh toán trong app",
    icon: "🟣",
  },
  {
    id: "ZALOPAY",
    label: "ZaloPay",
    description: "Ví ZaloPay — phổ biến tại Việt Nam",
    icon: "💙",
  },
  {
    id: "SHOPEEPAY",
    label: "ShopeePay",
    description: "Ví ShopeePay / AirPay",
    icon: "🧡",
  },
  {
    id: "VISA",
    label: "Thẻ Visa / Mastercard",
    description: "Thẻ quốc tế qua VNPay",
    icon: "💳",
    vnpayChannel: "card",
  },
  {
    id: "ATM",
    label: "Thẻ ATM nội địa (Napas)",
    description: "Thẻ gắn nối mạng Napas của các ngân hàng VN",
    icon: "🏧",
    vnpayChannel: "card",
  },
  {
    id: "VNPAY",
    label: "VNPay",
    description: "Cổng VNPay — hỗ trợ hầu hết ngân hàng",
    icon: "🔵",
  },
  {
    id: "QR",
    label: "QR VietQR",
    description: "Quét mã QR chuẩn VietQR trên app ngân hàng",
    icon: "📱",
    vnpayChannel: "qr",
  },
  {
    id: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản thủ công — hiển thị mã VietQR & nội dung CK",
    icon: "🏦",
  },
];

export const PAYMENT_GROUPS: PaymentMethodGroup[] = [
  {
    title: "Ví điện tử",
    description: "MoMo, ZaloPay, ShopeePay",
    methods: ["MOMO", "ZALOPAY", "SHOPEEPAY"],
  },
  {
    title: "Thẻ ngân hàng",
    description: "Visa, Mastercard, thẻ ATM nội địa",
    methods: ["VISA", "ATM"],
  },
  {
    title: "Cổng thanh toán & QR",
    methods: ["VNPAY", "QR"],
  },
  {
    title: "Chuyển khoản",
    methods: ["BANK_TRANSFER"],
  },
];

export function getPaymentMethodOption(method: PaymentMethod): PaymentMethodOption | undefined {
  return PAYMENT_METHODS.find((m) => m.id === method);
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return getPaymentMethodOption(method)?.label ?? method;
}

export function getBankTransferConfig() {
  return {
    bankName: process.env.CAMBA_BANK_NAME ?? "Vietcombank",
    bankBin: process.env.CAMBA_BANK_BIN ?? "970436",
    accountNumber: process.env.CAMBA_BANK_ACCOUNT ?? "0123456789",
    accountName: process.env.CAMBA_BANK_HOLDER ?? "CONG TY CAMBA",
    branch: process.env.CAMBA_BANK_BRANCH ?? "Chi nhánh Hà Nội",
  };
}

export function isVnpayConfigured(): boolean {
  return Boolean(
    process.env.VNPAY_TMN_CODE &&
      process.env.VNPAY_HASH_SECRET &&
      process.env.VNPAY_URL
  );
}

export function isMomoConfigured(): boolean {
  return Boolean(
    process.env.MOMO_PARTNER_CODE &&
      process.env.MOMO_ACCESS_KEY &&
      process.env.MOMO_SECRET_KEY
  );
}

export function isZaloPayConfigured(): boolean {
  return Boolean(
    process.env.ZALOPAY_APP_ID &&
      process.env.ZALOPAY_KEY1 &&
      process.env.ZALOPAY_KEY2
  );
}

export function isShopeePayConfigured(): boolean {
  return Boolean(
    process.env.SHOPEEPAY_MERCHANT_ID && process.env.SHOPEEPAY_SECRET_KEY
  );
}

export function getAppBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  const url = raw.startsWith("http") ? raw : `https://${raw}`;
  return url.replace(/\/$/, "");
}
