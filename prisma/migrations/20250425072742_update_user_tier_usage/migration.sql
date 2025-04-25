/*
  Warnings:

  - You are about to drop the `UserSessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "UserSessions";

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" SERIAL NOT NULL,
    "privy_id" TEXT NOT NULL,
    "tokensUsed" DOUBLE PRECISION NOT NULL,
    "usdConsumed" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelName" TEXT NOT NULL,
    "userTierId" INTEGER,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageRecord_privy_id_usedAt_idx" ON "UsageRecord"("privy_id", "usedAt");

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userTierId_fkey" FOREIGN KEY ("userTierId") REFERENCES "UserTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
