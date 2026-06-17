import { PrismaClient } from "@prisma/client";
import { seedAllCuratedContent } from "./seed-curated-only";

export { ALL_LEVELS } from "./seed-curated-bank";

export async function seedAllBulkContent(db: PrismaClient) {
  await seedAllCuratedContent(db);
}
