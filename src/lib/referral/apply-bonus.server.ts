import "server-only";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { activateSubscription } from "@/lib/subscription/service";
import {
  normalizeReferralCode,
  REFERRAL_COOKIE_NAME,
  REFERRAL_WELCOME_COOKIE,
} from "@/lib/referral/constants";

const NEW_USER_MAX_AGE_MS = 10 * 60 * 1000;

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
    },
  });
  if (!newUser || newUser.referredById) return { applied: false };

  const ageMs = Date.now() - newUser.createdAt.getTime();
  if (ageMs > NEW_USER_MAX_AGE_MS) return { applied: false };

  const priorSub = await db.userSubscription.count({ where: { userId: newUserId } });
  if (priorSub > 0) return { applied: false };

  const referrer = await db.user.findUnique({
    where: { referralCode: refCode },
    select: { id: true },
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
