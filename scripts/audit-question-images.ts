/**
 * Liệt kê câu hỏi cần ảnh / thiếu ảnh trong ngân hàng đề.
 * Usage: npm run content:audit-images [-- --missing-only] [-- --level=STARTERS]
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  getQuestionImageHint,
  getQuestionImageStatus,
  summarizeImageAudit,
} from "../src/lib/exam/question-image-needs";

const db = new PrismaClient();

const args = process.argv.slice(2);
const missingOnly = args.includes("--missing-only");
const levelArg = args.find((a) => a.startsWith("--level="));
const levelFilter = levelArg ? levelArg.split("=")[1] : null;

async function main() {
  const questions = await db.question.findMany({
    select: { id: true, type: true, level: true, skill: true, title: true, content: true },
    orderBy: [{ level: "asc" }, { skill: "asc" }],
  });

  const filtered = levelFilter
    ? questions.filter((q) => q.level === levelFilter)
    : questions;

  const summary = summarizeImageAudit(filtered);

  console.log("\n=== Audit ảnh câu hỏi ===");
  console.log(`Tổng câu trong DB: ${filtered.length}`);
  console.log(`Cần ảnh: ${summary.needsImage}`);
  console.log(`  · Thiếu ảnh (chưa có imageUrl): ${summary.missing}`);
  console.log(`  · Đã có ảnh: ${summary.complete}`);
  console.log("");

  const byLevel = new Map<string, { missing: number; complete: number }>();
  for (const q of filtered) {
    const status = getQuestionImageStatus(q.type, q.content);
    if (status === "not_needed") continue;
    const row = byLevel.get(q.level) ?? { missing: 0, complete: 0 };
    if (status === "missing") row.missing++;
    else row.complete++;
    byLevel.set(q.level, row);
  }

  if (byLevel.size > 0) {
    console.log("Theo level:");
    for (const [level, counts] of [...byLevel.entries()].sort()) {
      console.log(`  ${level}: thiếu ${counts.missing}, đủ ${counts.complete}`);
    }
    console.log("");
  }

  const list = filtered.filter((q) => {
    const status = getQuestionImageStatus(q.type, q.content);
    if (status === "not_needed") return false;
    if (missingOnly) return status === "missing";
    return true;
  });

  if (list.length === 0) {
    console.log(missingOnly ? "Không có câu thiếu ảnh." : "Không có câu cần ảnh.");
    return;
  }

  console.log(missingOnly ? "Danh sách thiếu ảnh:" : "Danh sách cần ảnh:");
  for (const q of list.slice(0, 100)) {
    const status = getQuestionImageStatus(q.type, q.content);
    const hint = getQuestionImageHint(q.type, q.content);
    console.log(
      `- [${status === "missing" ? "THIẾU" : "OK"}] ${q.level} ${q.skill} ${q.id.slice(0, 8)} | ${q.title ?? "—"}`
    );
    if (hint) console.log(`    Gợi ý: ${hint.slice(0, 120)}${hint.length > 120 ? "…" : ""}`);
  }

  if (list.length > 100) {
    console.log(`\n… và ${list.length - 100} câu nữa. Mở /admin/question-images để xem đầy đủ.`);
  } else {
    console.log(`\nAdmin: /admin/question-images`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
