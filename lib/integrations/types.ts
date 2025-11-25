// Integration System Types

import { z } from "zod";

export type IntegrationCategory =
  | "ai_provider"
  | "image_generation"
  | "video_generation"
  | "publishing"
  | "analytics"
  | "social_media";

export type IntegrationCapability =
  | "text_generation"
  | "code_generation"
  | "analysis"
  | "editing"
  | "image_generation"
  | "video_generation"
  | "blog_publishing"
  | "social_publishing"
  | "media_management"
  | "analytics_tracking";

export type PricingModel = "pay-per-use" | "subscription" | "free";

export interface PricingTier {
  name: string;
  input?: number;
  output?: number;
  perUnit?: number;
  unit: string;
  monthly?: number;
}

export interface IntegrationProvider {
  id: string;
  category: IntegrationCategory;
  name: string;
  description: string;
  icon: string;
  website: string;

  // Capabilities this provider supports
  capabilities: IntegrationCapability[];

  // Configuration schema (Zod)
  configSchema: z.ZodSchema;

  // Implementation class
  clientClass: any;

  // Pricing information
  pricing: {
    model: PricingModel;
    tiers?: PricingTier[];
  };

  // Setup instructions
  setupInstructions: string;
  setupUrl?: string;

  // OAuth config (if applicable)
  oauth?: {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
  };
}

// Configuration schemas for each provider
export const anthropicConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.enum([
    "claude-sonnet-4-20250514",
    "claude-opus-4-20250514",
    "claude-haiku-20250301",
  ]).default("claude-sonnet-4-20250514"),
  defaultSettings: z.object({
    temperature: z.number().min(0).max(1).default(0.7),
    maxTokens: z.number().min(1).max(200000).default(4000),
    topP: z.number().min(0).max(1).default(1),
  }).default({}),
});

export const openaiConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.enum([
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4o-mini",
    "o1",
    "o1-mini",
  ]).default("gpt-4o"),
  defaultSettings: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(128000).default(4000),
  }).default({}),
});

export const dalleConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  defaultSettings: z.object({
    model: z.enum(["dall-e-3", "dall-e-2"]).default("dall-e-3"),
    size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).default("1792x1024"),
    quality: z.enum(["standard", "hd"]).default("hd"),
    style: z.enum(["natural", "vivid"]).default("natural"),
  }).default({}),
});

export const sanityConfigSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  dataset: z.string().min(1, "Dataset is required").default("production"),
  token: z.string().min(1, "API token is required"),
  apiVersion: z.string().default("2023-05-03"),
  defaultSettings: z.object({
    publishImmediately: z.boolean().default(false),
    authorId: z.string().optional(),
  }).default({}),
});

export const wordpressConfigSchema = z.object({
  siteUrl: z.string().url("Must be a valid URL"),
  username: z.string().min(1, "Username is required"),
  applicationPassword: z.string().min(1, "Application password is required"),
  defaultSettings: z.object({
    status: z.enum(["draft", "publish", "pending"]).default("draft"),
    category: z.string().optional(),
    author: z.number().optional(),
  }).default({}),
});

export const linkedinConfigSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  personURN: z.string().min(1, "Person URN is required"),
  refreshToken: z.string().optional(),
  expiresAt: z.string().optional(),
  defaultSettings: z.object({
    visibility: z.enum(["PUBLIC", "CONNECTIONS"]).default("PUBLIC"),
    shareCommentary: z.boolean().default(true),
  }).default({}),
});

export const twitterConfigSchema = z.object({
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  accessToken: z.string().min(1),
  accessSecret: z.string().min(1),
  defaultSettings: z.object({
    replySettings: z.enum(["everyone", "following", "mentionedUsers"]).default("everyone"),
  }).default({}),
});

export const geminiConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.enum([
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
  ]).default("gemini-1.5-pro"),
  defaultSettings: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxOutputTokens: z.number().min(1).max(8192).default(4000),
  }).default({}),
});

export const runwayConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  defaultSettings: z.object({
    model: z.enum(["gen3", "gen2"]).default("gen3"),
    duration: z.number().min(1).max(10).default(5),
    resolution: z.enum(["720p", "1080p"]).default("1080p"),
    style: z.string().optional(),
  }).default({}),
});

export const ghostConfigSchema = z.object({
  siteUrl: z.string().url("Must be a valid URL"),
  adminApiKey: z.string().min(1, "Admin API key is required"),
  defaultSettings: z.object({
    status: z.enum(["published", "draft", "scheduled"]).default("draft"),
    visibility: z.enum(["public", "members", "paid"]).default("public"),
  }).default({}),
});

export const mediumConfigSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  defaultSettings: z.object({
    publishStatus: z.enum(["public", "draft", "unlisted"]).default("public"),
    notifyFollowers: z.boolean().default(true),
    contentFormat: z.enum(["html", "markdown"]).default("html"),
  }).default({}),
});

export const instagramConfigSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  userId: z.string().min(1, "User ID is required"),
  expiresAt: z.string().optional(),
  username: z.string().optional(),
  accountType: z.string().optional(),
  defaultSettings: z.object({
    postType: z.enum(["image", "carousel", "reel"]).default("image"),
    shareToFeed: z.boolean().default(true),
  }).default({}),
});
