import { unstable_cache } from "next/cache";
import { ExamLevel } from "@prisma/client";
import { db } from "@/lib/db";

const paperListSelect = {
  id: true,
  title: true,
  description: true,
  level: true,
  skill: true,
  paperKind: true,
  isMockTest: true,
  timeLimit: true,
} as const;

export type CachedPaperListItem = {
  id: string;
  title: string;
  description: string | null;
  level: ExamLevel;
  skill: string;
  paperKind: string;
  isMockTest: boolean;
  timeLimit: number | null;
};

async function safeCachedQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch {
    return fallback;
  }
}

/** Không cache — danh sách placement phải cập nhật ngay sau reseed/đổi tên */
export async function getPublishedPlacementPapers() {
  return safeCachedQuery(
    () =>
      db.examPaper.findMany({
        where: { paperKind: "PLACEMENT", published: true },
        select: {
          id: true,
          title: true,
          description: true,
          timeLimit: true,
        },
        orderBy: { title: "asc" },
      }),
    []
  );
}

export function getPublishedPapersByLevel(level: ExamLevel) {
  return unstable_cache(
    async () =>
      safeCachedQuery(
        () =>
          db.examPaper.findMany({
            where: { level, published: true },
            select: paperListSelect,
            orderBy: [
              { paperKind: "asc" },
              { skill: "asc" },
              { isMockTest: "desc" },
              { title: "asc" },
            ],
          }),
        []
      ),
    [`papers-level-${level}`],
    { revalidate: 3600, tags: [`papers-${level}`] }
  )();
}

export function getPublishedPaperOptions() {
  return unstable_cache(
    async () =>
      safeCachedQuery(
        () =>
          db.examPaper.findMany({
            where: { published: true },
            select: { id: true, title: true, level: true, skill: true },
            orderBy: { title: "asc" },
          }),
        []
      ),
    ["published-paper-options"],
    { revalidate: 3600, tags: ["papers"] }
  )();
}
