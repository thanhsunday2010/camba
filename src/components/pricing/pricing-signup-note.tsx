"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function PricingSignupNote() {
  const { data: session } = useSession();
  if (session) return null;

  return (
    <p className="mt-6 text-center text-sm">
      <Link href="/register" className="font-bold text-purple-700 hover:underline">
        Đăng ký miễn phí
      </Link>{" "}
      để bắt đầu với Camba Free.
    </p>
  );
}
