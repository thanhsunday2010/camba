"use client";

import { ReferralShareButton } from "@/components/referral/referral-share-button";
import { REFERRAL_TAGLINE } from "@/lib/referral/constants";
import { cn } from "@/lib/utils";

/** Menu: desktop = hover tooltip; mobile vertical = tagline luôn hiện */
export function ReferralShareNavItem({
  referralCode,
  vertical = false,
}: {
  referralCode: string;
  vertical?: boolean;
}) {
  if (vertical) {
    return (
      <div className="w-full py-1">
        <p className="mb-2 px-1 text-xs font-semibold leading-snug text-emerald-800">
          {REFERRAL_TAGLINE}
        </p>
        <ReferralShareButton referralCode={referralCode} variant="nav" className="w-full" />
      </div>
    );
  }

  return (
    <div className="group relative shrink-0">
      <ReferralShareButton referralCode={referralCode} variant="nav" />
      <div
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] z-[60] hidden w-max max-w-[240px] -translate-x-1/2 rounded-xl border-2 border-emerald-200 bg-white px-3 py-2 text-center text-xs font-semibold leading-snug text-emerald-900 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 md:block"
      >
        {REFERRAL_TAGLINE}
        <span className="absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-emerald-200 bg-white" />
      </div>
    </div>
  );
}

/** Hồ sơ & chân trang: tagline + nút luôn hiển thị */
export function ReferralShareInline({
  referralCode,
  className,
  buttonClassName,
}: {
  referralCode: string;
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-semibold leading-snug text-emerald-800">{REFERRAL_TAGLINE}</p>
      <ReferralShareButton
        referralCode={referralCode}
        variant="inline"
        className={buttonClassName}
      />
    </div>
  );
}
