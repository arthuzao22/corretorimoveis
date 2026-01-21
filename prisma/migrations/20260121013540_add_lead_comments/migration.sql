-- CreateTable
CREATE TABLE "lead_comments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_comments_leadId_idx" ON "lead_comments"("leadId");

-- CreateIndex
CREATE INDEX "lead_comments_authorId_idx" ON "lead_comments"("authorId");

-- CreateIndex
CREATE INDEX "lead_comments_createdAt_idx" ON "lead_comments"("createdAt");

-- AddForeignKey
ALTER TABLE "lead_comments" ADD CONSTRAINT "lead_comments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_comments" ADD CONSTRAINT "lead_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
