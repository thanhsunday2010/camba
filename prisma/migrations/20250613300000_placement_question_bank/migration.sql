-- Placement question bank + per-attempt question snapshot

ALTER TABLE "ExamPaper" ADD COLUMN "placementSlug" TEXT;
CREATE UNIQUE INDEX "ExamPaper_placementSlug_key" ON "ExamPaper"("placementSlug");

ALTER TABLE "Question" ADD COLUMN "placementSlug" TEXT;
ALTER TABLE "Question" ADD COLUMN "placementPool" TEXT;
CREATE INDEX "Question_placementSlug_placementPool_idx" ON "Question"("placementSlug", "placementPool");

CREATE TABLE "AttemptQuestion" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AttemptQuestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AttemptQuestion_attemptId_questionId_key" ON "AttemptQuestion"("attemptId", "questionId");
CREATE INDEX "AttemptQuestion_attemptId_idx" ON "AttemptQuestion"("attemptId");

ALTER TABLE "AttemptQuestion" ADD CONSTRAINT "AttemptQuestion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptQuestion" ADD CONSTRAINT "AttemptQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
