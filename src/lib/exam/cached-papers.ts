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

export function getPublishedPapersByLevel(level: ExamLevel) {
  return unstable_cache(
    async () =>
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
    [`papers-level-${level}`],
    { revalidate: 300, tags: [`papers-${level}`] }
  )();
}

export function getPublishedPaperOptions() {
  return unstable_cache(
    async () =>
      db.examPaper.findMany({
        where: { published: true },
        select: { id: true, title: true, level: true, skill: true },
        orderBy: { title: "asc" },
      }),
    ["published-paper-options"],
    { revalidate: 300, tags: ["papers"] }
  )();
}
