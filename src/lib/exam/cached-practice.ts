import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

const questionSelect = {
  id: true,
  type: true,
  content: true,
  audioUrl: true,
  points: true,
  skill: true,
  title: true,
  correctAnswer: true,
} as const;

export type CachedPracticePaper = Awaited<
  ReturnType<typeof fetchPublishedPracticePaper>
>;

async function fetchPublishedPracticePaper(paperId: string) {
  return db.examPaper.findUnique({
    where: { id: paperId, published: true },
    select: {
      id: true,
      title: true,
      timeLimit: true,
      paperKind: true,
      isMockTest: true,
      practicePoolKey: true,
      mockPoolKey: true,
      sections: true,
      questions: {
        orderBy: { orderIndex: "asc" as const },
        select: { question: { select: questionSelect } },
      },
    },
  });
}

export function getCachedPracticePaper(paperId: string) {
  return unstable_cache(
    () => fetchPublishedPracticePaper(paperId),
    [`practice-paper-${paperId}`],
    { revalidate: 300, tags: [`paper-${paperId}`, "papers"] }
  )();
}

export function getCachedPlacementPaper(paperId: string) {
  return unstable_cache(
    async () =>
      db.examPaper.findFirst({
        where: { id: paperId, paperKind: "PLACEMENT", published: true },
        select: {
          id: true,
          title: true,
          timeLimit: true,
          paperKind: true,
          isMockTest: true,
          sections: true,
          questions: {
            orderBy: { orderIndex: "asc" as const },
            select: {
              question: {
                select: {
                  id: true,
                  type: true,
                  content: true,
                  audioUrl: true,
                  points: true,
                  skill: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
    [`placement-paper-${paperId}`],
    { revalidate: 300, tags: [`paper-${paperId}`, "papers"] }
  )();
}
