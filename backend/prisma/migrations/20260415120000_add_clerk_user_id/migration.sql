-- AlterTable: add clerkUserId column to User
ALTER TABLE "User" ADD COLUMN "clerkUserId" TEXT;

-- CreateIndex: unique constraint on clerkUserId
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex: lookup index
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");
