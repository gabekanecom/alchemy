import { z } from "zod";

// ============================================
// CONTENT QUEUE TYPES
// ============================================

export const QueueStatusSchema = z.enum([
  "queued",
  "processing",
  "review",
  "approved",
  "failed",
  "cancelled",
]);

export const QueuePlatformSchema = z.enum([
  "blog",
  "youtube",
  "linkedin",
  "twitter",
  "facebook",
  "instagram",
  "email",
]);

export const QueueContentTypeSchema = z.enum([
  "blog_post",
  "video_script",
  "social_post",
  "email",
  "thread",
  "carousel",
]);

export type QueueStatus = z.infer<typeof QueueStatusSchema>;
export type QueuePlatform = z.infer<typeof QueuePlatformSchema>;
export type QueueContentType = z.infer<typeof QueueContentTypeSchema>;

// ============================================
// GENERATION CONFIG
// ============================================

export const AiModelSchema = z.enum([
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "gpt-4-turbo-preview",
  "gpt-4",
]);

export const GenerationConfigSchema = z.object({
  aiModel: AiModelSchema.default("claude-sonnet-4-20250514"),
  temperature: z.number().min(0).max(2).default(1.0),
  maxTokens: z.number().int().positive().max(8000).default(4096),
  customPrompt: z.string().optional(),
  includeImages: z.boolean().default(false),
  targetWordCount: z.number().int().positive().optional(),
  tone: z.string().optional(),
});

export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;
export type AiModel = z.infer<typeof AiModelSchema>;

// ============================================
// CONTENT BRIEF
// ============================================

export const ContentBriefSchema = z.object({
  outline: z.array(z.string()).default([]),
  keyPoints: z.array(z.string()).default([]),
  research: z.record(z.any()).optional(),
  targetWordCount: z.number().int().positive().optional(),
  callToAction: z.string().optional(),
  references: z.array(z.string()).default([]),
});

export type ContentBrief = z.infer<typeof ContentBriefSchema>;

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CreateContentQueueSchema = z.object({
  brandId: z.string().uuid().optional(),
  ideaId: z.string().uuid().optional(),
  platform: QueuePlatformSchema,
  contentType: QueueContentTypeSchema,
  generationConfig: GenerationConfigSchema.optional(),
  brief: ContentBriefSchema.optional(),
  scheduledFor: z.string().datetime().optional(),
});

export const UpdateContentQueueSchema = z.object({
  id: z.string().uuid(),
  status: QueueStatusSchema.optional(),
  progress: z.number().min(0).max(100).optional(),
  errorMessage: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
});

export type CreateContentQueueInput = z.infer<typeof CreateContentQueueSchema>;
export type UpdateContentQueueInput = z.infer<typeof UpdateContentQueueSchema>;

// ============================================
// GENERATED CONTENT TYPES
// ============================================

export const ContentStatusSchema = z.enum([
  "draft",
  "review",
  "approved",
  "published",
  "rejected",
]);

export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const ContentMetadataSchema = z.object({
  wordCount: z.number().int().nonnegative().optional(),
  readingTime: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  language: z.string().default("en"),
});

export const ContentSeoDataSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  slug: z.string().optional(),
  focusKeyword: z.string().optional(),
  titleVariations: z.array(z.string()).default([]),
  ogImage: z.string().url().optional(),
});

export const AiMetadataSchema = z.object({
  model: z.string(),
  tokensUsed: z.number().int().nonnegative(),
  cost: z.number().nonnegative().optional(),
  parameters: z.record(z.any()).optional(),
  generatedAt: z.string().datetime(),
  processingTime: z.number().nonnegative().optional(),
});

export type ContentMetadata = z.infer<typeof ContentMetadataSchema>;
export type ContentSeoData = z.infer<typeof ContentSeoDataSchema>;
export type AiMetadata = z.infer<typeof AiMetadataSchema>;

// ============================================
// CONTENT VALIDATION
// ============================================

export const CreateGeneratedContentSchema = z.object({
  queueId: z.string().uuid(),
  contentType: QueueContentTypeSchema,
  platform: QueuePlatformSchema,
  title: z.string().max(200).optional(),
  body: z.string(),
  excerpt: z.string().max(500).optional(),
  metadata: ContentMetadataSchema.optional(),
  seoData: ContentSeoDataSchema.optional(),
  mediaAssets: z.array(z.string()).default([]),
  aiMetadata: AiMetadataSchema.optional(),
});

export const UpdateGeneratedContentSchema = CreateGeneratedContentSchema.partial().extend({
  id: z.string().uuid(),
  status: ContentStatusSchema.optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  readabilityScore: z.number().min(0).max(100).optional(),
  seoScore: z.number().min(0).max(100).optional(),
});

export type CreateGeneratedContentInput = z.infer<typeof CreateGeneratedContentSchema>;
export type UpdateGeneratedContentInput = z.infer<typeof UpdateGeneratedContentSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export interface ContentQueueResponse {
  id: string;
  userId: string;
  brandId: string | null;
  ideaId: string | null;
  jobId: string | null;
  platform: QueuePlatform;
  contentType: QueueContentType;
  generationConfig: GenerationConfig | null;
  status: QueueStatus;
  progress: number | null;
  errorMessage: string | null;
  brief: ContentBrief | null;
  scheduledFor: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedContentResponse {
  id: string;
  queueId: string;
  userId: string;
  brandId: string | null;
  contentType: QueueContentType;
  platform: QueuePlatform;
  title: string | null;
  body: string | null;
  excerpt: string | null;
  metadata: ContentMetadata | null;
  seoData: ContentSeoData | null;
  mediaAssets: string[];
  aiMetadata: AiMetadata | null;
  version: number;
  parentId: string | null;
  status: ContentStatus;
  qualityScore: number | null;
  readabilityScore: number | null;
  seoScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentWithBrand extends GeneratedContentResponse {
  brand: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
