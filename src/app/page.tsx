import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_LEVELS } from "@/lib/constants";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { MascotHero } from "@/components/kids/mascot-buddy";
import { auth } from "@/auth";
import {
  BookOpen,
  Brain,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
  Trophy,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Reading",
    desc: "Đọc hiểu vui như chơi game!",
    emoji: "📖",
    gradient: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    icon: PenLine,
    title: "Writing AI",
    desc: "AI chấm bài và khen bạn giỏi!",
    emoji: "✏️",
    gradient: "from-amber-400 to-orange-400",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    icon: Headphones,
    title: "Listening",
    desc: "Nghe audio hay ho, chọn đáp án!",
    emoji: "🎧",
    gradient: "from-purple-400 to-pink-400",
    bg: "bg-purple-50 border-purple-200",
  },
  {
    icon: Mic,
    title: "Speaking AI",
    desc: "Nói tiếng Anh — robot chấm giúp!",
    emoji: "🎤",
    gradient: "from-rose-400 to-red-400",
    bg: "bg-rose-50 border-rose-200",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-yellow-300 blur-xl animate-float" />
          <div className="absolute right-20 top-20 h-32 w-32 rounded-full bg-sky-300 blur-xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-10 left-1/3 h-24 w-24 rounded-full bg-green-300 blur-xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex animate-bounce-in items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-bold backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-200" />
              Học tiếng Anh Cambridge — vui như chơi! 🎮
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Xin chào, bạn nhỏ!
              <br />
              <span className="text-yellow-200">Cùng Camba học giỏi nhé!</span>
            </h1>
            <p className="mt-6 text-lg font-semibold text-white/90 md:text-xl">
              Luyện Starters, Movers, Flyers, KET, PET, FCE với màu sắc, âm thanh
              và AI chấm bài thông minh — dành riêng cho bạn!
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              {session ? (
                <Button asChild size="lg" variant="secondary" className="kid-btn-fun rounded-full text-purple-800">
                  <Link href="/dashboard">🏠 Vào trang của tôi</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" variant="secondary" className="kid-btn-fun rounded-full text-purple-800">
                    <Link href="/register">🚀 Bắt đầu miễn phí</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white font-bold text-white hover:bg-white/20">
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                </>
              )}
              <Button asChild size="lg" variant="fun" className="rounded-full">
                <Link href="/placement">🎯 Test trình độ</Link>
              </Button>
            </div>
            <div className="mt-10 flex justify-center gap-6 text-4xl lg:justify-start">
              <span className="animate-float">⭐</span>
              <span className="animate-float" style={{ animationDelay: "0.5s" }}>🌈</span>
              <span className="animate-float" style={{ animationDelay: "1s" }}>🎈</span>
              <span className="animate-float" style={{ animationDelay: "1.5s" }}>🏆</span>
            </div>
            </div>
            <div className="shrink-0">
              <MascotHero
                message="Mình là Camba 🐰 — thỏ thông minh cùng bạn chinh phục tiếng Anh Cambridge!"
                mood="wave"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="kid-section-title mb-2 text-center">
          <span className="kid-gradient-text">4 siêu năng lực</span> của bạn
        </h2>
        <p className="mb-10 text-center text-muted-foreground">Chọn kỹ năng yêu thích và bắt đầu phiêu lưu!</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc, emoji, gradient, bg }) => (
            <Card key={title} className={`${bg} animate-bounce-in border-2`}>
              <CardHeader>
                <div className={`mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-md`}>
                  {emoji}
                </div>
                <CardTitle className="text-lg font-extrabold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-medium">{desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-purple-50 to-sky-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="kid-section-title mb-2 text-center">Chọn cấp độ của bạn</h2>
          <p className="mb-10 text-center text-muted-foreground">Mỗi level một màu — dễ nhớ, dễ chọn!</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXAM_LEVELS.map((level) => {
              const theme = LEVEL_THEMES[level.value] ?? LEVEL_THEMES.KET;
              return (
                <Link key={level.value} href={`/exams/${level.value}`}>
                  <Card className={`kid-card border-2 ${theme.border} ${theme.bg}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{theme.emoji}</span>
                          <CardTitle className="text-lg font-extrabold">{level.label}</CardTitle>
                        </div>
                        <span className={`rounded-full bg-gradient-to-r ${theme.gradient} px-3 py-1 text-xs font-bold text-white shadow-sm`}>
                          {level.group}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-semibold text-purple-700">Nhấn để luyện tập →</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-lg rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-lg">
          <Trophy className="mx-auto h-16 w-16 text-amber-500 animate-pulse-soft" />
          <h2 className="mt-4 text-2xl font-extrabold kid-gradient-text">Streak & Bảng xếp hạng</h2>
          <p className="mx-auto mt-3 font-medium text-muted-foreground">
            Học mỗi ngày để giữ 🔥 streak! Leo hạng cùng bạn bè và nhận sao vàng ⭐
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-6 w-6 fill-sunshine-400 text-sunshine-400" />
            ))}
          </div>
        </div>
        <Brain className="mx-auto mt-10 h-10 w-10 text-purple-500" />
      </section>
    </div>
  );
}
