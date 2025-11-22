import { z } from "zod";

// ============================================
// IDEA SOURCE TYPES
// ============================================

export const IdeaSourceSchema = z.enum([
  "manual",
  "reddit",
  "youtube",
  "twitter",
  "linkedin",
  "firecrawl",
  "google-trends",
]);

export type IdeaSource = z.infer<typeof IdeaSourceSchema>;

// ============================================
// CONTENT TYPE TYPES
// ============================================

export const IdeaContentTypeSchema = z.enum([
  "how-to",
  "listicle",
  "case-study",
  "tutorial",
  "review",
  "comparison",
  "guide",
  "news",
  "opinion",
  "interview",
  "roundup",
  "infographic",
]);

export type IdeaContentType = z.infer<typeof IdeaContentTypeSchema>;

// ============================================
// PRIORITY & STATUS
// ============================================

export const IdeaPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const IdeaStatusSchema = z.enum([
  "new",
  "researching",
  "queued",
  "in_production",
  "published",
  "archived",
]);

export type IdeaPriority = z.infer<typeof IdeaPrioritySchema>;
export type IdeaStatus = z.infer<typeof IdeaStatusSchema>;

// ============================================
// SEO DATA TYPES
// ============================================

export const KeywordDataSchema = z.object({
  keyword: z.string(),
  volume: z.number().int().nonnegative(),
  difficulty: z.number().min(0).max(100),
  cpc: z.number().nonnegative().optional(),
});

export const SeoDataSchema = z.object({
  keywords: z.array(KeywordDataSchema).default([]),
  relatedQueries: z.array(z.string()).default([]),
  trendData: z.record(z.any()).optional(),
  searchIntent: z.enum(["informational", "transactional", "navigational", "commercial"]).optional(),
});

export type KeywordData = z.infer<typeof KeywordDataSchema>;
export type SeoData = z.infer<typeof SeoDataSchema>;

// ============================================
// SOURCE DATA TYPES
// ============================================

export const RedditSourceDataSchema = z.object({
  subreddit: z.string(),
  postId: z.string(),
  upvotes: z.number(),
  comments: z.number(),
  author: z.string().optional(),
});

export const YouTubeSourceDataSchema = z.object({
  videoId: z.string(),
  channelId: z.string(),
  views: z.number(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  publishedAt: z.string().optional(),
});

export const TwitterSourceDataSchema = z.object({
  tweetId: z.string(),
  author: z.string(),
  likes: z.number(),
  retweets: z.number(),
  replies: z.number(),
});

// ============================================
// IDEA VALIDATION SCHEMAS
// ============================================

export const CreateIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  keywords: z.array(z.string()).default([]),
  source: IdeaSourceSchema,
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sourceData: z.record(z.any()).optional(),
  targetPlatforms: z.array(z.string()).default(["blog"]),
  contentType: IdeaContentTypeSchema,
  targetAudience: z.string().optional(),
  priority: IdeaPrioritySchema.default("medium"),
  notes: z.string().max(2000).optional(),
  brandId: z.string().uuid().optional(),
});

export const UpdateIdeaSchema = CreateIdeaSchema.partial().extend({
  id: z.string().uuid(),
  status: IdeaStatusSchema.optional(),
  viralityScore: z.number().min(0).max(100).optional(),
  relevanceScore: z.number().min(0).max(100).optional(),
  competitionScore: z.number().min(0).max(100).optional(),
  overallScore: z.number().min(0).max(100).optional(),
  seoData: SeoDataSchema.optional(),
});

export const IdeaQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  status: IdeaStatusSchema.optional(),
  priority: IdeaPrioritySchema.optional(),
  source: IdeaSourceSchema.optional(),
  search: z.string().optional(),
  minScore: z.number().min(0).max(100).optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z.enum(["createdAt", "updatedAt", "overallScore", "viralityScore"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateIdeaInput = z.infer<typeof CreateIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaSchema>;
export type IdeaQuery = z.infer<typeof IdeaQuerySchema>;

// ============================================
// IDEA RESPONSE TYPES
// ============================================

export interface IdeaResponse {
  id: string;
  userId: string;
  brandId: string | null;
  title: string;
  description: string | null;
  keywords: string[];
  source: IdeaSource;
  sourceUrl: string | null;
  sourceData: any;
  targetPlatforms: string[];
  contentType: IdeaContentType;
  targetAudience: string | null;
  viralityScore: number | null;
  relevanceScore: number | null;
  competitionScore: number | null;
  overallScore: number | null;
  seoData: SeoData | null;
  priority: IdeaPriority;
  status: IdeaStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdeaWithBrand extends IdeaResponse {
  brand: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
