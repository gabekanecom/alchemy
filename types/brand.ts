import { z } from "zod";

// ============================================
// BRAND VOICE TYPES
// ============================================

export const BrandToneSchema = z.enum([
  "professional",
  "casual",
  "friendly",
  "authoritative",
  "playful",
  "empathetic",
  "inspirational",
  "humorous",
]);

export const BrandFormalitySchema = z.enum([
  "formal",
  "informal",
  "conversational",
]);

export const WritingStyleSchema = z.enum([
  "concise",
  "detailed",
  "storytelling",
  "technical",
  "educational",
]);

export const BrandVoiceSchema = z.object({
  tone: BrandToneSchema,
  formality: BrandFormalitySchema,
  personality: z.array(z.string()).default([]),
  vocabulary: z
    .object({
      preferred: z.array(z.string()).default([]),
      avoid: z.array(z.string()).default([]),
    })
    .optional(),
  writingStyle: WritingStyleSchema,
  languageGuidelines: z.string().optional(),
});

export type BrandVoice = z.infer<typeof BrandVoiceSchema>;
export type BrandTone = z.infer<typeof BrandToneSchema>;
export type BrandFormality = z.infer<typeof BrandFormalitySchema>;
export type WritingStyle = z.infer<typeof WritingStyleSchema>;

// ============================================
// TARGET AUDIENCE TYPES
// ============================================

export const ExpertiseLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "expert",
  "mixed",
]);

export const TargetAudienceSchema = z.object({
  demographics: z
    .object({
      ageRange: z.string().optional(),
      location: z.array(z.string()).default([]),
      profession: z.array(z.string()).default([]),
      industries: z.array(z.string()).default([]),
    })
    .optional(),
  psychographics: z
    .object({
      interests: z.array(z.string()).default([]),
      painPoints: z.array(z.string()).default([]),
      goals: z.array(z.string()).default([]),
      values: z.array(z.string()).default([]),
    })
    .optional(),
  expertise: ExpertiseLevelSchema.default("intermediate"),
  description: z.string().optional(),
});

export type TargetAudience = z.infer<typeof TargetAudienceSchema>;
export type ExpertiseLevel = z.infer<typeof ExpertiseLevelSchema>;

// ============================================
// CONTENT PREFERENCES TYPES
// ============================================

export const ContentTypeSchema = z.enum([
  "blog",
  "social",
  "video",
  "email",
  "podcast",
  "whitepaper",
  "case-study",
]);

export const PlatformSchema = z.enum([
  "linkedin",
  "twitter",
  "youtube",
  "facebook",
  "instagram",
  "tiktok",
  "medium",
  "substack",
]);

export const ContentPreferencesSchema = z.object({
  contentTypes: z.array(ContentTypeSchema).default(["blog", "social"]),
  platforms: z.array(PlatformSchema).default(["linkedin", "twitter"]),
  toneGuidelines: z.string().optional(),
  styleGuide: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  prohibitedTopics: z.array(z.string()).default([]),
  customInstructions: z.string().optional(),
});

export type ContentPreferences = z.infer<typeof ContentPreferencesSchema>;
export type ContentType = z.infer<typeof ContentTypeSchema>;
export type Platform = z.infer<typeof PlatformSchema>;

// ============================================
// BRAND VALIDATION SCHEMAS
// ============================================

export const CreateBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  brandVoice: BrandVoiceSchema.optional(),
  targetAudience: TargetAudienceSchema.optional(),
  contentPreferences: ContentPreferencesSchema.optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const UpdateBrandSchema = CreateBrandSchema.partial().extend({
  id: z.string().uuid(),
});

export const BrandQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
export type BrandQuery = z.infer<typeof BrandQuerySchema>;

// ============================================
// BRAND RESPONSE TYPES
// ============================================

export interface BrandResponse {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  brandVoice: BrandVoice | null;
  targetAudience: TargetAudience | null;
  contentPreferences: ContentPreferences | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandWithStats extends BrandResponse {
  stats: {
    totalIdeas: number;
    totalContent: number;
    totalPublications: number;
  };
}
