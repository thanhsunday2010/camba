import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  INLINE_CONTENT_SETTING_KEY,
  inlineContentSchema,
  type InlineContentMap,
} from "@/lib/site/inline-content";

export const INLINE_CONTENT_CACHE_SECONDS = 300;

async function fetchInlineContentFromDb(): Promise<InlineContentMap> {
  try {
    const row = await db.siteSetting.findUnique({
      where: { key: INLINE_CONTENT_SETTING_KEY },
    });
    if (!row) return {};
    const parsed = inlineContentSchema.safeParse(row.value);
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export async function getInlineContent(): Promise<InlineContentMap> {
  return unstable_cache(
    fetchInlineContentFromDb,
    ["inline-content"],
    { revalidate: INLINE_CONTENT_CACHE_SECONDS, tags: ["inline-content"] }
  )();
}
