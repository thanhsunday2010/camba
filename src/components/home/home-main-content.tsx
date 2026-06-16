import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_LEVELS, SKILLS } from "@/lib/constants";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { HomeStreakCta } from "@/components/home/home-session-ctas";
import {
  CAMBRIDGE_COURSES_URL,
  IELTS_SPEAKING_CTA_LABEL,
  IELTS_SPEAKING_URL,
} from "@/lib/site/ielts-speaking-cta";
import {
  ArrowRight,
  BookOpen,
  Gem,
  Headphones,
  Mic,
  PenLine,
  Target,
  Trophy,
  Zap,
  Languages,
  Shuffle,
  Star,
  ClipboardCheck,
} from "lucide-react";

const IELTS_WRITING_URL = "/ielts/writing";

const PRACTICE_HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Reading & Listening",
    description: "10 câu ngẫu nhiên/lần · chấm & giải thích ngay · âm thanh phản hồi",
    color: "from-sky-500 to-blue-600",
    badge: "Phản hồi tức thì",
  },
  {
    icon: PenLine,
    title: "Writing AI",
    description: "1 câu/Task · nộp bài & chấm band Cambridge/IELTS ngay sau khi viết",
    color: "from-amber-500 to-orange-600",
    badge: "Chấm AI",
  },
  {
    icon: Mic,
    title: "Speaking AI",
    description: "1 câu/Part · ghi âm trên web · AI chấm phát âm & fluency",
    color: "from-rose-500 to-pink-600",
    badge: "Chấm AI",
  },
  {
    icon: Shuffle,
    title: "Ngân hàng đa dạng",
    description: "Câu hỏi không lặp nội dung trong cùng một lần làm · dễ/vừa/khó theo level",
    color: "from-violet-500 to-purple-600",
    badge: "Pool thông minh",
  },
] as const;

const IELTS_TRACK = [
  {
    href: IELTS_SPEAKING_URL,
    emoji: "🎤",
    title: "Speaking IELTS",
    subtitle: "Part 1 · 2 · 3",
    description: "1 câu ngẫu nhiên/Part · mock full Part 1+2+3 · AI chấm band",
    border: "border-rose-200",
    bg: "from-rose-50 to-white",
    accent: "bg-rose-600 hover:bg-rose-700",
  },
  {
    href: IELTS_WRITING_URL,
    emoji: "✏️",
    title: "Writing IELTS",
    subtitle: "Task 1 · Task 2",
    description: "1 câu/Task · nộp & chấm AI ngay · mock Task 1 + Task 2",
    border: "border-amber-200",
    bg: "from-amber-50 to-white",
    accent: "bg-amber-600 hover:bg-amber-700",
  },
] as const;

const MOCK_FEATURES = [
  { label: "Mock theo kỹ năng", detail: "Reading, Listening, Grammar… — câu ngẫu nhiên, không lặp đề" },
  { label: "Mock full test", detail: "Thi thử đủ phần theo format Cambridge từng level" },
  { label: "Mock IELTS", detail: "Speaking/Writing full task — AI chấm sau khi nộp" },
] as const;

const SKILL_ICONS: Record<string, typeof BookOpen> = {
  READING: BookOpen,
  LISTENING: Headphones,
  WRITING: PenLine,
  SPEAKING: Mic,
  USE_OF_ENGLISH: Languages,
};

export function HomeMainContent() {
  const yleLevels = EXAM_LEVELS.filter((l) => l.group === "YLE");
  const secondaryLevels = EXAM_LEVELS.filter((l) => l.group === "Secondary");

  return (
    <>
      {/* Tính năng luyện tập */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="kid-section-title kid-gradient-text mb-2">Luyện thông minh, không lặp đề</h2>
            <p className="text-muted-foreground">
              Mỗi kỹ năng một cách luyện phù hợp — từ trắc nghiệm nhanh đến chấm AI chi tiết
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRACTICE_HIGHLIGHTS.map((item) => (
              <Card key={item.title} className="kid-card border-2 border-purple-100">
                <CardHeader className="pb-2">
                  <div
                    className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${item.color} p-2.5 text-white shadow-md`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                    {item.badge}
                  </span>
                  <CardTitle className="mt-2 text-base font-extrabold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm font-medium leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* IELTS + Cambridge + Mock */}
      <section className="border-y border-purple-100/80 bg-white/60 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl space-y-10">
            <div>
              <h2 className="kid-section-title mb-2 text-center lg:text-left">Chọn lộ trình luyện thi</h2>
              <p className="text-center text-muted-foreground lg:text-left">
                IELTS tập trung Speaking/Writing · Cambridge đủ 5 kỹ năng theo level
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-extrabold text-rose-800">🇬🇧 IELTS — Speaking & Writing</h3>
                <div className="grid gap-3">
                  {IELTS_TRACK.map((track) => (
                    <Link key={track.href} href={track.href} className="group block">
                      <Card
                        className={`kid-card border-2 bg-gradient-to-br ${track.bg} ${track.border} transition-all group-hover:-translate-y-0.5`}
                      >
                        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <span className="text-3xl">{track.emoji}</span>
                            <div>
                              <p className="font-extrabold">{track.title}</p>
                              <p className="text-sm font-bold text-muted-foreground">{track.subtitle}</p>
                              <p className="mt-1 text-sm font-medium text-muted-foreground">
                                {track.description}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`kid-btn-fun inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-white ${track.accent}`}
                          >
                            Vào luyện
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-extrabold text-purple-800">📚 Cambridge — 5 kỹ năng</h3>
                <Card className="kid-card border-2 border-purple-200 bg-gradient-to-br from-purple-50/80 to-white">
                  <CardContent className="py-5">
                    <p className="mb-4 text-sm font-medium text-muted-foreground">
                      Starters → FCE: Reading, Listening, Grammar · Writing & Speaking hub riêng với AI chấm
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {SKILLS.map((skill) => {
                        const Icon = SKILL_ICONS[skill.value] ?? BookOpen;
                        const isAi = skill.value === "WRITING" || skill.value === "SPEAKING";
                        return (
                          <div
                            key={skill.value}
                            className="flex items-center gap-2 rounded-xl border border-purple-100 bg-white/80 px-3 py-2.5"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-purple-600" />
                            <span className="text-xs font-bold leading-tight sm:text-sm">
                              {skill.label}
                              {isAi && (
                                <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] text-amber-800">
                                  AI
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <Button asChild className="mt-5 w-full kid-btn-fun rounded-full">
                      <Link href={CAMBRIDGE_COURSES_URL}>
                        Chọn level Cambridge
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="kid-card border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                  Thi thử (Mock test)
                </CardTitle>
                <CardDescription>
                  Luyện như thi thật — đề ngẫu nhiên từ ngân hàng, không trùng cho đến khi hết pool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 sm:grid-cols-3">
                  {MOCK_FEATURES.map((item) => (
                    <li
                      key={item.label}
                      className="rounded-xl border border-indigo-100 bg-white/80 px-4 py-3"
                    >
                      <p className="font-extrabold text-indigo-900">{item.label}</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Level + sidebar — giữ sidebar gốc */}
      <section className="container mx-auto px-4 py-14 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="kid-section-title mb-2">Chọn cấp độ Cambridge</h2>
              <p className="text-muted-foreground">
                YLE cho trẻ em · KET/PET/FCE cho học sinh THCS–THPT — mỗi level một màu
              </p>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-purple-600">
                YLE (Starters · Movers · Flyers)
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {yleLevels.map((level) => (
                  <LevelCard key={level.value} level={level} />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-purple-600">
                Secondary (KET · PET · FCE)
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {secondaryLevels.map((level) => (
                  <LevelCard key={level.value} level={level} />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/exams">Xem hub luyện thi đầy đủ</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={IELTS_SPEAKING_URL}>🎤 {IELTS_SPEAKING_CTA_LABEL}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={IELTS_WRITING_URL}>✏️ Luyện Writing IELTS</Link>
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
                  AI chấm Writing & Speaking — lượt dùng chung mỗi ngày
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
                  V-ACT · HSA · TSA — bài test giúp chọn trình độ phù hợp
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
    </>
  );
}

function LevelCard({ level }: { level: (typeof EXAM_LEVELS)[number] }) {
  const theme = LEVEL_THEMES[level.value] ?? LEVEL_THEMES.KET;

  return (
    <Link href={`/exams/${level.value}`} className="group">
      <Card
        className={`kid-card h-full border-2 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg ${theme.border} ${theme.bg}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{theme.emoji}</span>
              <div>
                <CardTitle className="text-base font-extrabold lg:text-lg">{level.label}</CardTitle>
                <CardDescription className="font-semibold">{level.group}</CardDescription>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold text-purple-700">
            Reading · Listening · Writing · Speaking · Mock
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
