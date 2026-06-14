"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function HomeHeroCtas() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button
        asChild
        size="lg"
        variant="secondary"
        className="kid-btn-fun rounded-full text-purple-800"
      >
        <Link href="/dashboard">🏠 Vào trang của tôi</Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        asChild
        size="lg"
        variant="secondary"
        className="kid-btn-fun rounded-full text-purple-800"
      >
        <Link href="/register">🚀 Bắt đầu miễn phí</Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="rounded-full border-2 border-white font-bold text-white hover:bg-white/20"
      >
        <Link href="/login">Đăng nhập</Link>
      </Button>
    </>
  );
}

export function HomeStreakCta() {
  const { data: session } = useSession();

  return (
    <Button asChild variant="outline" className="w-full rounded-full">
      <Link href={session ? "/dashboard" : "/register"}>
        {session ? "Xem tiến độ của tôi" : "Đăng ký để tham gia"}
      </Link>
    </Button>
  );
}
