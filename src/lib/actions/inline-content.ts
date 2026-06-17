"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin/access";
import {
  INLINE_CONTENT_SETTING_KEY,
  inlineContentSchema,
  type InlineContentMap,
} from "@/lib/site/inline-content";

const patchSchema = inlineContentSchema;

export async function saveInlineContentAction(
  updates: InlineContentMap
): Promise<{ success: true; stored: InlineContentMap } | { error: string }> {
  const authError = await requireSuperAdmin();
  if (authError) return { error: authError };

  const parsed = patchSchema.safeParse(updates);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Nội dung không hợp lệ" };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { error: "Không có thay đổi để lưu" };
  }

  try {
    const existingRow = await db.siteSetting.findUnique({
      where: { key: INLINE_CONTENT_SETTING_KEY },
    });
    const existingParsed = existingRow
      ? inlineContentSchema.safeParse(existingRow.value)
      : null;
    const existing: InlineContentMap = existingParsed?.success ? existingParsed.data : {};

    const merged: InlineContentMap = { ...existing, ...parsed.data };

    await db.siteSetting.upsert({
      where: { key: INLINE_CONTENT_SETTING_KEY },
      create: { key: INLINE_CONTENT_SETTING_KEY, value: merged },
      update: { value: merged },
    });

    revalidateTag("inline-content");
    revalidatePath("/", "layout");

    return { success: true, stored: merged };
  } catch (error) {
    console.error("[saveInlineContentAction]", error);
    return { error: "Không thể lưu nội dung trang" };
  }
}
