import { formatVnd, PLANS } from "@/lib/subscription/plans";

export const PRO_UPGRADE_MONTHLY_VND = PLANS.PRO.pricing.monthly;

export function formatPracticeQuotaExceededMessage(): string {
  return `Bạn đã hết lượt luyện tập hôm nay. Quay lại ngày mai hoặc nâng cấp gói Pro chỉ ${formatVnd(PRO_UPGRADE_MONTHLY_VND)}/tháng tại trang Bảng giá.`;
}

export function formatAiGradingQuotaExceededMessage(): string {
  return `Bạn đã hết lượt AI chấm Writing & Speaking hôm nay. Quay lại ngày mai hoặc nâng cấp gói Pro chỉ ${formatVnd(PRO_UPGRADE_MONTHLY_VND)}/tháng tại trang Bảng giá.`;
}

export function formatMockTestQuotaExceededMessage(): string {
  return `Bạn đã hết lượt mock test hôm nay. Quay lại ngày mai hoặc nâng cấp gói tại trang Bảng giá.`;
}

/** @deprecated use formatMockTestQuotaExceededMessage */
export const formatSkillMockQuotaExceededMessage = formatMockTestQuotaExceededMessage;

export function formatFullMockUpgradeMessage(): string {
  return `Full mock chỉ dành cho gói Pro trở lên. Nâng cấp chỉ ${formatVnd(PRO_UPGRADE_MONTHLY_VND)}/tháng tại trang Bảng giá.`;
}
