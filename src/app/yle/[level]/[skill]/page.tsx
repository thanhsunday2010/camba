import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamLevel, PaperKind } from "@prisma/client";
import {
  isYleLevel,
  parseYleSkillSlug,
  yleLevelLabel,
  type YleLevel,
  type YleOrbitNodeId,
} from "@/lib/yle/constants";
import { loadYleSkillPage } from "@/lib/yle/hub-data";
import { getNextYleSkillAfter, yleHubHref } from "@/lib/yle/practice-path";
import { loadCambridgeSpeakingHub } from "@/lib/exam/cambridge-speaking-hub-data";
import { loadCambridgeWritingHub } from "@/lib/exam/cambridge-writing-hub-data";
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
import { FullMockGrid } from "@/components/exam/skill-practice-grid";
import { PracticeSkillFlow } from "@/components/exam/practice-skill-flow";
import { CambridgeSpeakingHubClient } from "@/components/exam/cambridge-speaking-hub-client";
import { CambridgeWritingHubClient } from "@/components/exam/cambridge-writing-hub-client";
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
  if (!nodeId) notFound();

  const yleLevel = level as YleLevel;
  const hubHref = yleHubHref(yleLevel);
  const nextSkill = getNextYleSkillAfter(yleLevel, nodeId);

  if (nodeId === "SPEAKING") {
    const data = await loadCambridgeSpeakingHub(level as ExamLevel);
    if (!data) redirect("/login");
    return (
      <div className="page-shell">
        <SkillBackLink level={level} nodeId={nodeId} />
        <CambridgeSpeakingHubClient
          usage={data.usage}
          practiceParts={data.practiceParts}
          mockPaper={data.mockPaper}
          mockBankStats={data.mockBankStats}
          hubHref={hubHref}
          nextSkill={nextSkill}
        />
      </div>
    );
  }

  if (nodeId === "WRITING") {
    const data = await loadCambridgeWritingHub(level as ExamLevel);
    if (!data) redirect("/login");
    return (
      <div className="page-shell">
        <SkillBackLink level={level} nodeId={nodeId} />
        <CambridgeWritingHubClient
          usage={data.usage}
          practiceParts={data.practiceParts}
          mockPaper={data.mockPaper}
          mockBankStats={data.mockBankStats}
          hubHref={hubHref}
          nextSkill={nextSkill}
        />
      </div>
    );
  }

  const page = await loadYleSkillPage(yleLevel, nodeId);
  if (!page) redirect("/login");

  const { nodeDef, completedPaperIds, mockTestUsedUp } = page;

  if (nodeId === "MOCK") {
    const fullMockQuestionCount = await countFullMockBankQuestions(db, level);
    const fullMockBankStats = await getMockBankStats(
      db,
      fullMockQuestionCount,
      buildMockFullPoolKey(level)
    );

    return (
      <div className="page-shell">
        <SkillBackLink level={level} nodeId={nodeId} />
        <section>
          <h2 className="page-section-title mb-3 text-amber-700 sm:mb-4">
            {nodeDef.emoji} Full Mock · {yleLevelLabel(yleLevel)}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Thi thử đầy đủ — hoàn thành sau khi đã luyện các kỹ năng.
          </p>
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
        {nextSkill && (
          <Link
            href={nextSkill.href}
            className="mt-6 inline-flex text-sm font-bold text-violet-700 hover:underline"
          >
            Tiếp: {nextSkill.emoji} {nextSkill.label} →
          </Link>
        )}
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

  const skillLabel = nodeId === "USE_OF_ENGLISH" ? "Grammar (bổ trợ)" : nodeDef.label;

  return (
    <div className="page-shell">
      <SkillBackLink level={level} nodeId={nodeId} />
      <PracticeSkillFlow
        skillLabel={skillLabel}
        skillEmoji={nodeDef.emoji}
        practice={
          practice
            ? { id: practice.id, title: practice.title, timeLimit: practice.timeLimit }
            : undefined
        }
        mock={mock ? { id: mock.id, title: mock.title, timeLimit: mock.timeLimit } : undefined}
        practiceDone={practice ? completedPaperIds.has(practice.id) : false}
        mockDone={mock ? completedPaperIds.has(mock.id) : false}
        mockLocked={mock ? mockTestUsedUp : false}
        mockLockedHint="Đã hết lượt mock test hôm nay — quay lại ngày mai"
        practiceBankStats={bank.practice}
        mockBankStats={bank.mock}
        nextSkill={nextSkill}
        hubHref={hubHref}
      />
    </div>
  );
}

function SkillBackLink({ level, nodeId }: { level: string; nodeId: YleOrbitNodeId }) {
  const labels: Record<string, string> = {
    READING: "Reading",
    LISTENING: "Listening",
    USE_OF_ENGLISH: "Grammar",
    SPEAKING: "Speaking",
    WRITING: "Writing",
    MOCK: "Mock",
  };
  const emojis: Record<string, string> = {
    READING: "📖",
    LISTENING: "🎧",
    USE_OF_ENGLISH: "📝",
    SPEAKING: "🎤",
    WRITING: "✏️",
    MOCK: "🏆",
  };

  return (
    <Link
      href={`/yle/${level}`}
      className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-purple-600 hover:underline"
    >
      ← Quỹ đạo {level} · {emojis[nodeId]} {labels[nodeId]}
    </Link>
  );
}
