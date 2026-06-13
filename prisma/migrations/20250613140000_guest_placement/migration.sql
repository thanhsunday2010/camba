-- AlterTable: guest placement attempts
ALTER TABLE "Attempt" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "guestFullName" TEXT;
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "guestPhone" TEXT;
