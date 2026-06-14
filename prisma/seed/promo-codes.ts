import type { PrismaClient } from "@prisma/client";

const DEFAULT_MAX = 300;

export async function seedPromoCodes(db: PrismaClient) {
  await db.promoCode.upsert({
    where: { code: "CAMBA" },
    create: {
      code: "CAMBA",
      description: "Dùng thử Camba Pro 1 tháng miễn phí",
      plan: "PRO",
      billingCycle: "MONTHLY",
      benefitType: "FREE_PERIOD",
      maxRedemptions: DEFAULT_MAX,
      active: true,
      showInPopup: true,
      popupTitle: "🎁 Mã ưu đãi Camba Pro",
      popupMessage:
        "Nhập mã CAMBA khi thanh toán để dùng gói Pro miễn phí 1 tháng! Mỗi tài khoản chỉ dùng được 1 lần.",
    },
    update: {
      description: "Dùng thử Camba Pro 1 tháng miễn phí",
      plan: "PRO",
      billingCycle: "MONTHLY",
      benefitType: "FREE_PERIOD",
      maxRedemptions: DEFAULT_MAX,
      active: true,
      showInPopup: true,
      popupTitle: "🎁 Mã ưu đãi Camba Pro",
      popupMessage:
        "Nhập mã CAMBA khi thanh toán để dùng gói Pro miễn phí 1 tháng! Mỗi tài khoản chỉ dùng được 1 lần.",
    },
  });
}
