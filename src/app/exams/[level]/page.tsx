import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamLevel, PaperKind } from "@prisma/client";
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
  USE_OF_ENGLISH: "📝",
};

const YLE_LEVELS = new Set(["STARTERS", "MOVERS", "FLYERS"]);

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
  const isYle = YLE_LEVELS.has(level);

  const [papers, completedPaperIds] = await Promise.all([
    getPublishedPapersByLevel(examLevel),
    getCompletedPaperIdsForUser(session.user.id, examLevel),
  ]);

  const fullMocks = papers.filter((p) => p.paperKind === PaperKind.MOCK_FULL);
  const skillPapers = papers.filter(
    (p) => p.paperKind !== PaperKind.MOCK_FULL && p.paperKind !== PaperKind.PLACEMENT
  );

  const practiceOnly = skillPapers.filter((p) => p.paperKind === PaperKind.PRACTICE);
  const skillMocks = skillPapers.filter((p) => p.paperKind === PaperKind.MOCK_SKILL);
  const totalNew = skillPapers.filter((p) => !completedPaperIds.has(p.id)).length;

  const skillsForPage = SKILLS.filter(
    (skill) => skill.value !== "USE_OF_ENGLISH" || !isYle
  );

  const grouped = skillsForPage.map((skill) => ({
    skill,
    practice: practiceOnly.filter((p) => p.skill === skill.value),
    mocks: skillMocks.filter((p) => p.skill === skill.value),
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
              {practiceOnly.length} đề luyện tập · {skillMocks.length} mock kỹ năng
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

      <div className="space-y-10">
        {grouped.map(({ skill, practice, mocks }) => {
          const allSkill = [...practice, ...mocks];
          const skillNew = allSkill.filter((p) => !completedPaperIds.has(p.id)).length;

          if (allSkill.length === 0) {
            return (
              <section key={skill.value}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-base shadow-sm">
                    {SKILL_EMOJI[skill.value]}
                  </div>
                  <h2 className="text-lg font-extrabold">{skill.label}</h2>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Chưa có đề cho kỹ năng này.
                </p>
              </section>
            );
          }

          return (
            <section key={skill.value}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-base shadow-sm">
                  {SKILL_EMOJI[skill.value]}
                </div>
                <h2 className="text-lg font-extrabold">{skill.label}</h2>
                {skillNew > 0 && (
                  <span className="text-xs font-semibold text-sky-600">{skillNew} mới</span>
                )}
              </div>

              <div className="space-y-6">
                {practice.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-purple-700">
                      📚 Luyện tập · {practice.length} đề
                    </h3>
                    <SkillPaperList
                      papers={practice.map((p) => ({
                        id: p.id,
                        title: p.title,
                        description: p.description,
                        timeLimit: p.timeLimit,
                        isMockTest: false,
                      }))}
                      completedPaperIds={completedPaperIds}
                    />
                  </div>
                )}

                {mocks.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-amber-700">
                      ⏱ Mock test · {mocks.length} đề
                    </h3>
                    <SkillPaperList
                      papers={mocks.map((p) => ({
                        id: p.id,
                        title: p.title,
                        description: p.description,
                        timeLimit: p.timeLimit,
                        isMockTest: true,
                      }))}
                      completedPaperIds={completedPaperIds}
                      className="border-amber-200"
                    />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
