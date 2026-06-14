import { db } from "@/lib/db";
import {
  DEFAULT_FOOTER_SETTINGS,
  FOOTER_SETTING_KEY,
  footerSettingsSchema,
  type FooterSettings,
} from "@/lib/site/footer";

export async function getFooterSettings(): Promise<FooterSettings> {
  const row = await db.siteSetting.findUnique({
    where: { key: FOOTER_SETTING_KEY },
  });

  if (!row) return DEFAULT_FOOTER_SETTINGS;

  const parsed = footerSettingsSchema.safeParse(row.value);
  if (!parsed.success) return DEFAULT_FOOTER_SETTINGS;

  return parsed.data;
}
