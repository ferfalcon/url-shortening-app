-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "createdByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Link_createdByUserId_idx" ON "Link"("createdByUserId");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
