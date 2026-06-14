"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireAdminPermission } from "@/lib/admin/access";
import {
  FOOTER_SETTING_KEY,
  footerSettingsSchema,
  type FooterSettings,
} from "@/lib/site/footer";

const updateSchema = footerSettingsSchema;

export async function updateFooterSettingsAction(input: FooterSettings) {
  const { error: authError } = await requireAdminPermission("site.manage");
  if (authError) return { error: authError };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dữ liệu chân trang không hợp lệ" };
  }

  for (const column of parsed.data.columns) {
    for (const link of column.links) {
      if (!link.href.startsWith("/") && !link.href.startsWith("http")) {
        return { error: `Link "${link.label}" phải bắt đầu bằng / hoặc http` };
      }
    }
  }

  try {
    await db.siteSetting.upsert({
      where: { key: FOOTER_SETTING_KEY },
      create: { key: FOOTER_SETTING_KEY, value: parsed.data },
      update: { value: parsed.data },
    });

    revalidateTag("footer-settings");
    revalidatePath("/", "layout");
    revalidatePath("/admin/footer");
    return { success: true };
  } catch (error) {
    console.error("[updateFooterSettingsAction]", error);
    return { error: "Không thể lưu chân trang" };
  }
}

export async function resetFooterSettingsAction() {
  const { error: authError } = await requireAdminPermission("site.manage");
  if (authError) return { error: authError };

  const { DEFAULT_FOOTER_SETTINGS } = await import("@/lib/site/footer");

  await db.siteSetting.deleteMany({ where: { key: FOOTER_SETTING_KEY } });
  revalidateTag("footer-settings");
  revalidatePath("/", "layout");
  return { success: true, settings: DEFAULT_FOOTER_SETTINGS };
}

export async function getFooterSettingsForAdminAction(): Promise<
  { settings: FooterSettings } | { error: string }
> {
  const { error: authError } = await requireAdminPermission("site.manage");
  if (authError) return { error: authError };

  const { getFooterSettings } = await import("@/lib/site/get-footer-settings");
  const settings = await getFooterSettings();
  return { settings };
}
