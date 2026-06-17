"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MascotHero } from "@/components/kids/mascot-buddy";
import { EditableText } from "@/components/inline-edit/editable-text";
import { VTEN_COURSE_LABEL, VTEN_COURSE_URL } from "@/lib/site/vten-course";
import { PlacementOpenButton } from "@/components/placement/placement-open-button";
import {
  CAMBRIDGE_COURSES_CTA_LABEL,
  CAMBRIDGE_COURSES_URL,
  IELTS_SPEAKING_CTA_LABEL,
  IELTS_SPEAKING_URL,
} from "@/lib/site/ielts-speaking-cta";
import { HorizontalScrollTrack } from "@/components/ui/horizontal-scroll-track";
import { PlanetOrb, YleStarfield } from "@/components/yle/yle-space-visuals";

const HERO_QUICK_LINKS = [
  { href: "/yle", emoji: "🌌", label: "Vũ trụ YLE", accent: "from-pink-500 to-violet-600" },
  { href: IELTS_SPEAKING_URL, emoji: "🎤", label: "IELTS Speaking", accent: "from-rose-500 to-pink-600" },
  { href: CAMBRIDGE_COURSES_URL, emoji: "📚", label: "Cambridge", accent: "from-amber-500 to-orange-600" },
  { href: VTEN_COURSE_URL, emoji: "👩‍🏫", label: "Khoá VTEN", accent: "from-emerald-500 to-teal-600", external: true },
] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 text-white">
      <YleStarfield />
      <div className="pointer-events-none absolute -right-16 top-8 opacity-80 motion-safe:animate-yle-planet-pulse" aria-hidden>
        <PlanetOrb gradient="bg-gradient-to-br from-violet-500 to-fuchsia-600" size="md" emoji="🌟" />
      </div>
      <div
        className="pointer-events-none absolute -left-8 bottom-12 opacity-60 motion-safe:animate-yle-planet-pulse"
        style={{ animationDelay: "1.5s" }}
        aria-hidden
      >
        <PlanetOrb gradient="bg-gradient-to-br from-orange-400 to-amber-600" size="sm" emoji="🚀" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-10 sm:py-14 md:py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0 w-full text-center lg:text-left">
            <EditableText
              contentKey="home.hero.title"
              defaultValue="Giỏi Tiếng Anh cùng Camba!"
              as="h1"
              className="text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl lg:leading-tight"
            />
            <EditableText
              contentKey="home.hero.subtitle"
              defaultValue="App học Tiếng Anh miễn phí có AI chấm sửa — khám phá vũ trụ YLE, Cambridge & IELTS."
              as="p"
              multiline
              className="mx-auto mt-4 max-w-xl text-base font-semibold text-violet-100/90 sm:mt-6 sm:text-lg md:text-xl lg:mx-0 lg:mt-8"
            />

            <HorizontalScrollTrack
              label="Lối tắt luyện tập"
              className="mt-8 lg:mt-10"
              showHint={true}
              fadeEdges={false}
            >
              <PlacementOpenButton
                variant="fun"
                className="scroll-card shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-bold shadow-lg ring-1 ring-white/20"
              >
                🎯 Test trình độ
              </PlacementOpenButton>
              {HERO_QUICK_LINKS.map((item) => {
                const className = `scroll-card inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2.5 text-sm font-bold text-white shadow-lg ring-1 ring-white/20 transition hover:scale-[1.03] active:scale-95 ${item.accent}`;
                if ("external" in item && item.external) {
                  return (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                      <span>{item.emoji}</span>
                      {item.label}
                    </a>
                  );
                }
                return (
                  <Link key={item.label} href={item.href} className={className}>
                    <span>{item.emoji}</span>
                    {item.label}
                  </Link>
                );
              })}
            </HorizontalScrollTrack>

            <div className="mt-5 hidden flex-wrap gap-3 sm:flex sm:justify-center lg:justify-start">
              <PlacementOpenButton size="lg" variant="fun" className="rounded-full">
                🎯 Test trình độ
              </PlacementOpenButton>
              <Button asChild size="lg" className="rounded-full bg-rose-600 font-bold hover:bg-rose-700">
                <Link href={IELTS_SPEAKING_URL}>🎤 {IELTS_SPEAKING_CTA_LABEL}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="kid-btn-fun rounded-full text-purple-800"
              >
                <Link href={CAMBRIDGE_COURSES_URL}>📚 {CAMBRIDGE_COURSES_CTA_LABEL}</Link>
              </Button>
              <Button
                asChild
                size="default"
                className="rounded-full border-2 border-white/30 bg-white/10 font-normal text-white hover:bg-white/20"
              >
                <a href={VTEN_COURSE_URL} target="_blank" rel="noopener noreferrer">
                  👩‍🏫 {VTEN_COURSE_LABEL}
                </a>
              </Button>
            </div>
          </div>

          <div className="flex w-full min-w-0 justify-center lg:justify-end">
            <MascotHero
              mood="wave"
              className="max-w-full"
              messageSlot={
                <EditableText
                  contentKey="home.hero.mascotMessage"
                  defaultValue="Mình là Camba - Thỏ thông minh sẽ đồng hành cùng Bạn nhé!"
                  as="p"
                  multiline
                  className="text-base font-extrabold leading-snug text-white md:text-lg"
                />
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
