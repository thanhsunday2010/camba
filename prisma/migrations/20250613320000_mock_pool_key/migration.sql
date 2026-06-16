-- AlterTable
ALTER TABLE "ExamPaper" ADD COLUMN "mockPoolKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExamPaper_mockPoolKey_key" ON "ExamPaper"("mockPoolKey");
