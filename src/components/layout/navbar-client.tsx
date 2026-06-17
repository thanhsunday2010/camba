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
import { useMascotToast } from "@/components/kids/mascot-toast-provider";
import type { ActiveMascotState } from "@/components/kids/mascot-toast-provider";

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

function NavbarMascotBubble({
  active,
  onClose,
}: {
  active: ActiveMascotState;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute left-0 top-[calc(100%+0.35rem)] z-[60] w-[min(18rem,calc(100vw-2rem))] animate-bounce-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative rounded-2xl border-2 border-purple-200 bg-white px-3 py-2.5 pr-8 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-purple-600 transition-colors hover:bg-purple-50"
          aria-label="Đóng tin nhắn"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <p
          key={`${active.message}-${active.subtitle ?? ""}`}
          className="animate-bounce-in text-base font-normal leading-snug text-purple-900"
        >
          {active.message}
        </p>
        {active.subtitle && (
          <p
            key={`sub-${active.subtitle}`}
            className="animate-bounce-in mt-1 text-sm font-normal text-purple-700/90"
          >
            {active.subtitle}
          </p>
        )}
        {active.actions && active.actions.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {active.actions.map((action) => (
              <Button
                key={action.href}
                asChild
                size="sm"
                variant={action.primary ? "default" : "outline"}
                className={cn("h-8 rounded-full text-xs font-bold", action.primary && "kid-btn-fun")}
                onClick={onClose}
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-normal text-muted-foreground underline-offset-2 hover:underline"
            >
              Để sau
            </button>
          </div>
        )}
        <span className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l-2 border-t-2 border-purple-200 bg-white" />
      </div>
    </div>
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
  const { active, hideMascot } = useMascotToast();

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
    <header className="sticky top-0 z-50 overflow-visible border-b-2 border-purple-200/60 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="relative shrink-0">
          <Link
            href="/"
            className="group flex items-center gap-2 font-extrabold text-purple-700 transition-transform hover:scale-105"
            onClick={() => setMobileOpen(false)}
          >
            <CambaMascot
              size="sm"
              mood={active?.mood ?? "happy"}
              activity={active?.activity ?? "idle"}
              talking={Boolean(active?.talking)}
              className="rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-0.5 shadow-md transition-transform group-hover:animate-wiggle"
            />
            <span className="text-xl kid-gradient-text">Camba</span>
            <Sparkles className="h-4 w-4 animate-pulse-soft text-sunshine-400" />
          </Link>
          {active && <NavbarMascotBubble active={active} onClose={hideMascot} />}
        </div>

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
