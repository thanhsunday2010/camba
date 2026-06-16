import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  IELTS_WRITING_MOCK_POOL_KEY,
  IELTS_WRITING_TASK_DEFS,
  IELTS_WRITING_TASKS,
} from "@/lib/exam/ielts-writing-config";
import { getIeltsWritingUsageSnapshot } from "@/lib/subscription/ielts-writing-limit";
import { IeltsWritingHubClient } from "@/components/ielts/ielts-writing-hub-client";
import { CambaMascot } from "@/components/kids/camba-mascot";

export const revalidate = 60;

export default async function IeltsWritingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [usage, practicePapers, mockPaper, completedIds] = await Promise.all([
    getIeltsWritingUsageSnapshot(session.user.id),
    db.examPaper.findMany({
      where: {
        published: true,
        practicePoolKey: { startsWith: "IELTS:WRT:T" },
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
      where: { published: true, mockPoolKey: IELTS_WRITING_MOCK_POOL_KEY },
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
            { practicePoolKey: { startsWith: "IELTS:WRT:T" } },
            { mockPoolKey: IELTS_WRITING_MOCK_POOL_KEY },
          ],
        },
      },
      select: { paperId: true },
      distinct: ["paperId"],
    }),
  ]);

  const doneSet = new Set(completedIds.map((a) => a.paperId));

  const practiceParts = IELTS_WRITING_TASKS.map((task) => {
    const poolKey = `IELTS:WRT:T${task}`;
    const paper = practicePapers.find((p) => p.practicePoolKey === poolKey);
    const def = IELTS_WRITING_TASK_DEFS[task];
    return {
      part: task,
      label: def.label,
      shortLabel: def.shortLabel,
      description: def.description,
      practiceInfo: "1 câu ngẫu nhiên/lần · AI chấm band ngay (tính lượt AI)",
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
            Luyện thi Writing IELTS
          </h1>
          <p className="mt-1 max-w-2xl font-semibold text-muted-foreground">
            Mỗi lần luyện 1 câu ngẫu nhiên · AI chấm band ngay sau khi nộp · mock Task 1 + Task 2
          </p>
        </div>
      </div>

      <IeltsWritingHubClient
        usage={usage}
        practiceParts={practiceParts}
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
