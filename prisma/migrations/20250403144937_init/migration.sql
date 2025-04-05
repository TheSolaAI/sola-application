-- CreateTable
CREATE TABLE "UserTier" (
    "id" SERIAL NOT NULL,
    "privy_id" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "total_sola_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSessions" (
    "id" SERIAL NOT NULL,
    "privy_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTier_privy_id_key" ON "UserTier"("privy_id");

-- CreateIndex
CREATE INDEX "UserTier_privy_id_idx" ON "UserTier"("privy_id");

-- CreateIndex
CREATE INDEX "UserSessions_privy_id_session_created_at_idx" ON "UserSessions"("privy_id", "session_created_at");
