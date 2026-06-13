import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { importPlacementFromDir } from "../prisma/seed/import-placement";

const db = new PrismaClient();
const root = process.cwd();
const defaultDir = path.join(root, "content", "placement");
const args = process.argv.slice(2);
const files = args.length > 0 ? args.map((f) => path.resolve(f)) : undefined;

async function main() {
  console.log("Import placement JSON → Camba DB\n");

  if (!files) {
    console.log(`Thư mục: ${defaultDir}\n`);
  }

  await importPlacementFromDir(db, defaultDir, files);

  const count = await db.examPaper.count({ where: { paperKind: "PLACEMENT", published: true } });
  console.log(`\nHoàn tất. ${count} đề placement đang published.`);
}

main()
  .catch((e) => {
    console.error("\nLỗi import:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
