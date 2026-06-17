import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  buildIeltsSpeakingMockPoolKey,
  buildIeltsSpeakingPracticePoolKey,
  getIeltsSpeakingMockQuestionCount,
  getIeltsSpeakingPartDef,
  IELTS_SPEAKING_PARTS,
} from "@/lib/exam/ielts-speaking-config";
import {
  buildIeltsWritingMockPoolKey,
  buildIeltsWritingPracticePoolKey,
  getIeltsWritingMockQuestionCount,
  getIeltsWritingTaskDef,
  IELTS_WRITING_TASKS,
} from "@/lib/exam/ielts-writing-config";
import {
  countIeltsSpeakingMockBankQuestions,
  countIeltsSpeakingPartQuestions,
  countIeltsWritingMockBankQuestions,
  countIeltsWritingTaskQuestions,
  getMockBankStats,
  getPartPracticeBankStats,
} from "@/lib/exam/bank-stats";
import { getIeltsSpeakingUsageSnapshot } from "@/lib/subscription/ielts-speaking-limit";
import { getIeltsWritingUsageSnapshot } from "@/lib/subscription/ielts-writing-limit";
import { IELTS_MODULE_META, type IeltsModule } from "@/lib/exam/ielts-module";

export function ensureIeltsModuleAvailable(module: IeltsModule) {
  if (!IELTS_MODULE_META[module].available) {
    redirect("/exams");
  }
}

export async function loadIeltsSpeakingHub(module: IeltsModule) {
  ensureIeltsModuleAvailable(module);

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const mockPoolKey = buildIeltsSpeakingMockPoolKey(module);
  const practicePrefix = `IELTS:${module === "ACADEMIC" ? "AC" : "GT"}:SPK:P`;

  const [usage, practicePapers, mockPaper, completedIds] = await Promise.all([
    getIeltsSpeakingUsageSnapshot(session.user.id),
    db.examPaper.findMany({
      where: {
        published: true,
        OR: [
          { practicePoolKey: { startsWith: practicePrefix } },
          ...(module === "ACADEMIC"
            ? [{ practicePoolKey: { startsWith: "IELTS:SPK:P" } }]
            : []),
        ],
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
      where: {
        published: true,
        OR: [
          { mockPoolKey },
          ...(module === "ACADEMIC" ? [{ mockPoolKey: "IELTS:SPK:MOCK" }] : []),
        ],
      },
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
            { practicePoolKey: { startsWith: practicePrefix } },
            { mockPoolKey },
            ...(module === "ACADEMIC"
              ? [
                  { practicePoolKey: { startsWith: "IELTS:SPK:P" } },
                  { mockPoolKey: "IELTS:SPK:MOCK" },
                ]
              : []),
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
      const poolKey = buildIeltsSpeakingPracticePoolKey(part, module);
      const questionCount = await countIeltsSpeakingPartQuestions(db, part, module);
      const bankStats = await getPartPracticeBankStats(db, questionCount, poolKey);
      return { part, bankStats };
    })
  );
  const partStatsMap = new Map(partStatsEntries.map((e) => [e.part, e.bankStats]));

  const mockBankStats = await getMockBankStats(
    db,
    await countIeltsSpeakingMockBankQuestions(db, module),
    mockPoolKey
  );

  const practiceParts = IELTS_SPEAKING_PARTS.map((part) => {
    const poolKey = buildIeltsSpeakingPracticePoolKey(part, module);
    const legacyKey = module === "ACADEMIC" ? `IELTS:SPK:P${part}` : null;
    const paper =
      practicePapers.find((p) => p.practicePoolKey === poolKey) ??
      (legacyKey ? practicePapers.find((p) => p.practicePoolKey === legacyKey) : undefined);
    const def = getIeltsSpeakingPartDef(part, module);
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

  return {
    module,
    meta: IELTS_MODULE_META[module],
    mockCount: getIeltsSpeakingMockQuestionCount(),
    usage,
    practiceParts,
    mockBankStats,
    mockPaper: mockPaper
      ? {
          ...mockPaper,
          done: doneSet.has(mockPaper.id),
        }
      : null,
  };
}

export async function loadIeltsWritingHub(module: IeltsModule) {
  ensureIeltsModuleAvailable(module);

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const mockPoolKey = buildIeltsWritingMockPoolKey(module);
  const practicePrefix = `IELTS:${module === "ACADEMIC" ? "AC" : "GT"}:WRT:T`;

  const [usage, practicePapers, mockPaper, completedIds] = await Promise.all([
    getIeltsWritingUsageSnapshot(session.user.id),
    db.examPaper.findMany({
      where: {
        published: true,
        OR: [
          { practicePoolKey: { startsWith: practicePrefix } },
          ...(module === "ACADEMIC"
            ? [{ practicePoolKey: { startsWith: "IELTS:WRT:T" } }]
            : []),
        ],
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
      where: {
        published: true,
        OR: [
          { mockPoolKey },
          ...(module === "ACADEMIC" ? [{ mockPoolKey: "IELTS:WRT:MOCK" }] : []),
        ],
      },
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
            { practicePoolKey: { startsWith: practicePrefix } },
            { mockPoolKey },
            ...(module === "ACADEMIC"
              ? [
                  { practicePoolKey: { startsWith: "IELTS:WRT:T" } },
                  { mockPoolKey: "IELTS:WRT:MOCK" },
                ]
              : []),
          ],
        },
      },
      select: { paperId: true },
      distinct: ["paperId"],
    }),
  ]);

  const doneSet = new Set(completedIds.map((a) => a.paperId));

  const partStatsEntries = await Promise.all(
    IELTS_WRITING_TASKS.map(async (task) => {
      const poolKey = buildIeltsWritingPracticePoolKey(task, module);
      const questionCount = await countIeltsWritingTaskQuestions(db, task, module);
      const bankStats = await getPartPracticeBankStats(db, questionCount, poolKey);
      return { task, bankStats };
    })
  );
  const partStatsMap = new Map(partStatsEntries.map((e) => [e.task, e.bankStats]));

  const mockBankStats = await getMockBankStats(
    db,
    await countIeltsWritingMockBankQuestions(db, module),
    mockPoolKey
  );

  const practiceParts = IELTS_WRITING_TASKS.map((task) => {
    const poolKey = buildIeltsWritingPracticePoolKey(task, module);
    const legacyKey = module === "ACADEMIC" ? `IELTS:WRT:T${task}` : null;
    const paper =
      practicePapers.find((p) => p.practicePoolKey === poolKey) ??
      (legacyKey ? practicePapers.find((p) => p.practicePoolKey === legacyKey) : undefined);
    const def = getIeltsWritingTaskDef(task, module);
    return {
      part: task,
      label: def.label,
      shortLabel: def.shortLabel,
      description: def.description,
      practiceInfo: "1 câu ngẫu nhiên/lần · AI chấm band ngay (tính lượt AI)",
      bankStats: partStatsMap.get(task),
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
    module,
    meta: IELTS_MODULE_META[module],
    mockCount: getIeltsWritingMockQuestionCount(),
    usage,
    practiceParts,
    mockBankStats,
    mockPaper: mockPaper
      ? {
          ...mockPaper,
          done: doneSet.has(mockPaper.id),
        }
      : null,
  };
}
