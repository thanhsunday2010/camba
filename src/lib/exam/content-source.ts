import { ContentSource, Prisma } from "@prisma/client";

/** Chỉ phục vụ câu curated cho pool luyện tập & mock (giai đoạn 2 chất lượng nội dung). */
export const PRACTICE_POOL_CURATED_ONLY = true;

export function curatedPoolWhere(): Prisma.QuestionWhereInput {
  if (!PRACTICE_POOL_CURATED_ONLY) {
    return {};
  }
  return { contentSource: ContentSource.CURATED };
}

export function isCuratedQuestion(contentSource: ContentSource | null | undefined): boolean {
  if (!PRACTICE_POOL_CURATED_ONLY) return true;
  return contentSource === ContentSource.CURATED;
}
