import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_LEVELS } from "@/lib/constants";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { MascotHero } from "@/components/kids/mascot-buddy";
import { HomeHeroCtas, HomeStreakCta } from "@/components/home/home-session-ctas";
import { Trophy, Target, Gem, ArrowRight, Star } from "lucide-react";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white">
        <div className="absolute inset-0 opacity-20">
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
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl lg:leading-tight">
                Giỏi Tiếng Anh cùng Camba!
              </h1>
              <p className="mt-6 max-w-xl text-lg font-semibold text-white/90 md:text-xl lg:mx-0 lg:mt-8">
                App học Tiếng Anh miễn phí có AI chấm sửa.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                <HomeHeroCtas />
                <Button asChild size="lg" variant="fun" className="rounded-full">
                  <Link href="/placement">🎯 Test trình độ</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-white shadow-lg hover:from-violet-600 hover:to-fuchsia-600"
                >
                  <Link href="/pricing">💎 Bảng giá</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <MascotHero
                message="Mình là Camba - Thỏ thông minh sẽ đồng hành cùng Bạn nhé!"
                mood="wave"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="kid-section-title mb-2">Chọn cấp độ của bạn</h2>
              <p className="text-muted-foreground">
                Mỗi level một màu — nhấn để vào luyện tập ngay
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {EXAM_LEVELS.map((level) => {
                const theme = LEVEL_THEMES[level.value] ?? LEVEL_THEMES.KET;
                return (
                  <Link key={level.value} href={`/exams/${level.value}`} className="group">
                    <Card
                      className={`kid-card h-full border-2 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg ${theme.border} ${theme.bg}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{theme.emoji}</span>
                            <div>
                              <CardTitle className="text-base font-extrabold lg:text-lg">
                                {level.label}
                              </CardTitle>
                              <CardDescription className="font-semibold">
                                {level.group}
                              </CardDescription>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 shrink-0 text-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-semibold text-purple-700">Luyện tập →</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 text-center lg:text-left">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/exams">Xem tất cả level</Link>
              </Button>
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <Gem className="h-5 w-5 text-violet-600" />
                  Gói Free, Pro & VIP
                </CardTitle>
                <CardDescription>
                  AI chấm sửa & giải thích — lượt dùng chung mỗi ngày
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full kid-btn-fun rounded-full">
                  <Link href="/pricing">Xem bảng giá</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <Target className="h-5 w-5 text-sky-600" />
                  Test trình độ
                </CardTitle>
                <CardDescription>
                  Bài test giúp chọn trình độ phù hợp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="fun" className="w-full rounded-full">
                  <Link href="/placement">Làm test ngay</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <Trophy className="h-5 w-5 text-amber-600" />
                  Streak & xếp hạng
                </CardTitle>
                <CardDescription>
                  Học mỗi ngày giữ 🔥 streak và leo bảng xếp hạng cùng bạn bè
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-sunshine-400 text-sunshine-400" />
                  ))}
                </div>
                <HomeStreakCta />
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
