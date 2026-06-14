-- Separate AI explain/grading counters for Reading and Listening.
ALTER TABLE "DailyUsage" ADD COLUMN "readingAiGradingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DailyUsage" ADD COLUMN "listeningAiGradingCount" INTEGER NOT NULL DEFAULT 0;
