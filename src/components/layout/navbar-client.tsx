"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/kids/sound-toggle";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { logoutAction } from "@/lib/actions/auth";
import { ReferralShareNavItem } from "@/components/referral/referral-share-block";
import { CoursesNavMenu } from "@/components/layout/courses-nav-menu";
import { Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlacementOpenLink } from "@/components/placement/placement-open-button";

type NavUser = {
  role?: string;
};

type NavLinksProps = {
  user?: NavUser;
  referralCode?: string | null;
  onNavigate?: () => void;
  vertical?: boolean;
  hideLogout?: boolean;
};

function LogoutForm({ vertical = false }: { vertical?: boolean }) {
  return (
    <form action={logoutAction} className={vertical ? "w-full" : undefined}>
      <Button
        variant="outline"
        size={vertical ? "default" : "sm"}
        type="submit"
        className={cn("rounded-full border-2", vertical && "w-full")}
      >
        Đăng xuất
      </Button>
    </form>
  );
}

function NavLinks({
  user,
  referralCode,
  onNavigate,
  vertical = false,
  hideLogout = false,
}: NavLinksProps) {
  const linkClass = (colors: string) =>
    cn(
      "rounded-full px-3 py-2 text-sm font-bold transition-colors",
      colors,
      vertical && "block w-full text-left px-4 py-3 text-base"
    );

  return (
    <>
      {user && (
        <Link
          href="/"
          className={linkClass("text-purple-700 hover:bg-purple-100")}
          onClick={onNavigate}
        >
          🏠 Trang chủ
        </Link>
      )}
      <PlacementOpenLink
        className={linkClass("text-sky-700 hover:bg-sky-100")}
        onNavigate={onNavigate}
      >
        🎯 Test trình độ
      </PlacementOpenLink>
      <CoursesNavMenu vertical={vertical} onNavigate={onNavigate} linkClass={linkClass} />
      <Link
        href="/pricing"
        className={linkClass("text-violet-700 hover:bg-violet-100")}
        onClick={onNavigate}
      >
        💎 Bảng giá
      </Link>
      {user ? (
        <>
          {referralCode && (
            <ReferralShareNavItem referralCode={referralCode} vertical={vertical} />
          )}
          {vertical && (
            <Link
              href="/dashboard?tab=profile"
              className={linkClass("text-pink-700 hover:bg-pink-100")}
              onClick={onNavigate}
            >
              👤 Hồ sơ của tôi
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className={linkClass("text-purple-700 hover:bg-purple-100")}
              onClick={onNavigate}
            >
              Admin
            </Link>
          )}
          {user.role === "TEACHER" && (
            <Link
              href="/teacher"
              className={linkClass("text-purple-700 hover:bg-purple-100")}
              onClick={onNavigate}
            >
              Giáo viên
            </Link>
          )}
          {!hideLogout && <LogoutForm vertical={vertical} />}
        </>
      ) : (
        <>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full font-bold",
              vertical && "h-auto w-full justify-start px-4 py-3 text-base"
            )}
          >
            <Link href="/login" onClick={onNavigate}>
              Đăng nhập
            </Link>
          </Button>
          <Button
            asChild
            size={vertical ? "default" : "sm"}
            className={cn(
              "kid-btn-fun rounded-full bg-gradient-to-r from-purple-500 to-pink-500",
              vertical && "w-full"
            )}
          >
            <Link href="/register" onClick={onNavigate}>
              Đăng ký miễn phí ✨
            </Link>
          </Button>
        </>
      )}
    </>
  );
}

export function NavbarClient({
  initialUser,
  referralCode = null,
}: {
  initialUser?: Session["user"];
  referralCode?: string | null;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-purple-200/60 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-extrabold text-purple-700 transition-transform hover:scale-105"
          onClick={() => setMobileOpen(false)}
        >
          <CambaMascot
            size="sm"
            mood="happy"
            className="rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-0.5 shadow-md transition-transform group-hover:animate-wiggle"
          />
          <span className="text-xl kid-gradient-text">Camba</span>
          <Sparkles className="h-4 w-4 animate-pulse-soft text-sunshine-400" />
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <SoundToggle />

          <div className="hidden items-center gap-4 md:flex">
            <NavLinks user={user} referralCode={referralCode} />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full border-2 md:hidden"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-[calc(100dvh-4rem)] w-[min(100%,20rem)] flex-col border-l-2 border-purple-100 bg-white shadow-xl">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-2">
              <NavLinks
                user={user}
                referralCode={referralCode}
                vertical
                hideLogout
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            {user ? (
              <div className="shrink-0 border-t-2 border-purple-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <LogoutForm vertical />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
