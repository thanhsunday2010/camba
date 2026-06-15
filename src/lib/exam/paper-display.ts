const LEVEL_PREFIX = /^(STARTERS|MOVERS|FLYERS|KET|PET|FCE)\s+/i;

/** Tiêu đề ngắn gọn cho danh sách đề (mobile-friendly). */
export function shortPaperListTitle(title: string): string {
  let t = title.replace(/\s*—\s*Cambridge Format$/i, "").trim();
  t = t.replace(LEVEL_PREFIX, "");
  if (t === "Full Mock —" || t === "Full Mock") {
    return "Full Mock 1";
  }
  t = t.replace(/^Full Mock Test\s+/i, "Full Mock ");
  t = t.replace(/^Grammar & UoE /i, "Grammar ");
  return t;
}
