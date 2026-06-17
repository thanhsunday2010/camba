import { BillingCycle, SubscriptionPlan } from "@prisma/client";

export type PlanId = SubscriptionPlan;

/** Giá trị âm = không giới hạn luyện tập / mock */
export const UNLIMITED_QUOTA = -1;

export function isUnlimitedQuota(value: number): boolean {
  return value < 0;
}

export function formatUsageLimitLabel(limit: number): string {
  return isUnlimitedQuota(limit) ? "Không giới hạn" : String(limit);
}

export function formatUsageLine(used: number, limit: number, unit: string): string {
  if (isUnlimitedQuota(limit)) return `${used} · không giới hạn`;
  return `${used}/${limit} ${unit}`;
}

export function computeRemaining(used: number, limit: number): number {
  if (isUnlimitedQuota(limit)) return UNLIMITED_QUOTA;
  return Math.max(0, limit - used);
}

export function isQuotaExhausted(used: number, limit: number): boolean {
  if (isUnlimitedQuota(limit)) return false;
  return used >= limit;
}

export function formatQuotaRatio(used: number, limit: number): string {
  if (isUnlimitedQuota(limit)) return `${used} · không giới hạn`;
  return `${used}/${limit}`;
}

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
      dailyPracticeQuestions: UNLIMITED_QUOTA,
      weeklyPlacementAttempts: PLACEMENT_WEEKLY_LIMIT,
      dailyAiGrading: 3,
      dailyMockTests: UNLIMITED_QUOTA,
      allowFullMock: true,
      speakingWordLimit: 100,
      ieltsSpeakingPracticeDaily: UNLIMITED_QUOTA,
      ieltsSpeakingMockDaily: UNLIMITED_QUOTA,
      ieltsSpeakingMockWeekly: UNLIMITED_QUOTA,
      cambridgeSpeakingPracticeDaily: UNLIMITED_QUOTA,
      cambridgeSpeakingMockDaily: UNLIMITED_QUOTA,
      cambridgeSpeakingMockWeekly: UNLIMITED_QUOTA,
    },
    pricing: { monthly: 0, yearly: 0 },
    features: [
      "Luyện tập không giới hạn",
      "Mock test không giới hạn (kỹ năng & full mock)",
      "2 lượt placement/tuần (mọi loại đề)",
      "3 lượt AI/ngày (chấm Writing & Speaking, dùng chung)",
      "Lời giải Reading/Listening/UoE có sẵn khi luyện tập",
      "Writing theo giới hạn đề thi (+ 20%) · Speaking 100 từ/lần",
      "Miễn phí mãi mãi",
    ],
  },
  PRO: {
    id: "PRO",
    slug: "pro",
    name: "Camba Pro",
    tagline: "Luyện thi hiệu quả hơn",
    limits: {
      dailyPracticeQuestions: UNLIMITED_QUOTA,
      weeklyPlacementAttempts: PLACEMENT_WEEKLY_LIMIT,
      dailyAiGrading: 10,
      dailyMockTests: UNLIMITED_QUOTA,
      allowFullMock: true,
      speakingWordLimit: 150,
      ieltsSpeakingPracticeDaily: UNLIMITED_QUOTA,
      ieltsSpeakingMockDaily: UNLIMITED_QUOTA,
      ieltsSpeakingMockWeekly: UNLIMITED_QUOTA,
      cambridgeSpeakingPracticeDaily: UNLIMITED_QUOTA,
      cambridgeSpeakingMockDaily: UNLIMITED_QUOTA,
      cambridgeSpeakingMockWeekly: UNLIMITED_QUOTA,
    },
    pricing: { monthly: 30_000, yearly: 300_000 },
    highlighted: true,
    features: [
      "Luyện tập không giới hạn",
      "Mock test không giới hạn (kỹ năng & full mock)",
      "2 lượt placement/tuần (mọi loại đề)",
      "10 lượt AI/ngày (chấm Writing & Speaking)",
      "Lời giải Reading/Listening/UoE có sẵn khi luyện tập",
      "Writing theo giới hạn đề thi (+ 20%) · Speaking tối đa 150 từ/lần",
    ],
  },
  VIP: {
    id: "VIP",
    slug: "vip",
    name: "Camba VIP",
    tagline: "Trọn bộ công cụ luyện thi",
    limits: {
      dailyPracticeQuestions: UNLIMITED_QUOTA,
      weeklyPlacementAttempts: PLACEMENT_WEEKLY_LIMIT,
      dailyAiGrading: 20,
      dailyMockTests: UNLIMITED_QUOTA,
      allowFullMock: true,
      speakingWordLimit: 300,
      ieltsSpeakingPracticeDaily: UNLIMITED_QUOTA,
      ieltsSpeakingMockDaily: UNLIMITED_QUOTA,
      ieltsSpeakingMockWeekly: UNLIMITED_QUOTA,
      cambridgeSpeakingPracticeDaily: UNLIMITED_QUOTA,
      cambridgeSpeakingMockDaily: UNLIMITED_QUOTA,
      cambridgeSpeakingMockWeekly: UNLIMITED_QUOTA,
    },
    pricing: { monthly: 50_000, yearly: 500_000 },
    features: [
      "Luyện tập không giới hạn",
      "Mock test không giới hạn (kỹ năng & full mock)",
      "2 lượt placement/tuần (mọi loại đề)",
      "20 lượt AI/ngày (chấm Writing & Speaking)",
      "Lời giải Reading/Listening/UoE có sẵn khi luyện tập",
      "Writing theo giới hạn đề thi (+ 20%) · Speaking tối đa 300 từ/lần",
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

export function hasFullMockAccess(_planId: PlanId): boolean {
  return true;
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
