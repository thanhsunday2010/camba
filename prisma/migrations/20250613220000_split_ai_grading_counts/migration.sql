-- Split shared AI grading counter into writing and speaking buckets.
ALTER TABLE "DailyUsage" ADD COLUMN "writingAiGradingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DailyUsage" ADD COLUMN "speakingAiGradingCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "DailyUsage" SET "writingAiGradingCount" = "aiGradingCount";

ALTER TABLE "DailyUsage" DROP COLUMN "aiGradingCount";
