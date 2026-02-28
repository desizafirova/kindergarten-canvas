-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "teachers" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "status" "TeacherStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teachers_status_idx" ON "teachers"("status");

-- CreateIndex
CREATE INDEX "teachers_status_displayOrder_idx" ON "teachers"("status", "displayOrder");
