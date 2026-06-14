import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  DEFAULT_FOOTER_SETTINGS,
  FOOTER_SETTING_KEY,
  footerSettingsSchema,
  type FooterSettings,
} from "@/lib/site/footer";

export const FOOTER_CACHE_SECONDS = 3600;

async function fetchFooterSettingsFromDb(): Promise<FooterSettings> {
  try {
    const row = await db.siteSetting.findUnique({
      where: { key: FOOTER_SETTING_KEY },
    });

    if (!row) return DEFAULT_FOOTER_SETTINGS;

    const parsed = footerSettingsSchema.safeParse(row.value);
    if (!parsed.success) return DEFAULT_FOOTER_SETTINGS;

    return parsed.data;
  } catch {
    return DEFAULT_FOOTER_SETTINGS;
  }
}

export async function getFooterSettings(): Promise<FooterSettings> {
  return unstable_cache(
    fetchFooterSettingsFromDb,
    ["footer-settings"],
    { revalidate: FOOTER_CACHE_SECONDS, tags: ["footer-settings"] }
  )();
}
