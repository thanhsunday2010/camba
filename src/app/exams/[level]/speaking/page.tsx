import { notFound, redirect } from "next/navigation";
import { ExamLevel } from "@prisma/client";
import { auth } from "@/auth";
import { formatExamLevel } from "@/lib/constants";
import { isYleLevel } from "@/lib/yle/constants";
import { loadCambridgeSpeakingHub } from "@/lib/exam/cambridge-speaking-hub-data";
import { CambridgeSpeakingHubClient } from "@/components/exam/cambridge-speaking-hub-client";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";
import Link from "next/link";
import { CambridgeSpeakingHubHeader } from "@/components/inline-edit/page-editable-sections";

export const revalidate = 60;

const VALID_LEVELS = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];

export default async function CambridgeSpeakingPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { level: levelParam } = await params;
  if (!VALID_LEVELS.includes(levelParam)) notFound();

  if (isYleLevel(levelParam)) {
    redirect(`/yle/${levelParam}/speaking`);
  }

  const level = levelParam as ExamLevel;
  const theme = LEVEL_THEMES[levelParam] ?? LEVEL_THEMES.KET;
  const data = await loadCambridgeSpeakingHub(level);
  if (!data) redirect("/login");

  return (
    <div className="page-shell">
      <div className="page-hero">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <Link
            href={`/exams/${levelParam}`}
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            ← {formatExamLevel(levelParam)}
          </Link>
          <CambridgeSpeakingHubHeader
            level={levelParam}
            levelLabel={formatExamLevel(levelParam)}
            emoji={theme.emoji}
          />
        </div>
      </div>

      <CambridgeSpeakingHubClient
        usage={data.usage}
        practiceParts={data.practiceParts}
        mockPaper={data.mockPaper}
        mockBankStats={data.mockBankStats}
        hubHref={`/exams/${levelParam}`}
      />
    </div>
  );
}
