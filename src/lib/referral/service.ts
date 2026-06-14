import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { activateSubscription } from "@/lib/subscription/service";
import {
  normalizeReferralCode,
  REFERRAL_COOKIE_MAX_AGE,
  REFERRAL_COOKIE_NAME,
  REFERRAL_WELCOME_COOKIE,
} from "@/lib/referral/constants";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const NEW_USER_MAX_AGE_MS = 10 * 60 * 1000;

function generateReferralCodeCandidate(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_ALPHABET[bytes[i]! % REFERRAL_ALPHABET.length];
  }
  return code;
}

export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateReferralCodeCandidate();
    const existing = await db.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not generate unique referral code");
}

export async function ensureUserReferralCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  const code = await generateUniqueReferralCode();
  try {
    await db.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });
    return code;
  } catch {
    const refreshed = await db.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (refreshed?.referralCode) return refreshed.referralCode;
    throw new Error("Could not assign referral code");
  }
}

export async function getReferrerDisplayName(referralCode: string): Promise<string | null> {
  const code = normalizeReferralCode(referralCode);
  if (!code) return null;

  const referrer = await db.user.findUnique({
    where: { referralCode: code },
    select: { name: true, email: true },
  });
  if (!referrer) return null;
  return referrer.name ?? referrer.email ?? "Một bạn bè";
}

export async function setReferralCookie(referralCode: string) {
  const code = normalizeReferralCode(referralCode);
  if (!code) return;

  const cookieStore = await cookies();
  cookieStore.set(REFERRAL_COOKIE_NAME, code, {
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

async function getReferralCodeFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
  if (!raw) return null;
  const code = normalizeReferralCode(raw);
  return code || null;
}

async function clearReferralCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(REFERRAL_COOKIE_NAME);
}

async function setReferralWelcomeCookie() {
  const cookieStore = await cookies();
  cookieStore.set(REFERRAL_WELCOME_COOKIE, "1", {
    maxAge: 300,
    sameSite: "lax",
    path: "/",
  });
}

export async function applyReferralBonusForNewUser(
  newUserId: string
): Promise<{ applied: boolean }> {
  const refCode = await getReferralCodeFromCookie();
  if (!refCode) return { applied: false };

  const newUser = await db.user.findUnique({
    where: { id: newUserId },
    select: {
      id: true,
      referredById: true,
      createdAt: true,
      referralCode: true,
    },
  });
  if (!newUser || newUser.referredById) return { applied: false };

  const ageMs = Date.now() - newUser.createdAt.getTime();
  if (ageMs > NEW_USER_MAX_AGE_MS) return { applied: false };

  const priorSub = await db.userSubscription.count({ where: { userId: newUserId } });
  if (priorSub > 0) return { applied: false };

  const referrer = await db.user.findUnique({
    where: { referralCode: refCode },
    select: { id: true, referralCode: true },
  });
  if (!referrer) return { applied: false };
  if (referrer.id === newUserId) return { applied: false };

  await db.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id },
  });

  await activateSubscription(newUserId, "PRO", "MONTHLY");
  await clearReferralCookie();
  await setReferralWelcomeCookie();

  return { applied: true };
}
