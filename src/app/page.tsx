import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_LEVELS } from "@/lib/constants";
import { auth } from "@/auth";
import {
  BookOpen,
  Brain,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
  Trophy,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <div>
      <section className="bg-gradient-to-br from-cambridge-600 via-cambridge-700 to-cambridge-900 text-white">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm">
              <Sparkles className="h-4 w-4" />
              AI chấm Writing & Speaking theo rubric Cambridge (Gemini)
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Luyện thi Cambridge
              <br />
              <span className="text-cambridge-200">dành cho K12</span>
            </h1>
            <p className="mt-6 text-lg text-cambridge-100 md:text-xl">
              Camba giúp bạn luyện Starters, Movers, Flyers, KET, PET, FCE với
              chấm điểm tự động và phản hồi AI chi tiết bằng tiếng Việt.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {session ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/dashboard">Vào Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/register">Bắt đầu miễn phí</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Tính năng nổi bật</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, title: "Reading & Use of English", desc: "Chấm tự động, giải thích câu sai bằng AI" },
            { icon: PenLine, title: "Writing AI", desc: "Chấm theo tiêu chí Cambridge, highlight lỗi" },
            { icon: Headphones, title: "Listening", desc: "Audio player tích hợp, chấm MCQ tức thì" },
            { icon: Mic, title: "Speaking AI", desc: "Web Speech API (miễn phí) → Gemini chấm bài" },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="h-8 w-8 text-cambridge-600" />
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Chọn cấp độ Cambridge</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXAM_LEVELS.map((level) => (
              <Link key={level.value} href={`/exams/${level.value}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{level.label}</CardTitle>
                      <span className="rounded-full bg-cambridge-100 px-2 py-0.5 text-xs font-medium text-cambridge-700">
                        {level.group}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Luyện tập theo kỹ năng →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <Trophy className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-2xl font-bold">Gamification & Theo dõi tiến độ</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Streak hàng ngày, bảng xếp hạng, dashboard theo kỹ năng giúp bạn biết mình
          cần cải thiện phần nào trước khi thi thật.
        </p>
        <Brain className="mx-auto mt-8 h-8 w-8 text-cambridge-500" />
      </section>
    </div>
  );
}
