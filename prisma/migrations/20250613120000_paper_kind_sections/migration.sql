-- CreateEnum (idempotent — safe if db push ran first)
DO $$ BEGIN
  CREATE TYPE "PaperKind" AS ENUM ('PRACTICE', 'MOCK_SKILL', 'MOCK_FULL', 'PLACEMENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "paperKind" "PaperKind" NOT NULL DEFAULT 'PRACTICE';
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "sections" JSONB;

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "placementReport" JSONB;
