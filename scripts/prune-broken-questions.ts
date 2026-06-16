/**
 * Xóa câu Writing/Speaking pool bị tạo lỗi (title null) từ lần supplement đầu.
 * Usage: npm run content:prune-broken-questions
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const broken = await db.question.findMany({
    where: {
      placementSlug: null,
      skill: { in: ["WRITING", "SPEAKING"] },
      title: null,
    },
    select: { id: true },
  });

  if (broken.length === 0) {
    console.log("Không có câu lỗi cần xóa.");
    return;
  }

  const ids = broken.map((q) => q.id);
  await db.attemptQuestion.deleteMany({ where: { questionId: { in: ids } } });
  await db.paperQuestion.deleteMany({ where: { questionId: { in: ids } } });
  const result = await db.question.deleteMany({ where: { id: { in: ids } } });

  console.log(`Đã xóa ${result.count} câu Writing/Speaking lỗi (title null).`);
  console.log("Chạy: npm run content:supplement-bank");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
