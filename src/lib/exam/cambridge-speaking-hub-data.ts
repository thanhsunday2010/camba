import type { ExamLevel } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
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

export async function loadCambridgeSpeakingHub(level: ExamLevel) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const mockPoolKey = buildCambridgeSpeakingMockPoolKey(level);
  const partKeys = getCambridgeSpeakingParts(level).map((part) =>
    buildCambridgeSpeakingPracticePoolKey(level, part)
  );

  const [usage, practicePapers, mockPaper, completedIds] = await Promise.all([
    getCambridgeSpeakingUsageSnapshot(userId, level),
    db.examPaper.findMany({
      where: { published: true, practicePoolKey: { in: partKeys } },
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
      select: { id: true, title: true, description: true, timeLimit: true },
    }),
    db.attempt.findMany({
      where: {
        userId,
        status: { in: ["SUBMITTED", "GRADED"] },
        paper: { OR: [{ practicePoolKey: { in: partKeys } }, { mockPoolKey }] },
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

  return {
    usage,
    practiceParts,
    mockPaper: mockPaper
      ? { ...mockPaper, done: doneSet.has(mockPaper.id) }
      : null,
    mockBankStats,
  };
}
