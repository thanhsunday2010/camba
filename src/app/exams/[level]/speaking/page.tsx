import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamLevel } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel } from "@/lib/constants";
import {
  buildCambridgeSpeakingMockPoolKey,
  buildCambridgeSpeakingPracticePoolKey,
  getCambridgePartDef,
  getCambridgeSpeakingParts,
} from "@/lib/exam/cambridge-speaking-config";
import { getCambridgeSpeakingUsageSnapshot } from "@/lib/subscription/cambridge-speaking-limit";
import {
  countCambridgeSpeakingMockBankQuestions,
  countCambridgeSpeakingPartQuestions,
  getMockBankStats,
  getPartPracticeBankStats,
} from "@/lib/exam/bank-stats";
import { CambridgeSpeakingHubClient } from "@/components/exam/cambridge-speaking-hub-client";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { LEVEL_THEMES } from "@/lib/kids/level-themes";

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

  const level = levelParam as ExamLevel;
  const theme = LEVEL_THEMES[levelParam] ?? LEVEL_THEMES.KET;
  const mockPoolKey = buildCambridgeSpeakingMockPoolKey(level);
  const partKeys = getCambridgeSpeakingParts(level).map((part) =>
    buildCambridgeSpeakingPracticePoolKey(level, part)
  );

  const [usage, practicePapers, mockPaper, completedIds] = await Promise.all([
    getCambridgeSpeakingUsageSnapshot(session.user.id, level),
    db.examPaper.findMany({
      where: {
        published: true,
        practicePoolKey: { in: partKeys },
      },
      orderBy: { practicePoolKey: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        practicePoolKey: true,
      },
    }),
    db.examPaper.findFirst({
      where: { published: true, mockPoolKey },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
      },
    }),
    db.attempt.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["SUBMITTED", "GRADED"] },
        paper: {
          OR: [{ practicePoolKey: { in: partKeys } }, { mockPoolKey }],
        },
      },
      select: { paperId: true },
      distinct: ["paperId"],
    }),
  ]);

  const doneSet = new Set(completedIds.map((a) => a.paperId));

  const partStatsEntries = await Promise.all(
    getCambridgeSpeakingParts(level).map(async (part) => {
      const poolKey = buildCambridgeSpeakingPracticePoolKey(level, part);
      const questionCount = await countCambridgeSpeakingPartQuestions(db, level, part);
      const bankStats = await getPartPracticeBankStats(db, questionCount, poolKey);
      return { part, bankStats };
    })
  );
  const partStatsMap = new Map(partStatsEntries.map((e) => [e.part, e.bankStats]));

  const mockBankStats = await getMockBankStats(
    db,
    await countCambridgeSpeakingMockBankQuestions(db, level),
    mockPoolKey
  );

  const practiceParts = getCambridgeSpeakingParts(level).map((part) => {
    const poolKey = buildCambridgeSpeakingPracticePoolKey(level, part);
    const paper = practicePapers.find((p) => p.practicePoolKey === poolKey);
    const def = getCambridgePartDef(level, part);
    return {
      part,
      label: def.label,
      shortLabel: def.shortLabel,
      description: def.description,
      practiceInfo: "1 câu ngẫu nhiên/lần · AI chấm ngay (tính lượt AI)",
      bankStats: partStatsMap.get(part),
      paper: paper
        ? {
            id: paper.id,
            title: paper.title,
            description: paper.description,
            timeLimit: paper.timeLimit,
          }
        : undefined,
      done: paper ? doneSet.has(paper.id) : false,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <Link
            href={`/exams/${levelParam}`}
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            ← {formatExamLevel(levelParam)}
          </Link>
          <h1 className={`mt-1 text-3xl font-extrabold kid-gradient-text`}>
            Speaking {formatExamLevel(levelParam)} {theme.emoji}
          </h1>
          <p className="mt-1 max-w-2xl font-semibold text-muted-foreground">
            AI chấm sửa theo band Cambridge · mỗi lần luyện 1 câu ngẫu nhiên · mock full giống
            format thi thật
          </p>
        </div>
      </div>

      <CambridgeSpeakingHubClient
        usage={usage}
        practiceParts={practiceParts}
        mockBankStats={mockBankStats}
        mockPaper={
          mockPaper
            ? {
                ...mockPaper,
                done: doneSet.has(mockPaper.id),
              }
            : null
        }
      />
    </div>
  );
}
