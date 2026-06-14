import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { normalizeReferralCode } from "@/lib/referral/constants";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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
