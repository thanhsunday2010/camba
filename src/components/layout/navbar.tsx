import { auth } from "@/auth";
import { NavbarClient } from "./navbar-client";
import { ensureUserReferralCode } from "@/lib/referral/codes";

export async function Navbar() {
  const session = await auth();
  let referralCode: string | null = null;
  if (session?.user?.id) {
    referralCode = await ensureUserReferralCode(session.user.id);
  }
  return <NavbarClient initialUser={session?.user} referralCode={referralCode} />;
}
