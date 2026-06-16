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
  /** Lượt placement bất kỳ loại nào / tuần (Free, Pro, VIP) */
  weeklyPlacementAttempts: number;
  /** Lượt AI Writing & Speaking / ngày (dùng chung pool) */
  dailyAiGrading: number;
  /** Mock test (kỹ năng + full) / ngày */
  dailyMockTests: number;
  /** Full mock (tất cả kỹ năng) */
  allowFullMock: boolean;
  writingWordLimit: number;
  speakingWordLimit: number;
  /** Luyện Speaking IELTS — lượt / ngày (mỗi lần mở 1 part = 1 lượt) */
  ieltsSpeakingPracticeDaily: number;
  /** Mock Speaking IELTS / ngày (Pro, VIP). Free dùng mockWeekly */
  ieltsSpeakingMockDaily: number;
  /** Mock Speaking IELTS / tuần (Free) */
  ieltsSpeakingMockWeekly: number;
  /** Luyện Speaking Cambridge — lượt / ngày / level (giống IELTS) */
  cambridgeSpeakingPracticeDaily: number;
  cambridgeSpeakingMockDaily: number;
  cambridgeSpeakingMockWeekly: number;
}

/** Mọi gói đăng ký: 2 lượt placement / tuần */
export const PLACEMENT_WEEKLY_LIMIT = 2;

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
      dailyPracticeQuestions: 30,
      weeklyPlacementAttempts: PLACEMENT_WEEKLY_LIMIT,
      dailyAiGrading: 1,
      dailyMockTests: 1,
      allowFullMock: false,
      writingWordLimit: 200,
      speakingWordLimit: 100,
      ieltsSpeakingPracticeDaily: 3,
      ieltsSpeakingMockDaily: 0,
      ieltsSpeakingMockWeekly: 1,
      cambridgeSpeakingPracticeDaily: 3,
      cambridgeSpeakingMockDaily: 0,
      cambridgeSpeakingMockWeekly: 1,
    },
    pricing: { monthly: 0, yearly: 0 },
    features: [
      "30 câu luyện tập mỗi ngày",
      "1 mock kỹ năng/ngày",
      "2 lượt placement/tuần (mọi loại đề)",
      "1 lượt AI/ngày (chấm Writing & Speaking, dùng chung)",
      "Lời giải Reading/Listening/UoE có sẵn khi luyện tập",
      "Writing tối đa 200 từ/lần · Speaking 100 từ/lần",
      "Speaking IELTS: 3 lượt luyện/ngày · 1 mock/tuần",
      "Speaking Cambridge: 3 lượt luyện/ngày/level · 1 mock/tuần",
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
      weeklyPlacementAttempts: PLACEMENT_WEEKLY_LIMIT,
      dailyAiGrading: 10,
      dailyMockTests: 5,
      allowFullMock: true,
      writingWordLimit: 150,
      speakingWordLimit: 150,
      ieltsSpeakingPracticeDaily: 10,
      ieltsSpeakingMockDaily: 1,
      ieltsSpeakingMockWeekly: 0,
      cambridgeSpeakingPracticeDaily: 10,
      cambridgeSpeakingMockDaily: 1,
      cambridgeSpeakingMockWeekly: 0,
    },
    pricing: { monthly: 30_000, yearly: 300_000 },
    highlighted: true,
    features: [
      "100 câu luyện tập mỗi ngày",
      "5 mock test/ngày (kỹ năng & full mock)",
      "2 lượt placement/tuần (mọi loại đề)",
      "10 lượt AI/ngày (chấm Writing & Speaking)",
      "Lời giải Reading/Listening/UoE có sẵn khi luyện tập",
      "Writing & Speaking tối đa 150 từ/lần",
      "Speaking IELTS: 10 lượt luyện/ngày · 1 mock/ngày",
      "Speaking Cambridge: 10 lượt luyện/ngày/level · 1 mock/ngày",
    ],
  },
  VIP: {
    id: "VIP",
    slug: "vip",
    name: "Camba VIP",
    tagline: "Trọn bộ công cụ luyện thi",
    limits: {
      dailyPracticeQuestions: 200,
      weeklyPlacementAttempts: PLACEMENT_WEEKLY_LIMIT,
      dailyAiGrading: 20,
      dailyMockTests: 10,
      allowFullMock: true,
      writingWordLimit: 300,
      speakingWordLimit: 300,
      ieltsSpeakingPracticeDaily: 20,
      ieltsSpeakingMockDaily: 3,
      ieltsSpeakingMockWeekly: 0,
      cambridgeSpeakingPracticeDaily: 20,
      cambridgeSpeakingMockDaily: 3,
      cambridgeSpeakingMockWeekly: 0,
    },
    pricing: { monthly: 50_000, yearly: 500_000 },
    features: [
      "200 câu luyện tập mỗi ngày",
      "10 mock test/ngày (kỹ năng & full mock)",
      "2 lượt placement/tuần (mọi loại đề)",
      "20 lượt AI/ngày (chấm Writing & Speaking)",
      "Lời giải Reading/Listening/UoE có sẵn khi luyện tập",
      "Writing & Speaking tối đa 300 từ/lần",
      "Speaking IELTS: 20 lượt luyện/ngày · 3 mock/ngày",
      "Speaking Cambridge: 20 lượt luyện/ngày/level · 3 mock/ngày",
      "Hỗ trợ ưu tiên & cập nhật sớm",
    ],
  },
};

export function getAiGradingLimit(planId: PlanId): number {
  return PLANS[planId].limits.dailyAiGrading;
}

export function getPlacementWeeklyLimit(_planId?: PlanId): number {
  return PLACEMENT_WEEKLY_LIMIT;
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

export function hasFullMockAccess(planId: PlanId): boolean {
  return PLANS[planId].limits.allowFullMock;
}

export function getMockTestDailyLimit(planId: PlanId): number {
  return PLANS[planId].limits.dailyMockTests;
}

export function getIeltsSpeakingLimits(planId: PlanId) {
  const l = PLANS[planId].limits;
  return {
    practiceDaily: l.ieltsSpeakingPracticeDaily,
    mockDaily: l.ieltsSpeakingMockDaily,
    mockWeekly: l.ieltsSpeakingMockWeekly,
  };
}

export function getCambridgeSpeakingLimits(planId: PlanId) {
  const l = PLANS[planId].limits;
  return {
    practiceDaily: l.cambridgeSpeakingPracticeDaily,
    mockDaily: l.cambridgeSpeakingMockDaily,
    mockWeekly: l.cambridgeSpeakingMockWeekly,
  };
}

/** @deprecated use getMockTestDailyLimit */
export const getSkillMockDailyLimit = getMockTestDailyLimit;

export function hasSpeakingAccess(planId: PlanId): boolean {
  return PLANS[planId].limits.dailyAiGrading > 0;
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
