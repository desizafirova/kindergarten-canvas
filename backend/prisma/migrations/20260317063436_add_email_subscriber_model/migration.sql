-- CreateTable
CREATE TABLE "email_subscribers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscription_types" TEXT[],
    "unsubscribe_token" TEXT NOT NULL,
    "subscribed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMPTZ(6),

    CONSTRAINT "email_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_subscribers_email_key" ON "email_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscribers_unsubscribe_token_key" ON "email_subscribers"("unsubscribe_token");

-- CreateIndex
CREATE INDEX "email_subscribers_is_active_idx" ON "email_subscribers"("is_active");
