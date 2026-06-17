import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamLevel, PaperKind, Skill } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel, SKILLS } from "@/lib/constants";
import { getPublishedPapersByLevel } from "@/lib/exam/cached-papers";
import { getCompletedPaperIdsForUser } from "@/lib/exam/user-paper-progress";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { getDailyUsageSnapshot } from "@/lib/subscription/service";
import { formatQuotaRatio, isUnlimitedQuota } from "@/lib/subscription/plans";
import {
  buildMockFullPoolKey,
  buildMockSkillPoolKey,
  buildPracticePoolKey,
} from "@/lib/exam/practice-pool";
import {
  countCambridgeSpeakingMockBankQuestions,
  countCambridgeWritingMockBankQuestions,
  countFullMockBankQuestions,
  getMockBankStats,
  getSkillPracticeBankStats,
  formatBankQuestionCount,
} from "@/lib/exam/bank-stats";
import { getCambridgeSpeakingParts } from "@/lib/exam/cambridge-speaking-config";
import { getCambridgeWritingParts } from "@/lib/exam/cambridge-writing-config";
import { FullMockGrid, SkillPracticeGrid } from "@/components/exam/skill-practice-grid";
import { Card, CardContent } from "@/components/ui/card";
import { CambridgeLevelHubHeader } from "@/components/inline-edit/page-editable-sections";

const SKILL_EMOJI: Record<string, string> = {
  READING: "📖",
  WRITING: "✏️",
  LISTENING: "🎧",
  SPEAKING: "🎤",
  USE_OF_ENGLISH: "📝",
};

const YLE_LEVELS = new Set(["STARTERS", "MOVERS", "FLYERS"]);

export const revalidate = 60;

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

  const [papers, completedPaperIds, usage] = await Promise.all([
    getPublishedPapersByLevel(examLevel),
    getCompletedPaperIdsForUser(session.user.id, examLevel),
    getDailyUsageSnapshot(session.user.id),
  ]);

  const fullMocks = papers.filter((p) => p.paperKind === PaperKind.MOCK_FULL);
  const skillPapers = papers.filter(
    (p) => p.paperKind !== PaperKind.MOCK_FULL && p.paperKind !== PaperKind.PLACEMENT
  );

  const practiceOnly = skillPapers.filter((p) => p.paperKind === PaperKind.PRACTICE);
  const skillMocks = skillPapers.filter((p) => p.paperKind === PaperKind.MOCK_SKILL);

  const mockTestLimit = usage.mockTestLimit;
  const mockTestUsedUp =
    !isUnlimitedQuota(mockTestLimit) && usage.mockSkillCount >= mockTestLimit;
  const fullMockLocked = mockTestUsedUp;

  const gridSkillValues = SKILLS.filter(
    (skill) => skill.value !== "SPEAKING" && skill.value !== "WRITING"
  ).map((skill) => skill.value as Skill);

  const [skillStatsEntries, fullMockQuestionCount, speakingQuestionCount, writingQuestionCount] =
    await Promise.all([
      Promise.all(
        gridSkillValues.map(async (skill) => {
          const stats = await getSkillPracticeBankStats(
            db,
            examLevel,
            skill,
            buildPracticePoolKey(examLevel, skill),
            buildMockSkillPoolKey(examLevel, skill)
          );
          return { skill, stats };
        })
      ),
      countFullMockBankQuestions(db, examLevel),
      countCambridgeSpeakingMockBankQuestions(db, examLevel),
      countCambridgeWritingMockBankQuestions(db, examLevel),
    ]);

  const skillStatsMap = new Map(skillStatsEntries.map((e) => [e.skill, e.stats]));
  const fullMockBankStats = await getMockBankStats(
    db,
    fullMockQuestionCount,
    buildMockFullPoolKey(examLevel)
  );
  const speakingPartCount = getCambridgeSpeakingParts(examLevel).length;
  const writingPartCount = getCambridgeWritingParts(examLevel).length;

  const gridSkills = SKILLS.filter(
    (skill) => skill.value !== "SPEAKING" && skill.value !== "WRITING"
  ).map((skill) => {
    const skillValue = skill.value as Skill;
    const practice = practiceOnly.find((p) => p.skill === skillValue);
    const mock = skillMocks.find((p) => p.skill === skillValue);
    const bank = skillStatsMap.get(skillValue);

    return {
      skillLabel:
        isYle && skill.value === "USE_OF_ENGLISH" ? "Grammar (bổ trợ)" : skill.label,
      skillEmoji: SKILL_EMOJI[skill.value],
      practiceInfo: "",
      practiceBankStats: bank?.practice,
      mockBankStats: bank?.mock,
      practice: practice
        ? {
            id: practice.id,
            title: practice.title,
            description: practice.description,
            timeLimit: practice.timeLimit,
            isMockTest: false,
          }
        : undefined,
      mock: mock
        ? {
            id: mock.id,
            title: mock.title,
            description: mock.description,
            timeLimit: mock.timeLimit,
            isMockTest: true,
          }
        : undefined,
      practiceDone: practice ? completedPaperIds.has(practice.id) : false,
      mockDone: mock ? completedPaperIds.has(mock.id) : false,
      mockLocked: mock ? mockTestUsedUp : false,
    };
  });

  return (
    <div className="page-shell">
      <div className={`mb-5 rounded-2xl border-2 sm:mb-6 sm:rounded-3xl ${theme.border} ${theme.bg} p-4 shadow-md sm:p-5`}>
        <Link
          href="/exams"
          className="mb-2 inline-flex text-sm font-bold text-purple-600 hover:underline"
        >
          ← Đổi level
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-4xl sm:text-5xl">{theme.emoji}</span>
          <div>
            <CambridgeLevelHubHeader level={level} levelLabel={formatExamLevel(level)} />
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-2.5 text-xs sm:gap-x-6 sm:px-4 sm:py-3 sm:text-sm">
        <span>
          <span className="font-bold text-violet-900">Luyện:</span>{" "}
          {formatQuotaRatio(usage.practiceCount, usage.practiceLimit)}
        </span>
        <span>
          <span className="font-bold text-violet-900">Mock:</span>{" "}
          {formatQuotaRatio(usage.mockSkillCount, usage.mockTestLimit)}
        </span>
        <span>
          <span className="font-bold text-violet-900">AI:</span> {usage.aiGradingCount}/
          {usage.aiGradingLimit}
        </span>
        {usage.planId === "FREE" && (
          <Link href="/pricing" className="font-semibold text-violet-700 underline">
            Nâng cấp AI
          </Link>
        )}
      </div>

      {fullMocks.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="page-section-title mb-3 text-amber-700 sm:mb-4">🏆 Full Mock</h2>
          <FullMockGrid
            papers={fullMocks.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              timeLimit: p.timeLimit,
              isMockTest: true,
            }))}
            completedPaperIds={completedPaperIds}
            locked={fullMockLocked}
            lockedHint="Đã hết lượt mock test hôm nay — quay lại ngày mai"
            lockedHref={undefined}
            bankStats={fullMockBankStats}
          />
        </section>
      )}

      <section className="mb-8 sm:mb-10">
        <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50/60 to-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 sm:gap-4 sm:py-5">
            <div>
              <p className="page-section-title text-rose-800">
                🎤 Speaking {formatExamLevel(level)}
              </p>
              {speakingQuestionCount > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {formatBankQuestionCount(speakingQuestionCount)} · {speakingPartCount} Part
                </p>
              )}
            </div>
            <Link
              href={`/exams/${level}/speaking`}
              className="kid-btn-fun inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
            >
              Vào luyện Speaking
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 sm:mb-10">
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 to-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 sm:gap-4 sm:py-5">
            <div>
              <p className="page-section-title text-amber-900">
                ✏️ Writing {formatExamLevel(level)}
              </p>
              {writingQuestionCount > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {formatBankQuestionCount(writingQuestionCount)} · {writingPartCount} Part
                </p>
              )}
            </div>
            <Link
              href={`/exams/${level}/writing`}
              className="kid-btn-fun inline-flex rounded-full bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
            >
              Vào luyện Writing
            </Link>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="page-section-title mb-3 text-purple-900 sm:mb-4">Luyện theo kỹ năng</h2>
        <SkillPracticeGrid
          skills={gridSkills}
          mockLockedHint="Đã hết lượt mock test hôm nay — quay lại ngày mai"
        />
      </section>
    </div>
  );
}
