"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_LEVELS, SKILLS } from "@/lib/constants";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { isYleLevel } from "@/lib/yle/constants";
import { HomeStreakCta } from "@/components/home/home-session-ctas";
import { HorizontalScrollTrack } from "@/components/ui/horizontal-scroll-track";
import { PlanetOrb } from "@/components/yle/yle-space-visuals";
import {
  CAMBRIDGE_COURSES_URL,
  IELTS_SPEAKING_CTA_LABEL,
  IELTS_SPEAKING_URL,
  IELTS_WRITING_URL,
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
import { EditableText } from "@/components/inline-edit/editable-text";
import { PlacementOpenButton } from "@/components/placement/placement-open-button";

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
    title: "Speaking IELTS Academic",
    subtitle: "Part 1 · 2 · 3",
    description: "1 câu ngẫu nhiên/Part · mock full Part 1+2+3 · AI chấm band",
    border: "border-rose-200",
    bg: "from-rose-50 to-white",
    accent: "bg-rose-600 hover:bg-rose-700",
  },
  {
    href: IELTS_WRITING_URL,
    emoji: "✏️",
    title: "Writing IELTS Academic",
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
            <EditableText
              contentKey="home.features.title"
              defaultValue="Luyện thông minh, không lặp đề"
              as="h2"
              className="kid-section-title kid-gradient-text mb-2"
            />
            <EditableText
              contentKey="home.features.subtitle"
              defaultValue="Mỗi kỹ năng một cách luyện phù hợp — từ trắc nghiệm nhanh đến chấm AI chi tiết"
              as="p"
              multiline
              className="text-muted-foreground"
            />
          </div>
          <HorizontalScrollTrack label="Tính năng luyện tập" className="lg:hidden">
            {PRACTICE_HIGHLIGHTS.map((item, index) => (
              <FeatureCard key={item.title} item={item} index={index} variant="scroll" />
            ))}
          </HorizontalScrollTrack>
          <div className="hidden gap-4 lg:grid lg:grid-cols-4">
            {PRACTICE_HIGHLIGHTS.map((item, index) => (
              <FeatureCard key={item.title} item={item} index={index} variant="grid" />
            ))}
          </div>
        </div>
      </section>

      {/* IELTS + Cambridge + Mock */}
      <section className="border-y border-purple-100/80 bg-white/60 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl space-y-10">
            <div>
              <EditableText
                contentKey="home.tracks.title"
                defaultValue="Chọn lộ trình luyện thi"
                as="h2"
                className="kid-section-title mb-2 text-center lg:text-left"
              />
              <EditableText
                contentKey="home.tracks.subtitle"
                defaultValue="IELTS tập trung Speaking/Writing · Cambridge đủ 5 kỹ năng theo level"
                as="p"
                multiline
                className="text-center text-muted-foreground lg:text-left"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <EditableText
                  contentKey="home.ielts.sectionTitle"
                  defaultValue="🇬🇧 IELTS Academic — Speaking & Writing"
                  as="h3"
                  className="mb-3 text-lg font-extrabold text-rose-800"
                />
            <HorizontalScrollTrack label="Lộ trình IELTS" className="lg:hidden">
              {IELTS_TRACK.map((track, index) => (
                <IeltsTrackCard key={track.href} track={track} index={index} variant="scroll" />
              ))}
            </HorizontalScrollTrack>
            <div className="hidden gap-3 lg:grid">
              {IELTS_TRACK.map((track, index) => (
                <IeltsTrackCard key={track.href} track={track} index={index} variant="grid" />
              ))}
            </div>
              </div>

              <div>
                <EditableText
                  contentKey="home.cambridge.sectionTitle"
                  defaultValue="📚 Cambridge — 5 kỹ năng"
                  as="h3"
                  className="mb-3 text-lg font-extrabold text-purple-800"
                />
                <Card className="kid-card border-2 border-purple-200 bg-gradient-to-br from-purple-50/80 to-white">
                  <CardContent className="py-5">
                    <EditableText
                      contentKey="home.cambridge.description"
                      defaultValue="Starters → FCE: Reading, Listening, Grammar · Writing & Speaking hub riêng với AI chấm"
                      as="p"
                      multiline
                      className="mb-4 text-sm font-medium text-muted-foreground"
                    />
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
                        <EditableText
                          contentKey="home.cambridge.cta"
                          defaultValue="Chọn level Cambridge"
                          as="span"
                        />
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
                  <EditableText
                    contentKey="home.mock.title"
                    defaultValue="Thi thử (Mock test)"
                    as="span"
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    contentKey="home.mock.description"
                    defaultValue="Luyện như thi thật — đề ngẫu nhiên từ ngân hàng, không trùng cho đến khi hết pool"
                    multiline
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 sm:grid-cols-3">
                  {MOCK_FEATURES.map((item, index) => (
                    <li
                      key={item.label}
                      className="rounded-xl border border-indigo-100 bg-white/80 px-4 py-3"
                    >
                      <p className="font-extrabold text-indigo-900">
                        <EditableText
                          contentKey={`home.mock.features.${index}.label`}
                          defaultValue={item.label}
                        />
                      </p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        <EditableText
                          contentKey={`home.mock.features.${index}.detail`}
                          defaultValue={item.detail}
                          multiline
                        />
                      </p>
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
              <EditableText
                contentKey="home.levels.title"
                defaultValue="Chọn cấp độ Cambridge"
                as="h2"
                className="kid-section-title mb-2"
              />
              <EditableText
                contentKey="home.levels.subtitle"
                defaultValue="YLE cho trẻ em · KET/PET/FCE cho học sinh THCS–THPT — mỗi level một màu"
                as="p"
                multiline
                className="text-muted-foreground"
              />
            </div>

            <div className="mb-8">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <EditableText
                  contentKey="home.levels.yleLabel"
                  defaultValue="YLE (Starters · Movers · Flyers)"
                  as="p"
                  className="text-sm font-extrabold uppercase tracking-wide text-purple-600"
                />
                <Link href="/yle" className="text-sm font-bold text-violet-700 underline">
                  Vào vũ trụ YLE →
                </Link>
              </div>
              <HorizontalScrollTrack label="Level YLE">
                {yleLevels.map((level) => (
                  <LevelScrollCard key={level.value} level={level} />
                ))}
              </HorizontalScrollTrack>
            </div>

            <div className="mb-6">
              <EditableText
                contentKey="home.levels.secondaryLabel"
                defaultValue="Secondary (KET · PET · FCE)"
                as="p"
                className="mb-3 text-sm font-extrabold uppercase tracking-wide text-purple-600"
              />
              <HorizontalScrollTrack label="Level Secondary">
                {secondaryLevels.map((level) => (
                  <LevelScrollCard key={level.value} level={level} />
                ))}
              </HorizontalScrollTrack>
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/exams">
                  <EditableText
                    contentKey="home.levels.ctaExams"
                    defaultValue="Xem hub luyện thi đầy đủ"
                    as="span"
                  />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={IELTS_SPEAKING_URL}>
                  🎤{" "}
                  <EditableText
                    contentKey="home.levels.ctaSpeaking"
                    defaultValue={IELTS_SPEAKING_CTA_LABEL}
                    as="span"
                  />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={IELTS_WRITING_URL}>
                  <EditableText
                    contentKey="home.levels.ctaWriting"
                    defaultValue="✏️ Luyện Writing IELTS Academic"
                    as="span"
                  />
                </Link>
              </Button>
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <Gem className="h-5 w-5 text-violet-600" />
                  <EditableText
                    contentKey="home.sidebar.pricing.title"
                    defaultValue="Gói Free, Pro & VIP"
                    as="span"
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    contentKey="home.sidebar.pricing.description"
                    defaultValue="AI chấm Writing & Speaking — lượt dùng chung mỗi ngày"
                    multiline
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full kid-btn-fun rounded-full">
                  <Link href="/pricing">
                    <EditableText
                      contentKey="home.sidebar.pricing.cta"
                      defaultValue="Xem bảng giá"
                      as="span"
                    />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <Target className="h-5 w-5 text-sky-600" />
                  <EditableText
                    contentKey="home.sidebar.placement.title"
                    defaultValue="Test trình độ"
                    as="span"
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    contentKey="home.sidebar.placement.description"
                    defaultValue="Test trình độ Tiếng Anh và các chương trình khác như SAT, ĐGNL, IQ, ..."
                    multiline
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlacementOpenButton variant="fun" className="w-full rounded-full">
                  <EditableText
                    contentKey="home.sidebar.placement.cta"
                    defaultValue="Làm test ngay"
                    as="span"
                  />
                </PlacementOpenButton>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <Trophy className="h-5 w-5 text-amber-600" />
                  <EditableText
                    contentKey="home.sidebar.streak.title"
                    defaultValue="Streak & xếp hạng"
                    as="span"
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    contentKey="home.sidebar.streak.description"
                    defaultValue="Học mỗi ngày giữ 🔥 streak và leo bảng xếp hạng cùng bạn bè"
                    multiline
                  />
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

function FeatureCard({
  item,
  index,
  variant,
}: {
  item: (typeof PRACTICE_HIGHLIGHTS)[number];
  index: number;
  variant: "scroll" | "grid";
}) {
  return (
    <Card
      className={`kid-card border-2 border-purple-100 ${variant === "scroll" ? "scroll-card w-[min(78vw,16rem)]" : ""}`}
    >
      <CardHeader className="pb-2">
        <div
          className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${item.color} p-2.5 text-white shadow-md`}
        >
          <item.icon className="h-5 w-5" />
        </div>
        <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
          {item.badge}
        </span>
        <CardTitle className="mt-2 text-base font-extrabold">
          <EditableText contentKey={`home.highlights.${index}.title`} defaultValue={item.title} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm font-medium leading-relaxed">
          <EditableText
            contentKey={`home.highlights.${index}.description`}
            defaultValue={item.description}
            multiline
          />
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function IeltsTrackCard({
  track,
  index,
  variant,
}: {
  track: (typeof IELTS_TRACK)[number];
  index: number;
  variant: "scroll" | "grid";
}) {
  return (
    <Link href={track.href} className={`group block ${variant === "scroll" ? "scroll-card w-[min(85vw,20rem)] shrink-0" : ""}`}>
      <Card
        className={`kid-card h-full border-2 bg-gradient-to-br ${track.bg} ${track.border} transition-all group-hover:-translate-y-0.5`}
      >
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-5">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="text-3xl">{track.emoji}</span>
            <div>
              <p className="font-extrabold">
                <EditableText contentKey={`home.ielts.tracks.${index}.title`} defaultValue={track.title} />
              </p>
              <p className="text-sm font-bold text-muted-foreground">
                <EditableText contentKey={`home.ielts.tracks.${index}.subtitle`} defaultValue={track.subtitle} />
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                <EditableText
                  contentKey={`home.ielts.tracks.${index}.description`}
                  defaultValue={track.description}
                  multiline
                />
              </p>
            </div>
          </div>
          <span
            className={`kid-btn-fun inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-bold text-white sm:w-auto ${track.accent}`}
          >
            <EditableText contentKey={`home.ielts.tracks.${index}.cta`} defaultValue="Vào luyện" as="span" />
            <ArrowRight className="h-4 w-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function LevelScrollCard({ level }: { level: (typeof EXAM_LEVELS)[number] }) {
  const theme = LEVEL_THEMES[level.value] ?? LEVEL_THEMES.KET;
  const href = isYleLevel(level.value) ? `/yle/${level.value}` : `/exams/${level.value}`;

  return (
    <Link href={href} className="scroll-card group w-[min(78vw,15rem)] shrink-0">
      <Card
        className={`kid-card h-full overflow-hidden border-2 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg ${theme.border}`}
      >
        <div className={`bg-gradient-to-br p-4 ${theme.bg}`}>
          <div className="flex items-center gap-3">
            <PlanetOrb gradient={theme.planetGradient} emoji={theme.emoji} size="sm" />
            <div className="min-w-0">
              <CardTitle className="text-base font-extrabold leading-tight">{level.label}</CardTitle>
              <CardDescription className="font-semibold">{level.group}</CardDescription>
            </div>
          </div>
        </div>
        <CardContent className="pt-3">
          <p className="text-sm font-semibold text-purple-700">
            {isYleLevel(level.value) ? "Vũ trụ · quỹ đạo · mock" : "Reading · Listening · Mock"}
          </p>
          <span className="mt-2 inline-flex items-center text-xs font-bold text-violet-600 group-hover:underline">
            Vào luyện <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
