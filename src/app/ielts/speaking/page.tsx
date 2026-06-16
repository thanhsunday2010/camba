import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  IELTS_SPEAKING_MOCK_POOL_KEY,
  IELTS_SPEAKING_PART_DEFS,
  IELTS_SPEAKING_PARTS,
} from "@/lib/exam/ielts-speaking-config";
import { getIeltsSpeakingUsageSnapshot } from "@/lib/subscription/ielts-speaking-limit";
import {
  countIeltsSpeakingMockBankQuestions,
  countIeltsSpeakingPartQuestions,
  getMockBankStats,
  getPartPracticeBankStats,
} from "@/lib/exam/bank-stats";
import { IeltsSpeakingHubClient } from "@/components/ielts/ielts-speaking-hub-client";
import { CambaMascot } from "@/components/kids/camba-mascot";

export const revalidate = 60;

export default async function IeltsSpeakingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [usage, practicePapers, mockPaper, completedIds] = await Promise.all([
    getIeltsSpeakingUsageSnapshot(session.user.id),
    db.examPaper.findMany({
      where: {
        published: true,
        practicePoolKey: { startsWith: "IELTS:SPK:P" },
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
      where: { published: true, mockPoolKey: IELTS_SPEAKING_MOCK_POOL_KEY },
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
          OR: [
            { practicePoolKey: { startsWith: "IELTS:SPK:P" } },
            { mockPoolKey: IELTS_SPEAKING_MOCK_POOL_KEY },
          ],
        },
      },
      select: { paperId: true },
      distinct: ["paperId"],
    }),
  ]);

  const doneSet = new Set(completedIds.map((a) => a.paperId));

  const partStatsEntries = await Promise.all(
    IELTS_SPEAKING_PARTS.map(async (part) => {
      const poolKey = `IELTS:SPK:P${part}`;
      const questionCount = await countIeltsSpeakingPartQuestions(db, part);
      const bankStats = await getPartPracticeBankStats(db, questionCount, poolKey);
      return { part, bankStats };
    })
  );
  const partStatsMap = new Map(partStatsEntries.map((e) => [e.part, e.bankStats]));

  const mockBankStats = await getMockBankStats(
    db,
    await countIeltsSpeakingMockBankQuestions(db),
    IELTS_SPEAKING_MOCK_POOL_KEY
  );

  const practiceParts = IELTS_SPEAKING_PARTS.map((part) => {
    const poolKey = `IELTS:SPK:P${part}`;
    const paper = practicePapers.find((p) => p.practicePoolKey === poolKey);
    const def = IELTS_SPEAKING_PART_DEFS[part];
    return {
      part,
      label: def.label,
      shortLabel: def.shortLabel,
      description: def.description,
      practiceInfo: "1 câu ngẫu nhiên/lần · AI chấm band ngay (tính lượt AI)",
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
          <Link href="/exams" className="text-sm font-semibold text-purple-600 hover:underline">
            ← Chọn level
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold kid-gradient-text">
            Luyện thi Speaking IELTS
          </h1>
          <p className="mt-1 max-w-2xl font-semibold text-muted-foreground">
            AI chấm sửa theo band IELTS · mỗi lần luyện 1 câu ngẫu nhiên · mock full (Part 1 + 2 +
            3) giống format thi thật
          </p>
        </div>
      </div>

      <IeltsSpeakingHubClient
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
