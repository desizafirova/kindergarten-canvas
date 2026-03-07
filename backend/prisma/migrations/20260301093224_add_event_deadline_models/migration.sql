-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMPTZ(6) NOT NULL,
    "event_end_date" TIMESTAMPTZ(6),
    "location" TEXT,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deadlines" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline_date" TIMESTAMPTZ(6) NOT NULL,
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_status_event_date_idx" ON "events"("status", "event_date");

-- CreateIndex
CREATE INDEX "events_status_created_at_idx" ON "events"("status", "created_at");

-- CreateIndex
CREATE INDEX "deadlines_status_deadline_date_idx" ON "deadlines"("status", "deadline_date");

-- CreateIndex
CREATE INDEX "deadlines_status_created_at_idx" ON "deadlines"("status", "created_at");
