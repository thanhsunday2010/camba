import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamLevel, PaperKind, Skill } from "@prisma/client";
import { auth } from "@/auth";
import { formatExamLevel, SKILLS } from "@/lib/constants";
import { getPublishedPapersByLevel } from "@/lib/exam/cached-papers";
import { getCompletedPaperIdsForUser } from "@/lib/exam/user-paper-progress";
import { getMockSkillQuestionCount } from "@/lib/exam/mock-config";
import { PRACTICE_POOL_SIZE } from "@/lib/exam/practice-pool";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import { getDailyUsageSnapshot } from "@/lib/subscription/service";
import { formatQuotaRatio, isUnlimitedQuota } from "@/lib/subscription/plans";
import { FullMockGrid, SkillPracticeGrid } from "@/components/exam/skill-practice-grid";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import {
  buildMockFullPoolKey,
  buildMockSkillPoolKey,
  buildPracticePoolKey,
} from "@/lib/exam/practice-pool";
import {
  countFullMockBankQuestions,
  getMockBankStats,
  getSkillPracticeBankStats,
} from "@/lib/exam/bank-stats";

const SKILL_EMOJI: Record<string, string> = {
  READING: "📖",
  WRITING: "✏️",
  LISTENING: "🎧",
  SPEAKING: "🎤",
  USE_OF_ENGLISH: "📝",
};

const YLE_LEVELS = new Set(["STARTERS", "MOVERS", "FLYERS"]);

function practiceInfoText(skill: Skill): string {
  return `${PRACTICE_POOL_SIZE} câu ngẫu nhiên/lần · lời giải có sẵn ngay`;
}

function mockInfoText(level: ExamLevel, skill: Skill, timeLimit?: number | null): string {
  const count = getMockSkillQuestionCount(level, skill);
  const minutes = timeLimit && timeLimit > 0 ? Math.floor(timeLimit / 60) : null;
  return `Mock: ${count} câu ngẫu nhiên${minutes ? ` · ~${minutes} phút` : ""} · không lặp đề`;
}

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

  const fullMockPoolKey = buildMockFullPoolKey(examLevel);
  const fullMockBankStats = fullMocks.length
    ? await getMockBankStats(
        db,
        await countFullMockBankQuestions(db, examLevel),
        fullMockPoolKey
      )
    : undefined;

  const skillBankStats = await Promise.all(
    SKILLS.filter((s) => s.value !== "SPEAKING" && s.value !== "WRITING").map(async (skill) => {
      const skillValue = skill.value as Skill;
      const practiceKey = buildPracticePoolKey(examLevel, skillValue);
      const mockKey = buildMockSkillPoolKey(examLevel, skillValue);
      const stats = await getSkillPracticeBankStats(db, examLevel, skillValue, practiceKey, mockKey);
      return { skill: skillValue, stats };
    })
  );
  const skillStatsMap = new Map(skillBankStats.map((e) => [e.skill, e.stats]));

  const gridSkills = SKILLS.filter(
    (skill) => skill.value !== "SPEAKING" && skill.value !== "WRITING"
  ).map((skill) => {
    const skillValue = skill.value as Skill;
    const practice = practiceOnly.find((p) => p.skill === skillValue);
    const mock = skillMocks.find((p) => p.skill === skillValue);
    const bankStats = skillStatsMap.get(skillValue);

    return {
      skillLabel:
        isYle && skill.value === "USE_OF_ENGLISH" ? "Grammar (bổ trợ)" : skill.label,
      skillEmoji: SKILL_EMOJI[skill.value],
      practiceInfo: practiceInfoText(skillValue),
      mockInfo: mock ? mockInfoText(examLevel, skillValue, mock.timeLimit) : undefined,
      practiceBankStats: bankStats?.practice,
      mockBankStats: bankStats?.mock,
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
    <div className="container mx-auto px-4 py-8">
      <div className={`mb-6 rounded-3xl border-2 ${theme.border} ${theme.bg} p-6 shadow-md`}>
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
              Chọn kỹ năng để luyện tập hoặc thi mock
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border-2 border-violet-100 bg-violet-50/60 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="font-extrabold text-violet-900">Luyện tập hôm nay</p>
          <p className="font-semibold text-muted-foreground">
            {formatQuotaRatio(usage.practiceCount, usage.practiceLimit)} câu
          </p>
        </div>
        <div>
          <p className="font-extrabold text-violet-900">Mock test</p>
          <p className="font-semibold text-muted-foreground">
            {formatQuotaRatio(usage.mockSkillCount, usage.mockTestLimit)} lượt hôm nay
          </p>
        </div>
        <div>
          <p className="font-extrabold text-violet-900">AI Writing & Speaking</p>
          <p className="font-semibold text-muted-foreground">
            {usage.aiGradingCount}/{usage.aiGradingLimit} lượt (dùng chung)
          </p>
        </div>
        {usage.planId === "FREE" && (
          <p className="sm:col-span-3 text-sm font-medium text-violet-800">
            Luyện tập & mock không giới hạn trên mọi gói. Nâng cấp Pro/VIP để tăng lượt AI chấm Writing &
            Speaking —{" "}
            <Link href="/pricing" className="font-bold underline">
              xem bảng giá
            </Link>
          </p>
        )}
      </div>

      {fullMocks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-extrabold text-amber-700">
            🏆 Full Mock — Thi thử tất cả kỹ năng
          </h2>
          <p className="mb-4 text-base font-medium text-muted-foreground">
            Đề ngẫu nhiên từ ngân hàng · format Cambridge · không lặp đề
          </p>
          <FullMockGrid
            papers={fullMocks.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              timeLimit: p.timeLimit,
              isMockTest: true,
            }))}
            completedPaperIds={completedPaperIds}
            bankStats={fullMockBankStats}
            locked={fullMockLocked}
            lockedHint="Đã hết lượt mock test hôm nay — quay lại ngày mai"
            lockedHref={undefined}
          />
        </section>
      )}

      <section className="mb-10">
        <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50/60 to-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="text-lg font-extrabold text-rose-800">
                🎤 Speaking {formatExamLevel(level)} — Luyện theo Part
              </p>
              <p className="mt-1 max-w-xl text-sm font-medium text-muted-foreground">
                1 câu ngẫu nhiên/Part · AI chấm ngay · luyện tập & mock không giới hạn · AI còn{" "}
                {usage.aiGradingLimit - usage.aiGradingCount}/{usage.aiGradingLimit} lượt hôm nay
              </p>
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

      <section className="mb-10">
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 to-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="text-lg font-extrabold text-amber-900">
                ✏️ Writing {formatExamLevel(level)} — Luyện theo Part
              </p>
              <p className="mt-1 max-w-xl text-sm font-medium text-muted-foreground">
                1 câu ngẫu nhiên/Part · AI chấm ngay sau nộp · luyện tập & mock không giới hạn · AI còn{" "}
                {usage.aiGradingLimit - usage.aiGradingCount}/{usage.aiGradingLimit} lượt hôm nay
              </p>
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
        <h2 className="mb-1 text-lg font-extrabold text-purple-900">Luyện tập theo kỹ năng</h2>
        <p className="mb-4 text-base font-medium text-muted-foreground">
          Mỗi kỹ năng một đề pool — câu hỏi được chọn ngẫu nhiên mỗi lần vào bài
        </p>
        <SkillPracticeGrid
          skills={gridSkills}
          mockLockedHint="Đã hết lượt mock test hôm nay — quay lại ngày mai"
        />
      </section>
    </div>
  );
}
