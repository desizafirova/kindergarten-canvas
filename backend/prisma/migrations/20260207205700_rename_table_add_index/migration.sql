/*
  Warnings:

  - You are about to drop the `NewsItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "NewsItem";

-- CreateTable
CREATE TABLE "news_items" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_items_status_idx" ON "news_items"("status");
