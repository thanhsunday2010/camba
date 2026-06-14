-- AlterTable
ALTER TABLE "User" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "activeTitle" TEXT;

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN "gamificationProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Attempt" ADD COLUMN "gamificationSnapshot" JSONB;

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementKey" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementKey_key" ON "UserAchievement"("userId", "achievementKey");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
