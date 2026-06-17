-- CreateTable
CREATE TABLE "PaperComment" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaperComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaperComment_paperId_createdAt_idx" ON "PaperComment"("paperId", "createdAt");

-- AddForeignKey
ALTER TABLE "PaperComment" ADD CONSTRAINT "PaperComment_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "ExamPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperComment" ADD CONSTRAINT "PaperComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
