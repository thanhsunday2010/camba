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
import { getCambridgeSpeakingUsageSnapshot } from "@/lib/subscription/cambridge-speaking-limit";
import { FullMockGrid, SkillPracticeGrid } from "@/components/exam/skill-practice-grid";
import { Card, CardContent } from "@/components/ui/card";

const SKILL_EMOJI: Record<string, string> = {
  READING: "📖",
  WRITING: "✏️",
  LISTENING: "🎧",
  SPEAKING: "🎤",
  USE_OF_ENGLISH: "📝",
};

const YLE_LEVELS = new Set(["STARTERS", "MOVERS", "FLYERS"]);

function practiceInfoText(skill: Skill): string {
  if (skill === Skill.WRITING || skill === Skill.SPEAKING) {
    return `${PRACTICE_POOL_SIZE} câu ngẫu nhiên/lần · AI chấm (Free: 1 lượt/ngày dùng chung)`;
  }
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

  const [papers, completedPaperIds, usage, speakingUsage] = await Promise.all([
    getPublishedPapersByLevel(examLevel),
    getCompletedPaperIdsForUser(session.user.id, examLevel),
    getDailyUsageSnapshot(session.user.id),
    getCambridgeSpeakingUsageSnapshot(session.user.id, examLevel),
  ]);

  const fullMocks = papers.filter((p) => p.paperKind === PaperKind.MOCK_FULL);
  const skillPapers = papers.filter(
    (p) => p.paperKind !== PaperKind.MOCK_FULL && p.paperKind !== PaperKind.PLACEMENT
  );

  const practiceOnly = skillPapers.filter((p) => p.paperKind === PaperKind.PRACTICE);
  const skillMocks = skillPapers.filter((p) => p.paperKind === PaperKind.MOCK_SKILL);

  const mockTestLimit = usage.mockTestLimit;
  const mockTestUsedUp = usage.mockSkillCount >= mockTestLimit;
  const fullMockLocked = !usage.allowFullMock || mockTestUsedUp;

  const gridSkills = SKILLS.filter((skill) => skill.value !== "SPEAKING").map((skill) => {
    const skillValue = skill.value as Skill;
    const practice = practiceOnly.find((p) => p.skill === skillValue);
    const mock = skillMocks.find((p) => p.skill === skillValue);

    return {
      skillLabel:
        isYle && skill.value === "USE_OF_ENGLISH" ? "Grammar (bổ trợ)" : skill.label,
      skillEmoji: SKILL_EMOJI[skill.value],
      practiceInfo: practiceInfoText(skillValue),
      mockInfo: mock ? mockInfoText(examLevel, skillValue, mock.timeLimit) : undefined,
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
            {usage.practiceCount}/{usage.practiceLimit} câu
          </p>
        </div>
        <div>
          <p className="font-extrabold text-violet-900">Mock test</p>
          <p className="font-semibold text-muted-foreground">
            {usage.mockSkillCount}/{mockTestLimit} lượt hôm nay
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
            Free: 30 câu/ngày · 1 mock test/ngày · không full mock. Pro: 5 mock/ngày · VIP: 10 mock/ngày. Hết lượt?{" "}
            <Link href="/pricing" className="font-bold underline">
              nâng cấp Pro chỉ 30.000₫/tháng
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
            locked={fullMockLocked}
            lockedHint={
              fullMockLocked && !usage.allowFullMock
                ? "Full mock cần gói Pro — nâng cấp tại Bảng giá"
                : "Đã hết lượt mock test hôm nay — quay lại ngày mai"
            }
            lockedHref={fullMockLocked && !usage.allowFullMock ? "/pricing" : undefined}
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
                Luyện từng Part hoặc mock full · AI chấm band Cambridge · hôm nay còn{" "}
                {speakingUsage.practiceRemaining}/{speakingUsage.practiceLimit} lượt luyện ·{" "}
                {speakingUsage.mockRemaining}/{speakingUsage.mockLimit} mock (
                {speakingUsage.mockPeriod === "week" ? "tuần" : "ngày"})
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
