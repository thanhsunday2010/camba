import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PaperKind } from "@prisma/client";
import { isYleLevel, parseYleSkillSlug, yleLevelLabel } from "@/lib/yle/constants";
import { loadYleSkillPage } from "@/lib/yle/hub-data";
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
import { db } from "@/lib/db";
import { FullMockGrid, SkillPracticeGrid } from "@/components/exam/skill-practice-grid";
import { auth } from "@/auth";

export const revalidate = 60;

export default async function YleSkillPage({
  params,
}: {
  params: Promise<{ level: string; skill: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { level, skill: skillSlug } = await params;
  if (!isYleLevel(level)) notFound();

  const nodeId = parseYleSkillSlug(skillSlug);
  if (!nodeId || nodeId === "SPEAKING" || nodeId === "WRITING") notFound();

  const page = await loadYleSkillPage(level, nodeId);
  if (!page) redirect("/login");

  const { nodeDef, completedPaperIds, mockTestUsedUp, theme } = page;

  if (nodeId === "MOCK") {
    const fullMockQuestionCount = await countFullMockBankQuestions(db, level);
    const fullMockBankStats = await getMockBankStats(
      db,
      fullMockQuestionCount,
      buildMockFullPoolKey(level)
    );

    return (
      <div className="page-shell">
        <BackLink level={level} emoji={nodeDef.emoji} label={nodeDef.label} />
        <section>
          <h2 className="page-section-title mb-3 text-amber-700 sm:mb-4">
            {nodeDef.emoji} Full Mock · {yleLevelLabel(level)}
          </h2>
          <FullMockGrid
            papers={page.fullMocks.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              timeLimit: p.timeLimit,
              isMockTest: true,
            }))}
            completedPaperIds={completedPaperIds}
            locked={mockTestUsedUp}
            lockedHint="Đã hết lượt mock test hôm nay — quay lại ngày mai"
            bankStats={fullMockBankStats}
          />
        </section>
      </div>
    );
  }

  const skill = nodeDef.skill;
  if (!skill) notFound();

  const practiceOnly = page.skillPapers.filter((p) => p.paperKind === PaperKind.PRACTICE);
  const skillMocks = page.skillPapers.filter((p) => p.paperKind === PaperKind.MOCK_SKILL);

  const practice = practiceOnly[0];
  const mock = skillMocks[0];

  const bank = await getSkillPracticeBankStats(
    db,
    level,
    skill,
    buildPracticePoolKey(level, skill),
    buildMockSkillPoolKey(level, skill)
  );

  const skillLabel =
    nodeId === "USE_OF_ENGLISH" ? "Grammar (bổ trợ)" : nodeDef.label;

  const gridSkills = [
    {
      skillLabel,
      skillEmoji: nodeDef.emoji,
      practiceInfo: "",
      practiceBankStats: bank.practice,
      mockBankStats: bank.mock,
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
    },
  ];

  return (
    <div className="page-shell">
      <BackLink level={level} emoji={nodeDef.emoji} label={skillLabel} />
      <div className={`mb-4 rounded-2xl border-2 p-3 ${theme.border} ${theme.bg}`}>
        <p className="text-sm text-muted-foreground">
          Luyện {skillLabel} trên hành tinh {yleLevelLabel(level)} — hoàn thành để Camba thăng hạng!
        </p>
      </div>
      <SkillPracticeGrid
        skills={gridSkills}
        mockLockedHint="Đã hết lượt mock test hôm nay — quay lại ngày mai"
      />
    </div>
  );
}

function BackLink({
  level,
  emoji,
  label,
}: {
  level: string;
  emoji: string;
  label: string;
}) {
  return (
    <Link
      href={`/yle/${level}`}
      className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-purple-600 hover:underline"
    >
      ← Quỹ đạo {level} · {emoji} {label}
    </Link>
  );
}
