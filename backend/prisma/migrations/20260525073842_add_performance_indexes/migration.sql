-- DropIndex
DROP INDEX "analytics_clicks_clickedAt_idx";

-- DropIndex
DROP INDEX "analytics_clicks_linkId_idx";

-- DropIndex
DROP INDEX "events_dateTime_idx";

-- DropIndex
DROP INDEX "events_organizerId_idx";

-- DropIndex
DROP INDEX "events_slug_idx";

-- DropIndex
DROP INDEX "events_status_idx";

-- DropIndex
DROP INDEX "links_createdAt_idx";

-- DropIndex
DROP INDEX "links_shortCode_idx";

-- DropIndex
DROP INDEX "links_userId_idx";

-- DropIndex
DROP INDEX "tickets_eventId_idx";

-- DropIndex
DROP INDEX "tickets_status_idx";

-- CreateIndex
CREATE INDEX "analytics_clicks_linkId_clickedAt_idx" ON "analytics_clicks"("linkId", "clickedAt" DESC);

-- CreateIndex
CREATE INDEX "analytics_clicks_country_idx" ON "analytics_clicks"("country");

-- CreateIndex
CREATE INDEX "events_organizerId_status_idx" ON "events"("organizerId", "status");

-- CreateIndex
CREATE INDEX "events_dateTime_status_idx" ON "events"("dateTime", "status");

-- CreateIndex
CREATE INDEX "events_slug_status_idx" ON "events"("slug", "status");

-- CreateIndex
CREATE INDEX "links_userId_createdAt_idx" ON "links"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "links_shortCode_isActive_idx" ON "links"("shortCode", "isActive");

-- CreateIndex
CREATE INDEX "links_expiresAt_idx" ON "links"("expiresAt");

-- CreateIndex
CREATE INDEX "tickets_eventId_status_idx" ON "tickets"("eventId", "status");
