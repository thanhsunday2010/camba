"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MascotHero } from "@/components/kids/mascot-buddy";
import { EditableText } from "@/components/inline-edit/editable-text";
import { VTEN_COURSE_LABEL, VTEN_COURSE_URL } from "@/lib/site/vten-course";
import {
  CAMBRIDGE_COURSES_CTA_LABEL,
  CAMBRIDGE_COURSES_URL,
  IELTS_SPEAKING_CTA_LABEL,
  IELTS_SPEAKING_URL,
} from "@/lib/site/ielts-speaking-cta";

export function HomeHero() {
  return (
    <section className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-yellow-300 blur-xl animate-float" />
        <div
          className="absolute right-20 top-20 h-32 w-32 rounded-full bg-sky-300 blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-10 left-1/3 h-24 w-24 rounded-full bg-green-300 blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>
      <div className="container relative mx-auto px-4 py-14 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0 w-full text-center lg:text-left">
            <EditableText
              contentKey="home.hero.title"
              defaultValue="Giỏi Tiếng Anh cùng Camba!"
              as="h1"
              className="text-2xl font-extrabold tracking-tight md:text-5xl lg:text-6xl lg:leading-tight"
            />
            <EditableText
              contentKey="home.hero.subtitle"
              defaultValue="App học Tiếng Anh miễn phí có AI chấm sửa."
              as="p"
              multiline
              className="mt-6 max-w-xl text-lg font-semibold text-white/90 md:text-xl lg:mx-0 lg:mt-8"
            />
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button asChild size="lg" variant="fun" className="rounded-full">
                <Link href="/placement">🎯 Test trình độ</Link>
              </Button>
              <Button asChild size="lg" className="rounded-full bg-rose-600 font-bold hover:bg-rose-700">
                <Link href={IELTS_SPEAKING_URL}>🎤 {IELTS_SPEAKING_CTA_LABEL}</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="kid-btn-fun rounded-full text-purple-800">
                <Link href={CAMBRIDGE_COURSES_URL}>📚 {CAMBRIDGE_COURSES_CTA_LABEL}</Link>
              </Button>
              <Button
                asChild
                size="default"
                className="rounded-full border-2 border-white bg-white/10 font-normal text-white hover:bg-white/20"
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
