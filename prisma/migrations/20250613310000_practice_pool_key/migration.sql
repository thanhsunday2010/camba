-- Dynamic practice pool: one paper per level+skill, questions drawn per attempt
ALTER TABLE "ExamPaper" ADD COLUMN "practicePoolKey" TEXT;

CREATE UNIQUE INDEX "ExamPaper_practicePoolKey_key" ON "ExamPaper"("practicePoolKey");
