import { BillingCycle, SubscriptionPlan } from "@prisma/client";

export type PlanId = SubscriptionPlan;

export type AiGradingSkill =
  | "writing"
  | "speaking"
  | "reading"
  | "listening"
  | "useOfEnglish";

export interface PlanLimits {
  dailyPracticeQuestions: number;
  dailyWritingAiGrading: number;
  dailySpeakingAiGrading: number;
  dailyReadingAiGrading: number;
  dailyListeningAiGrading: number;
  dailyUseOfEnglishAiGrading: number;
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
      dailyPracticeQuestions: 10,
      dailyWritingAiGrading: 1,
      dailySpeakingAiGrading: 1,
      dailyReadingAiGrading: 1,
      dailyListeningAiGrading: 1,
      dailyUseOfEnglishAiGrading: 1,
      writingWordLimit: 200,
      speakingWordLimit: 100,
    },
    pricing: { monthly: 0, yearly: 0 },
    features: [
      "10 câu luyện tập mỗi ngày",
      "1 lượt AI chấm Writing/ngày (200 từ)",
      "1 lượt AI chấm Speaking/ngày (100 từ)",
      "1 lượt AI giải thích Reading/ngày",
      "1 lượt AI giải thích Listening/ngày",
      "1 lượt AI chấm Use of English/ngày",
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
      dailyReadingAiGrading: 25,
      dailyListeningAiGrading: 25,
      dailyUseOfEnglishAiGrading: 25,
      writingWordLimit: 150,
      speakingWordLimit: 150,
    },
    pricing: { monthly: 30_000, yearly: 300_000 },
    highlighted: true,
    features: [
      "100 câu luyện tập mỗi ngày",
      "25 lượt AI chấm Writing mỗi ngày",
      "25 lượt AI chấm Speaking mỗi ngày",
      "25 lượt AI giải thích Reading mỗi ngày",
      "25 lượt AI giải thích Listening mỗi ngày",
      "25 lượt AI chấm Use of English mỗi ngày",
      "Writing & Speaking tối đa 150 từ/lần",
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
      dailyReadingAiGrading: 50,
      dailyListeningAiGrading: 50,
      dailyUseOfEnglishAiGrading: 50,
      writingWordLimit: 300,
      speakingWordLimit: 300,
    },
    pricing: { monthly: 50_000, yearly: 500_000 },
    features: [
      "200 câu luyện tập mỗi ngày",
      "50 lượt AI chấm Writing mỗi ngày",
      "50 lượt AI chấm Speaking mỗi ngày",
      "50 lượt AI giải thích Reading mỗi ngày",
      "50 lượt AI giải thích Listening mỗi ngày",
      "50 lượt AI chấm Use of English mỗi ngày",
      "Writing & Speaking tối đa 300 từ/lần",
      "Hỗ trợ ưu tiên & cập nhật sớm",
    ],
  },
};

const AI_SKILL_LIMITS: Record<AiGradingSkill, keyof PlanLimits> = {
  writing: "dailyWritingAiGrading",
  speaking: "dailySpeakingAiGrading",
  reading: "dailyReadingAiGrading",
  listening: "dailyListeningAiGrading",
  useOfEnglish: "dailyUseOfEnglishAiGrading",
};

export function getAiGradingLimit(planId: PlanId, skill: AiGradingSkill): number {
  const limits = PLANS[planId].limits;
  return limits[AI_SKILL_LIMITS[skill]] as number;
}

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

export const AI_SKILL_LABELS: Record<AiGradingSkill, string> = {
  writing: "Writing",
  speaking: "Speaking",
  reading: "Reading",
  listening: "Listening",
  useOfEnglish: "Use of English",
};

export const EXPLAIN_AI_SKILLS = ["reading", "listening", "useOfEnglish"] as const;

export function paperSkillToAiGradingSkill(skill: string): AiGradingSkill {
  if (skill === "LISTENING") return "listening";
  if (skill === "USE_OF_ENGLISH") return "useOfEnglish";
  if (skill === "READING") return "reading";
  if (skill === "SPEAKING") return "speaking";
  if (skill === "WRITING") return "writing";
  return "reading";
}
