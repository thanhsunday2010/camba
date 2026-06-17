"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { EditableText } from "@/components/inline-edit/editable-text";
import { HorizontalScrollTrack } from "@/components/ui/horizontal-scroll-track";
import { PlanetOrb, YleStarfield } from "@/components/yle/yle-space-visuals";
import { PlacementOpenButton } from "@/components/placement/placement-open-button";
import {
  HOME_IELTS_WORLDS,
  HOME_SECONDARY_WORLDS,
  HOME_SIDE_MISSIONS,
  HOME_UNIVERSE_ZONES,
  HOME_YLE_WORLDS,
  homeContinueHref,
  homeTargetExamLabel,
} from "@/lib/home/universe-map";
import { cn } from "@/lib/utils";

export interface HomeUniversePageProps {
  isLoggedIn?: boolean;
  userName?: string | null;
  targetExam?: string;
  streak?: number;
  xp?: number;
  levelEmoji?: string;
  levelName?: string;
  continueMission?: {
    href: string;
    label: string;
    emoji: string;
    reason: string;
    stepIndex?: number;
    totalSteps?: number;
  } | null;
}

export function HomeUniversePage({
  isLoggedIn: isLoggedInProp,
  userName,
  targetExam,
  streak = 0,
  xp = 0,
  levelEmoji = "🌱",
  levelName = "Tập sự",
  continueMission,
}: HomeUniversePageProps) {
  const { data: session } = useSession();
  const isLoggedIn = isLoggedInProp ?? !!session?.user;

  const primaryHref =
    continueMission?.href ??
    (targetExam && isLoggedIn ? homeContinueHref(targetExam) : "/yle");

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-x-clip bg-slate-950 text-white">
      <YleStarfield />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.35),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(236,72,153,0.15),transparent),radial-gradient(ellipse_50%_30%_at_0%_80%,rgba(59,130,246,0.12),transparent)]"
        aria-hidden
      />

      {/* Hero */}
      <section className="relative z-10 px-4 pb-6 pt-8 sm:pt-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="relative mx-auto mb-4 flex justify-center">
            <div className="absolute -left-2 top-4 opacity-70 motion-safe:animate-yle-planet-pulse">
              <PlanetOrb gradient="bg-gradient-to-br from-orange-400 to-amber-500" size="sm" emoji="🚀" />
            </div>
            <CambaMascot size="lg" mood="wave" rankTier={isLoggedIn ? 2 : 1} />
            <div
              className="absolute -right-4 top-2 opacity-80 motion-safe:animate-yle-planet-pulse"
              style={{ animationDelay: "1s" }}
            >
              <PlanetOrb gradient="bg-gradient-to-br from-violet-500 to-fuchsia-600" size="sm" emoji="🌟" />
            </div>
          </div>

          <EditableText
            contentKey="home.hero.title"
            defaultValue="Khám phá vũ trụ cùng Camba!"
            as="h1"
            className="text-2xl font-extrabold tracking-tight sm:text-4xl"
          />
          <EditableText
            contentKey="home.hero.subtitle"
            defaultValue="Luyện tập như phi hành gia — thăng hạng, giữ streak, chinh phục từng hành tinh."
            as="p"
            multiline
            className="mx-auto mt-3 max-w-md text-sm font-medium text-violet-200/90 sm:text-base"
          />

          {isLoggedIn && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {userName && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                  👋 {userName.split(" ")[0]}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-200 ring-1 ring-orange-400/30">
                <Flame className="h-3.5 w-3.5" /> {streak} streak
              </span>
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200 ring-1 ring-violet-400/30">
                {levelEmoji} {levelName} · {xp} XP
              </span>
              {targetExam && (
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-200 ring-1 ring-sky-400/30">
                  🪐 {homeTargetExamLabel(targetExam)}
                </span>
              )}
            </div>
          )}

          {continueMission ? (
            <Link
              href={continueMission.href}
              className="mt-6 block overflow-hidden rounded-2xl border-2 border-sky-400/50 bg-gradient-to-r from-sky-600/40 to-violet-600/40 p-[2px] shadow-lg shadow-violet-900/40"
            >
              <div className="rounded-[14px] bg-slate-900/80 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                  Nhiệm vụ đang dở
                  {continueMission.stepIndex != null && continueMission.totalSteps != null && (
                    <span className="ml-1 text-violet-300">
                      · {continueMission.stepIndex}/{continueMission.totalSteps}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-lg font-extrabold">
                  {continueMission.emoji} {continueMission.label}
                </p>
                <p className="text-sm text-violet-200/80">{continueMission.reason}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-300">
                  Tiếp tục ngay <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href={primaryHref}
              className="kid-btn-fun mt-6 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-base font-extrabold shadow-lg shadow-violet-900/50 sm:w-auto"
            >
              {isLoggedIn ? "Vào hành tinh của bạn" : "Khám phá vũ trụ YLE"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}

          {!isLoggedIn && (
            <p className="mt-4 text-sm text-violet-300/80">
              <Link href="/login" className="font-bold underline hover:text-white">
                Đăng nhập
              </Link>{" "}
              để lưu streak & thăng hạng Camba
            </p>
          )}
        </div>
      </section>

      {/* YLE Worlds */}
      <UniverseSection
        title={HOME_UNIVERSE_ZONES.yle.title}
        subtitle={HOME_UNIVERSE_ZONES.yle.subtitle}
        emoji={HOME_UNIVERSE_ZONES.yle.emoji}
        viewAllHref={HOME_UNIVERSE_ZONES.yle.href}
      >
        {HOME_YLE_WORLDS.map((world) => (
          <PlanetCard
            key={world.level}
            href={world.href}
            label={world.label}
            sublabel={world.level}
            emoji={world.theme.emoji}
            gradient={world.theme.planetGradient}
            featured
          />
        ))}
      </UniverseSection>

      {/* Secondary */}
      <UniverseSection
        title={HOME_UNIVERSE_ZONES.secondary.title}
        subtitle={HOME_UNIVERSE_ZONES.secondary.subtitle}
        emoji={HOME_UNIVERSE_ZONES.secondary.emoji}
        viewAllHref={HOME_UNIVERSE_ZONES.secondary.href}
        className="bg-slate-900/40"
      >
        {HOME_SECONDARY_WORLDS.map((world) => (
          <PlanetCard
            key={world.level}
            href={world.href}
            label={world.label}
            sublabel={world.level}
            emoji={world.theme.emoji}
            gradient={world.theme.planetGradient}
          />
        ))}
      </UniverseSection>

      {/* IELTS */}
      <UniverseSection
        title={HOME_UNIVERSE_ZONES.ielts.title}
        subtitle={HOME_UNIVERSE_ZONES.ielts.subtitle}
        emoji={HOME_UNIVERSE_ZONES.ielts.emoji}
        viewAllHref={HOME_UNIVERSE_ZONES.ielts.href}
      >
        {HOME_IELTS_WORLDS.map((world) => (
          <Link
            key={world.label}
            href={world.href}
            className="scroll-card group relative flex w-[min(70vw,12rem)] flex-col items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:-translate-y-1 hover:border-white/25"
          >
            <div
              className={cn(
                "mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg",
                world.gradient
              )}
            >
              {world.emoji}
            </div>
            <p className="font-extrabold">{world.label}</p>
            <p className="mt-1 text-xs text-violet-300">AI chấm band</p>
            <span className="mt-2 text-xs font-bold text-violet-200 opacity-0 transition group-hover:opacity-100">
              Vào luyện →
            </span>
          </Link>
        ))}
      </UniverseSection>

      {/* Side missions */}
      <section className="relative z-10 px-4 py-8 pb-12">
        <h2 className="mb-1 text-center text-sm font-extrabold uppercase tracking-wider text-violet-400">
          Nhiệm vụ phụ
        </h2>
        <HorizontalScrollTrack label="Nhiệm vụ phụ" fadeEdges={false} className="mx-auto max-w-lg">
          {HOME_SIDE_MISSIONS.filter((m) => !("authOnly" in m && m.authOnly) || isLoggedIn).map((mission) => {
            if ("action" in mission && mission.action === "placement") {
              return (
                <PlacementOpenButton
                  key={mission.label}
                  variant="fun"
                  className="scroll-card shrink-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur-md hover:bg-white/15"
                >
                  {mission.emoji} {mission.label}
                </PlacementOpenButton>
              );
            }
            return (
              <Link
                key={mission.label}
                href={"href" in mission ? mission.href : "#"}
                className="scroll-card inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur-md transition hover:bg-white/15"
              >
                {mission.emoji} {mission.label}
              </Link>
            );
          })}
          {!isLoggedIn && (
            <Link
              href="/register"
              className="scroll-card inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-violet-400 bg-violet-600 px-5 py-3 text-sm font-bold shadow-lg"
            >
              🐰 Đăng ký miễn phí
            </Link>
          )}
        </HorizontalScrollTrack>

        <EditableText
          contentKey="home.hero.mascotMessage"
          defaultValue="Mình là Camba — cùng bạn bay qua từng hành tinh Tiếng Anh nhé!"
          as="p"
          multiline
          className="mx-auto mt-8 max-w-md text-center text-xs font-medium text-violet-400/90 sm:text-sm"
        />
      </section>
    </div>
  );
}

function UniverseSection({
  title,
  subtitle,
  emoji,
  viewAllHref,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  viewAllHref: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative z-10 px-4 py-6", className)}>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold sm:text-xl">
            <span>{emoji}</span> {title}
          </h2>
          <p className="text-xs font-medium text-violet-300/80 sm:text-sm">{subtitle}</p>
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 text-xs font-bold text-sky-300 hover:text-white sm:text-sm"
        >
          Xem tất cả →
        </Link>
      </div>
      <HorizontalScrollTrack label={title} fadeEdges={false}>
        {children}
      </HorizontalScrollTrack>
    </section>
  );
}

function PlanetCard({
  href,
  label,
  sublabel,
  emoji,
  gradient,
  featured,
}: {
  href: string;
  label: string;
  sublabel: string;
  emoji: string;
  gradient: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "scroll-card group relative flex flex-col items-center overflow-hidden rounded-3xl border p-4 backdrop-blur-md transition hover:-translate-y-1 active:scale-[0.98]",
        featured
          ? "w-[min(78vw,14rem)] border-violet-400/40 bg-gradient-to-b from-violet-900/50 to-slate-900/80 shadow-lg shadow-violet-900/30"
          : "w-[min(72vw,12rem)] border-white/10 bg-white/5 hover:border-white/25"
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl"
        aria-hidden
      />
      <PlanetOrb
        gradient={gradient}
        emoji={emoji}
        size={featured ? "lg" : "md"}
        className="mb-3 motion-safe:group-hover:scale-105"
      />
      <p className="text-center text-sm font-extrabold leading-tight sm:text-base">{label}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-300 sm:text-xs">
        {sublabel}
      </p>
      <span className="mt-3 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-violet-100 ring-1 ring-white/20 group-hover:bg-violet-600 group-hover:ring-violet-400">
        Khám phá →
      </span>
    </Link>
  );
}
