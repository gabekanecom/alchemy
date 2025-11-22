-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "website_url" TEXT,
    "brand_voice" JSONB,
    "target_audience" JSONB,
    "content_preferences" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "source" TEXT NOT NULL,
    "source_url" TEXT,
    "source_data" JSONB,
    "target_platforms" TEXT[],
    "content_type" TEXT NOT NULL,
    "target_audience" TEXT,
    "virality_score" DOUBLE PRECISION,
    "relevance_score" DOUBLE PRECISION,
    "competition_score" DOUBLE PRECISION,
    "overall_score" DOUBLE PRECISION,
    "seo_data" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_queue" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "idea_id" TEXT,
    "job_id" TEXT,
    "platform" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "generation_config" JSONB,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" DOUBLE PRECISION DEFAULT 0,
    "error_message" TEXT,
    "brief" JSONB,
    "scheduled_for" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_content" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "content_type" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "excerpt" TEXT,
    "metadata" JSONB,
    "seo_data" JSONB,
    "media_assets" TEXT[],
    "ai_metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "quality_score" DOUBLE PRECISION,
    "readability_score" DOUBLE PRECISION,
    "seo_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "filename" TEXT NOT NULL,
    "filesize" INTEGER,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "generated_by" TEXT,
    "prompt" TEXT,
    "generation_config" JSONB,
    "tags" TEXT[],
    "description" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "content_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platform_post_id" TEXT,
    "published_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "error_message" TEXT,
    "performance_metrics" JSONB,
    "scheduled_for" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DOUBLE PRECISION,
    "ctr" DOUBLE PRECISION,
    "metrics_snapshot" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "service_name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "endpoint" TEXT,
    "rate_limit_per_hour" INTEGER,
    "rate_limit_per_day" INTEGER,
    "requests_this_hour" INTEGER NOT NULL DEFAULT 0,
    "requests_today" INTEGER NOT NULL DEFAULT 0,
    "last_reset_hour" TIMESTAMP(3),
    "last_reset_day" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_logs" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "input" JSONB,
    "output" JSONB,
    "error_message" TEXT,
    "error_stack" TEXT,
    "duration" INTEGER,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_user_id_idx" ON "brands"("user_id");

-- CreateIndex
CREATE INDEX "brands_slug_idx" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "ideas_user_id_status_idx" ON "ideas"("user_id", "status");

-- CreateIndex
CREATE INDEX "ideas_brand_id_idx" ON "ideas"("brand_id");

-- CreateIndex
CREATE INDEX "ideas_source_idx" ON "ideas"("source");

-- CreateIndex
CREATE INDEX "ideas_status_idx" ON "ideas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "content_queue_job_id_key" ON "content_queue"("job_id");

-- CreateIndex
CREATE INDEX "content_queue_user_id_status_idx" ON "content_queue"("user_id", "status");

-- CreateIndex
CREATE INDEX "content_queue_brand_id_idx" ON "content_queue"("brand_id");

-- CreateIndex
CREATE INDEX "content_queue_status_idx" ON "content_queue"("status");

-- CreateIndex
CREATE INDEX "content_queue_scheduled_for_idx" ON "content_queue"("scheduled_for");

-- CreateIndex
CREATE INDEX "generated_content_queue_id_idx" ON "generated_content"("queue_id");

-- CreateIndex
CREATE INDEX "generated_content_brand_id_idx" ON "generated_content"("brand_id");

-- CreateIndex
CREATE INDEX "generated_content_user_id_status_idx" ON "generated_content"("user_id", "status");

-- CreateIndex
CREATE INDEX "generated_content_platform_status_idx" ON "generated_content"("platform", "status");

-- CreateIndex
CREATE INDEX "media_user_id_type_idx" ON "media"("user_id", "type");

-- CreateIndex
CREATE INDEX "media_brand_id_idx" ON "media"("brand_id");

-- CreateIndex
CREATE INDEX "media_generated_by_idx" ON "media"("generated_by");

-- CreateIndex
CREATE INDEX "publications_user_id_platform_idx" ON "publications"("user_id", "platform");

-- CreateIndex
CREATE INDEX "publications_brand_id_idx" ON "publications"("brand_id");

-- CreateIndex
CREATE INDEX "publications_platform_status_idx" ON "publications"("platform", "status");

-- CreateIndex
CREATE INDEX "publications_scheduled_for_idx" ON "publications"("scheduled_for");

-- CreateIndex
CREATE INDEX "publications_published_at_idx" ON "publications"("published_at");

-- CreateIndex
CREATE INDEX "analytics_publication_id_idx" ON "analytics"("publication_id");

-- CreateIndex
CREATE INDEX "analytics_platform_date_idx" ON "analytics"("platform", "date");

-- CreateIndex
CREATE INDEX "api_configs_service_name_idx" ON "api_configs"("service_name");

-- CreateIndex
CREATE UNIQUE INDEX "api_configs_user_id_service_name_key" ON "api_configs"("user_id", "service_name");

-- CreateIndex
CREATE INDEX "job_logs_job_type_status_idx" ON "job_logs"("job_type", "status");

-- CreateIndex
CREATE INDEX "job_logs_started_at_idx" ON "job_logs"("started_at");

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_queue" ADD CONSTRAINT "content_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_queue" ADD CONSTRAINT "content_queue_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_queue" ADD CONSTRAINT "content_queue_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "content_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "generated_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
