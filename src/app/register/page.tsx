import { RegisterForm } from "@/components/auth/register-form";
import { ReferralRegisterBanner } from "@/components/referral/referral-register-banner";
import { getEnabledOAuthProviders } from "@/lib/auth/providers";
import { sanitizeAuthCallbackUrl } from "@/lib/auth/safe-callback-url";
import { normalizeReferralCode, REFERRAL_COOKIE_NAME } from "@/lib/referral/constants";
import { getReferrerDisplayName } from "@/lib/referral/codes";
import { cookies } from "next/headers";

export const revalidate = 0;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; callbackUrl?: string }>;
}) {
  const oauthProviders = getEnabledOAuthProviders();
  const params = await searchParams;
  const callbackUrl = sanitizeAuthCallbackUrl(params.callbackUrl);
  const cookieStore = await cookies();
  const refFromCookie = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
  const refRaw = params.ref ?? refFromCookie ?? "";
  const refCode = refRaw ? normalizeReferralCode(refRaw) : "";
  const referrerName = refCode ? await getReferrerDisplayName(refCode) : null;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      {referrerName && <ReferralRegisterBanner referrerName={referrerName} />}
      <RegisterForm
        oauthProviders={oauthProviders}
        hasReferralInvite={Boolean(referrerName)}
        callbackUrl={callbackUrl}
      />
    </div>
  );
}
