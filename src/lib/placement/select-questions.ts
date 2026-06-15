import { PaperKind, PrismaClient } from "@prisma/client";
import type { PaperSection } from "@/lib/exam/paper-sections";
import {
  getPlacementSpec,
  resolvePlacementSlug,
  type PlacementPool,
  type PlacementSlug,
} from "@/lib/placement/placement-config";

const RECENT_ATTEMPT_LOOKBACK = 3;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

async function getRecentlyUsedQuestionIds(
  db: PrismaClient,
  paperId: string,
  userId: string | null | undefined,
  guestPhone: string | null | undefined
): Promise<Set<string>> {
  const where =
    userId != null
      ? { userId, paperId, status: { not: "IN_PROGRESS" as const } }
      : guestPhone
        ? { guestPhone, paperId, status: { not: "IN_PROGRESS" as const } }
        : null;

  if (!where) return new Set();

  const recentAttempts = await db.attempt.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: RECENT_ATTEMPT_LOOKBACK,
    select: {
      attemptQuestions: { select: { questionId: true } },
    },
  });

  const ids = new Set<string>();
  for (const att of recentAttempts) {
    for (const aq of att.attemptQuestions) {
      ids.add(aq.questionId);
    }
  }
  return ids;
}

async function pickFromPool(
  db: PrismaClient,
  slug: PlacementSlug,
  pool: PlacementPool,
  count: number,
  exclude: Set<string>
): Promise<string[]> {
  const candidates = await db.question.findMany({
    where: { placementSlug: slug, placementPool: pool },
    select: { id: true },
  });

  if (candidates.length < count) {
    throw new Error(
      `Placement bank thiếu câu: ${slug}/${pool} cần ${count}, có ${candidates.length}`
    );
  }

  let available = candidates.map((c) => c.id).filter((id) => !exclude.has(id));
  if (available.length < count) {
    available = candidates.map((c) => c.id);
  }

  return shuffle(available).slice(0, count);
}

export async function assignPlacementQuestionsForAttempt(
  db: PrismaClient,
  attemptId: string
): Promise<{ count: number; sections: PaperSection[] }> {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      paper: true,
      attemptQuestions: { select: { id: true } },
    },
  });

  if (!attempt || attempt.paper.paperKind !== PaperKind.PLACEMENT) {
    throw new Error("Attempt placement không hợp lệ");
  }

  if (attempt.attemptQuestions.length > 0) {
    const sections = (attempt.paper.sections as PaperSection[] | null) ?? [];
    return { count: attempt.attemptQuestions.length, sections };
  }

  const slug = resolvePlacementSlug(attempt.paper);
  if (!slug) {
    throw new Error(`Không xác định được placement slug cho "${attempt.paper.title}"`);
  }

  const spec = getPlacementSpec(slug);
  const exclude = await getRecentlyUsedQuestionIds(
    db,
    attempt.paperId,
    attempt.userId,
    attempt.guestPhone
  );

  const orderedIds: string[] = [];
  const sections: PaperSection[] = [];
  let idx = 0;

  for (const section of spec.sectionOrder) {
    const picked = await pickFromPool(
      db,
      slug,
      section.pool,
      section.count,
      exclude
    );
    const sectionStart = idx;
    orderedIds.push(...picked);
    idx += picked.length;
    sections.push({
      skill: section.skill,
      label: section.label,
      startIndex: sectionStart,
      endIndex: idx,
      timeLimit: section.timeLimitSeconds,
    });
    for (const id of picked) exclude.add(id);
  }

  await db.attemptQuestion.createMany({
    data: orderedIds.map((questionId, orderIndex) => ({
      attemptId,
      questionId,
      orderIndex,
    })),
  });

  return { count: orderedIds.length, sections };
}
