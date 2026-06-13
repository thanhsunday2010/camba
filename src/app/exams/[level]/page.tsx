import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamLevel } from "@prisma/client";
import { formatExamLevel, formatSkill, SKILLS } from "@/lib/constants";
import { getPublishedPapersByLevel } from "@/lib/exam/cached-papers";
import { LEVEL_THEMES, SKILL_COLORS } from "@/lib/kids/level-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Headphones, Mic, PenLine, Languages } from "lucide-react";

const skillIcons: Record<string, typeof BookOpen> = {
  READING: BookOpen,
  WRITING: PenLine,
  LISTENING: Headphones,
  SPEAKING: Mic,
  USE_OF_ENGLISH: Languages,
};

const SKILL_EMOJI: Record<string, string> = {
  READING: "📖",
  WRITING: "✏️",
  LISTENING: "🎧",
  SPEAKING: "🎤",
  USE_OF_ENGLISH: "🌟",
};

export const revalidate = 300;

export default async function ExamsLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const validLevels = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
  if (!validLevels.includes(level)) notFound();

  const theme = LEVEL_THEMES[level] ?? LEVEL_THEMES.KET;

  const papers = await getPublishedPapersByLevel(level as ExamLevel);

  const fullMocks = papers.filter((p) => p.paperKind === "MOCK_FULL");
  const practicePapers = papers.filter((p) => p.paperKind !== "MOCK_FULL" && p.paperKind !== "PLACEMENT");

  const mockCount = practicePapers.filter((p) => p.isMockTest).length;

  const grouped = SKILLS.map((skill) => ({
    skill,
    papers: practicePapers.filter((p) => p.skill === skill.value),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`mb-8 rounded-3xl border-2 ${theme.border} ${theme.bg} p-6 shadow-md`}>
        <Link
          href="/exams"
          className="mb-3 inline-flex text-sm font-bold text-purple-600 hover:underline"
        >
          ← Đổi level khác
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{theme.emoji}</span>
          <div>
            <h1 className="text-3xl font-extrabold kid-gradient-text">{formatExamLevel(level)}</h1>
            <p className="font-semibold text-muted-foreground">
              {practicePapers.length} đề luyện tập · {mockCount} mock test
              {fullMocks.length > 0 && ` · ${fullMocks.length} full mock 🏆`}
            </p>
          </div>
        </div>
      </div>

      {fullMocks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-extrabold text-amber-700">
            🏆 Full Mock — Thi thử tất cả kỹ năng
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fullMocks.map((paper) => (
              <Link key={paper.id} href={`/practice/${paper.id}`}>
                <Card className="kid-card h-full border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-extrabold">{paper.title}</CardTitle>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">Full Mock</Badge>
                    </div>
                    {paper.description && (
                      <CardDescription className="font-medium">{paper.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {paper.timeLimit && (
                      <span className="flex items-center gap-1 text-sm font-semibold text-amber-800">
                        <Clock className="h-4 w-4" />
                        {Math.floor(paper.timeLimit / 60)} phút
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-10">
        {grouped.map(({ skill, papers: skillPapers }) => {
          const Icon = skillIcons[skill.value] ?? BookOpen;
          const skillGradient = SKILL_COLORS[skill.value] ?? "from-purple-400 to-pink-400";
          return (
            <section key={skill.value}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${skillGradient} text-lg shadow-md`}>
                  {SKILL_EMOJI[skill.value]}
                </div>
                <h2 className="text-xl font-extrabold">{skill.label}</h2>
              </div>

              {skillPapers.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground">Chưa có đề cho kỹ năng này.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {skillPapers.map((paper) => (
                    <Link key={paper.id} href={`/practice/${paper.id}`}>
                      <Card className="kid-card h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg font-bold">{paper.title}</CardTitle>
                            {paper.isMockTest && (
                              <Badge variant="secondary" className="font-bold">Mock ⭐</Badge>
                            )}
                          </div>
                          {paper.description && (
                            <CardDescription className="font-medium">{paper.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                            {paper.timeLimit && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.floor(paper.timeLimit / 60)} phút
                              </span>
                            )}
                            <span>{formatSkill(paper.skill)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
