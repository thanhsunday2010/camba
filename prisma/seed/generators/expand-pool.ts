import { QuestionType } from "@prisma/client";
import { getSeedDiversityKey } from "../../../src/lib/exam/question-diversity";

export function expandPoolDeduped<T extends { title: string }>(
  base: T[],
  target: number,
  type: QuestionType,
  generateOne: (offset: number) => T | null,
  maxAttemptsMultiplier = 8
): T[] {
  if (target <= 0) return [];
  const keys = new Set(
    base.map((item) => getSeedDiversityKey(type, item as { title: string } & Record<string, unknown>))
  );
  const out = [...base];
  let offset = base.length;
  const maxAttempts = Math.max(target * maxAttemptsMultiplier, 500);

  for (let attempt = 0; out.length < target && attempt < maxAttempts; attempt++) {
    const item = generateOne(offset++);
    if (!item) continue;
    const key = getSeedDiversityKey(type, item as { title: string } & Record<string, unknown>);
    if (keys.has(key)) continue;
    keys.add(key);
    out.push(item);
  }

  if (out.length < target) {
    console.warn(
      `[expand-pool] Chỉ mở rộng được ${out.length}/${target} câu (hết mẫu đa dạng).`
    );
  }

  return out.slice(0, target);
}
