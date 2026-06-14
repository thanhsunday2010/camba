import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamLevel } from "@prisma/client";
import { auth } from "@/auth";
import { formatExamLevel, SKILLS } from "@/lib/constants";
import { getPublishedPapersByLevel } from "@/lib/exam/cached-papers";
import { getCompletedPaperIdsForUser } from "@/lib/exam/user-paper-progress";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { SkillPaperList } from "@/components/exam/skill-paper-list";

const SKILL_EMOJI: Record<string, string> = {
  READING: "📖",
  WRITING: "✏️",
  LISTENING: "🎧",
  SPEAKING: "🎤",
  USE_OF_ENGLISH: "🌟",
};

export const dynamic = "force-dynamic";

export default async function ExamsLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { level } = await params;
  const validLevels = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
  if (!validLevels.includes(level)) notFound();

  const examLevel = level as ExamLevel;
  const theme = LEVEL_THEMES[level] ?? LEVEL_THEMES.KET;

  const [papers, completedPaperIds] = await Promise.all([
    getPublishedPapersByLevel(examLevel),
    getCompletedPaperIdsForUser(session.user.id, examLevel),
  ]);

  const fullMocks = papers.filter((p) => p.paperKind === "MOCK_FULL");
  const practicePapers = papers.filter(
    (p) => p.paperKind !== "MOCK_FULL" && p.paperKind !== "PLACEMENT"
  );

  const mockCount = practicePapers.filter((p) => p.isMockTest).length;
  const totalNew = practicePapers.filter((p) => !completedPaperIds.has(p.id)).length;

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
              {totalNew > 0 && (
                <>
                  {" "}
                  · <span className="text-sky-600">{totalNew} bài mới</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {fullMocks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-extrabold text-amber-700">
            🏆 Full Mock — Thi thử tất cả kỹ năng
          </h2>
          <SkillPaperList
            papers={fullMocks.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              timeLimit: p.timeLimit,
              isMockTest: true,
            }))}
            completedPaperIds={completedPaperIds}
            className="border-amber-200"
          />
        </section>
      )}

      <div className="space-y-8">
        {grouped.map(({ skill, papers: skillPapers }) => {
          const skillNew = skillPapers.filter((p) => !completedPaperIds.has(p.id)).length;
          return (
            <section key={skill.value}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-base shadow-sm">
                  {SKILL_EMOJI[skill.value]}
                </div>
                <h2 className="text-lg font-extrabold">{skill.label}</h2>
                {skillPapers.length > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {skillNew > 0 ? `${skillNew} mới` : "✓ xong hết"}
                    {" · "}
                    {skillPapers.length} bài
                  </span>
                )}
              </div>

              {skillPapers.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground">
                  Chưa có đề cho kỹ năng này.
                </p>
              ) : (
                <SkillPaperList
                  papers={skillPapers.map((p) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    timeLimit: p.timeLimit,
                    isMockTest: p.isMockTest,
                  }))}
                  completedPaperIds={completedPaperIds}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
