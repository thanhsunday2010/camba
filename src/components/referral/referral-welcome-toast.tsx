"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { REFERRAL_WELCOME_COOKIE } from "@/lib/referral/constants";

function readWelcomeCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${REFERRAL_WELCOME_COOKIE}=`));
}

function clearWelcomeCookie() {
  document.cookie = `${REFERRAL_WELCOME_COOKIE}=; Max-Age=0; path=/`;
}

export function ReferralWelcomeToast() {
  useEffect(() => {
    if (!readWelcomeCookie()) return;
    clearWelcomeCookie();
    toast.success("🎁 Chúc mừng! Bạn đã nhận Camba Pro 1 tháng miễn phí từ link giới thiệu.", {
      duration: 8000,
    });
  }, []);

  return null;
}
