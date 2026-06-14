import { BillingCycle, SubscriptionPlan } from "@prisma/client";

export type PlanId = SubscriptionPlan;

export interface PlanLimits {
  dailyPracticeQuestions: number;
  dailyWritingAiGrading: number;
  dailySpeakingAiGrading: number;
  writingWordLimit: number;
  speakingWordLimit: number;
}

export interface PlanPricing {
  monthly: number;
  yearly: number;
}

export interface PlanDefinition {
  id: PlanId;
  slug: string;
  name: string;
  tagline: string;
  limits: PlanLimits;
  pricing: PlanPricing;
  features: string[];
  highlighted?: boolean;
}

export const PLAN_ORDER: PlanId[] = ["FREE", "PRO", "VIP"];

export const PLANS: Record<PlanId, PlanDefinition> = {
  FREE: {
    id: "FREE",
    slug: "free",
    name: "Camba Free",
    tagline: "Bắt đầu học miễn phí",
    limits: {
      dailyPracticeQuestions: 1,
      dailyWritingAiGrading: 1,
      dailySpeakingAiGrading: 1,
      writingWordLimit: 200,
      speakingWordLimit: 100,
    },
    pricing: { monthly: 0, yearly: 0 },
    features: [
      "1 lượt Writing & AI chấm sửa mỗi ngày (200 từ)",
      "1 lượt Speaking & AI chấm sửa mỗi ngày (100 từ)",
      "Miễn phí mãi mãi",
    ],
  },
  PRO: {
    id: "PRO",
    slug: "pro",
    name: "Camba Pro",
    tagline: "Luyện thi hiệu quả hơn",
    limits: {
      dailyPracticeQuestions: 100,
      dailyWritingAiGrading: 25,
      dailySpeakingAiGrading: 25,
      writingWordLimit: 150,
      speakingWordLimit: 150,
    },
    pricing: { monthly: 30_000, yearly: 300_000 },
    highlighted: true,
    features: [
      "100 câu luyện tập mỗi ngày",
      "25 lượt AI chấm Writing mỗi ngày",
      "25 lượt AI chấm Speaking mỗi ngày",
      "Writing & Speaking tối đa 150 từ/lần",
      "Ưu tiên hỗ trợ qua email",
    ],
  },
  VIP: {
    id: "VIP",
    slug: "vip",
    name: "Camba VIP",
    tagline: "Trọn bộ công cụ luyện thi",
    limits: {
      dailyPracticeQuestions: 200,
      dailyWritingAiGrading: 50,
      dailySpeakingAiGrading: 50,
      writingWordLimit: 300,
      speakingWordLimit: 300,
    },
    pricing: { monthly: 50_000, yearly: 500_000 },
    features: [
      "200 câu luyện tập mỗi ngày",
      "50 lượt AI chấm Writing mỗi ngày",
      "50 lượt AI chấm Speaking mỗi ngày",
      "Writing & Speaking tối đa 300 từ/lần",
      "Hỗ trợ ưu tiên & cập nhật sớm",
    ],
  },
};

export function getPlan(planId: PlanId): PlanDefinition {
  return PLANS[planId];
}

export function getPlanPrice(planId: PlanId, cycle: BillingCycle): number {
  const plan = PLANS[planId];
  return cycle === "YEARLY" ? plan.pricing.yearly : plan.pricing.monthly;
}

export function yearlySavingsPercent(planId: PlanId): number {
  const plan = PLANS[planId];
  if (plan.pricing.monthly <= 0) return 0;
  const fullYear = plan.pricing.monthly * 12;
  if (fullYear <= plan.pricing.yearly) return 0;
  return Math.round(((fullYear - plan.pricing.yearly) / fullYear) * 100);
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parsePlanId(value: string | null | undefined): PlanId | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (upper in PLANS) return upper as PlanId;
  const bySlug = Object.values(PLANS).find((p) => p.slug === value.toLowerCase());
  return bySlug?.id ?? null;
}

export function parseBillingCycle(value: string | null | undefined): BillingCycle | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (upper === "MONTHLY" || upper === "YEARLY") return upper;
  if (value.toLowerCase() === "monthly") return "MONTHLY";
  if (value.toLowerCase() === "yearly") return "YEARLY";
  return null;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function hasSpeakingAccess(planId: PlanId): boolean {
  return PLANS[planId].limits.dailySpeakingAiGrading > 0;
}
