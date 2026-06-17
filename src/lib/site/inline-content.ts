import { z } from "zod";

export const INLINE_CONTENT_SETTING_KEY = "inline-content";

/** Map contentKey → overridden text (empty string = use default). */
export const inlineContentSchema = z.record(z.string().max(5000));

export type InlineContentMap = z.infer<typeof inlineContentSchema>;

export function resolveInlineText(
  map: InlineContentMap,
  key: string,
  defaultValue: string
): string {
  const value = map[key];
  if (value === undefined || value === null) return defaultValue;
  const trimmed = value.trim();
  return trimmed.length > 0 ? value : defaultValue;
}
