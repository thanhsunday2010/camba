-- CreateEnum
CREATE TYPE "ContentSource" AS ENUM ('CURATED', 'GENERATED');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN "contentSource" "ContentSource";

-- CreateIndex
CREATE INDEX "Question_level_skill_contentSource_idx" ON "Question"("level", "skill", "contentSource");
