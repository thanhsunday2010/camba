"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

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
