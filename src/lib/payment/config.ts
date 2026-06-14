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

/** Tạm thời chỉ chuyển khoản. Đặt CAMBA_PAYMENT_BANK_ONLY=false khi bật VNPay/MoMo. */
export function isBankTransferOnlyMode(): boolean {
  return process.env.CAMBA_PAYMENT_BANK_ONLY !== "false";
}

export function getAvailablePaymentGroups(): PaymentMethodGroup[] {
  if (isBankTransferOnlyMode()) {
    if (!isBankTransferConfigured()) return [];
    return [
      {
        title: "Chuyển khoản",
        description: "Quét VietQR hoặc chuyển khoản thủ công — admin xác nhận trong 1–24 giờ",
        methods: ["BANK_TRANSFER"],
      },
    ];
  }

  const methodAvailable = (id: PaymentMethod): boolean => {
    switch (id) {
      case "BANK_TRANSFER":
        return isBankTransferConfigured();
      case "MOMO":
        return isMomoConfigured();
      case "ZALOPAY":
        return isZaloPayConfigured();
      case "SHOPEEPAY":
        return isShopeePayConfigured();
      case "VNPAY":
      case "VISA":
      case "ATM":
      case "QR":
        return isVnpayConfigured();
      default:
        return false;
    }
  };

  return PAYMENT_GROUPS.map((group) => ({
    ...group,
    methods: group.methods.filter(methodAvailable),
  })).filter((group) => group.methods.length > 0);
}

export function getBankTransferConfig() {
  return {
    bankName: process.env.CAMBA_BANK_NAME ?? "ACB",
    bankBin: process.env.CAMBA_BANK_BIN ?? "970416",
    accountNumber: process.env.CAMBA_BANK_ACCOUNT ?? "",
    accountName: process.env.CAMBA_BANK_HOLDER ?? "",
    branch: process.env.CAMBA_BANK_BRANCH ?? "",
  };
}

export function isBankTransferConfigured(): boolean {
  const { bankBin, accountNumber } = getBankTransferConfig();
  return Boolean(bankBin && accountNumber);
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
