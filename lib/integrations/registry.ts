// Integration Provider Registry
// Central registry of all available integration providers

import {
  IntegrationProvider,
  anthropicConfigSchema,
  openaiConfigSchema,
  geminiConfigSchema,
  dalleConfigSchema,
  runwayConfigSchema,
  sanityConfigSchema,
  wordpressConfigSchema,
  linkedinConfigSchema,
  twitterConfigSchema,
  ghostConfigSchema,
  mediumConfigSchema,
  instagramConfigSchema,
} from "./types";

// Provider client classes (to be implemented)
import { AnthropicClient } from "./clients/anthropic";
import { OpenAIClient } from "./clients/openai";
import { GeminiClient } from "./clients/gemini";
import { DALLEClient } from "./clients/dalle";
import { GrokImagineClient } from "./clients/grok-imagine";
import { BananaClient } from "./clients/banana";
import { RunwayClient } from "./clients/runway";
import { SanityClient } from "./clients/sanity";
import { WordPressClient } from "./clients/wordpress";
import { LinkedInClient } from "./clients/linkedin";
import { TwitterClient } from "./clients/twitter";
import { GhostClient } from "./clients/ghost";
import { MediumClient } from "./clients/medium";
import { InstagramClient } from "./clients/instagram";
import { z } from "zod";

/**
 * INTEGRATION_REGISTRY
 *
 * Master registry of all available integration providers.
 * Each provider defines its configuration, capabilities, and pricing.
 */
export const INTEGRATION_REGISTRY: Record<string, IntegrationProvider> = {
  // ============================================
  // AI TEXT GENERATION PROVIDERS
  // ============================================

  anthropic: {
    id: "anthropic",
    category: "ai_provider",
    name: "Claude (Anthropic)",
    description: "Advanced AI for text generation with state-of-the-art reasoning",
    icon: "/integrations/anthropic.svg",
    website: "https://anthropic.com",
    capabilities: ["text_generation", "analysis", "editing"],
    configSchema: anthropicConfigSchema,
    clientClass: AnthropicClient,
    pricing: {
      model: "pay-per-use",
      tiers: [
        {
          name: "Claude Sonnet 4.5",
          input: 3,
          output: 15,
          unit: "per million tokens",
        },
        {
          name: "Claude Opus 4",
          input: 15,
          output: 75,
          unit: "per million tokens",
        },
        {
          name: "Claude Haiku",
          input: 0.25,
          output: 1.25,
          unit: "per million tokens",
        },
      ],
    },
    setupInstructions:
      "1. Visit console.anthropic.com\n2. Navigate to API Keys section\n3. Create a new API key\n4. Copy and paste the key below",
    setupUrl: "https://console.anthropic.com/settings/keys",
  },

  openai: {
    id: "openai",
    category: "ai_provider",
    name: "OpenAI",
    description: "GPT-4 models for versatile text generation and analysis",
    icon: "/integrations/openai.svg",
    website: "https://openai.com",
    capabilities: ["text_generation", "analysis", "editing", "code_generation"],
    configSchema: openaiConfigSchema,
    clientClass: OpenAIClient,
    pricing: {
      model: "pay-per-use",
      tiers: [
        {
          name: "GPT-4o",
          input: 2.5,
          output: 10,
          unit: "per million tokens",
        },
        {
          name: "GPT-4 Turbo",
          input: 10,
          output: 30,
          unit: "per million tokens",
        },
        {
          name: "GPT-4o mini",
          input: 0.15,
          output: 0.6,
          unit: "per million tokens",
        },
      ],
    },
    setupInstructions:
      "1. Visit platform.openai.com/api-keys\n2. Click 'Create new secret key'\n3. Copy the key (you won't see it again)\n4. Paste it below",
    setupUrl: "https://platform.openai.com/api-keys",
  },

  gemini: {
    id: "gemini",
    category: "ai_provider",
    name: "Google Gemini",
    description: "Google's multimodal AI for text generation and analysis",
    icon: "/integrations/google.svg",
    website: "https://ai.google.dev",
    capabilities: ["text_generation", "analysis", "editing"],
    configSchema: geminiConfigSchema,
    clientClass: GeminiClient,
    pricing: {
      model: "pay-per-use",
      tiers: [
        {
          name: "Gemini 1.5 Pro",
          input: 1.25,
          output: 5,
          unit: "per million tokens",
        },
        {
          name: "Gemini 1.5 Flash",
          input: 0.075,
          output: 0.3,
          unit: "per million tokens",
        },
      ],
    },
    setupInstructions:
      "1. Visit aistudio.google.com/app/apikey\n2. Create a new API key\n3. Copy and paste it below",
    setupUrl: "https://aistudio.google.com/app/apikey",
  },

  // ============================================
  // IMAGE GENERATION PROVIDERS
  // ============================================

  dalle: {
    id: "dalle",
    category: "image_generation",
    name: "DALL-E",
    description: "OpenAI's image generation for blog graphics and social media",
    icon: "/integrations/openai.svg",
    website: "https://openai.com",
    capabilities: ["image_generation"],
    configSchema: dalleConfigSchema,
    clientClass: DALLEClient,
    pricing: {
      model: "pay-per-use",
      tiers: [
        {
          name: "DALL-E 3 HD",
          perUnit: 0.12,
          unit: "per image (1024x1024)",
        },
        {
          name: "DALL-E 3 Standard",
          perUnit: 0.04,
          unit: "per image (1024x1024)",
        },
      ],
    },
    setupInstructions: "Use the same API key as OpenAI text generation",
    setupUrl: "https://platform.openai.com/api-keys",
  },

  "grok-imagine": {
    id: "grok-imagine",
    category: "image_generation",
    name: "Grok Imagine",
    description: "X.AI's Grok Imagine for creative image generation",
    icon: "/integrations/xai.svg",
    website: "https://x.ai",
    capabilities: ["image_generation"],
    configSchema: z.object({
      apiKey: z.string().min(1, "API key is required"),
    }),
    clientClass: GrokImagineClient,
    pricing: {
      model: "pay-per-use",
      tiers: [
        {
          name: "Grok Imagine",
          perUnit: 0.05,
          unit: "per image",
        },
      ],
    },
    setupInstructions:
      "1. Visit x.ai or console.x.ai\n2. Generate an API key\n3. Paste it below",
    setupUrl: "https://x.ai",
  },

  banana: {
    id: "banana",
    category: "image_generation",
    name: "Banana (Nano)",
    description: "Fast, affordable image generation with Nano Banana model",
    icon: "/integrations/banana.svg",
    website: "https://banana.dev",
    capabilities: ["image_generation"],
    configSchema: z.object({
      apiKey: z.string().min(1, "API key is required"),
      modelKey: z.string().optional(),
    }),
    clientClass: BananaClient,
    pricing: {
      model: "pay-per-use",
      tiers: [
        {
          name: "Nano Banana",
          perUnit: 0.002,
          unit: "per image",
        },
      ],
    },
    setupInstructions:
      "1. Visit banana.dev\n2. Sign up and create an API key\n3. Deploy nano-banana model\n4. Copy API key and model key",
    setupUrl: "https://banana.dev",
  },

  // ============================================
  // VIDEO GENERATION PROVIDERS
  // ============================================

  runway: {
    id: "runway",
    category: "video_generation",
    name: "Runway Gen-3",
    description: "AI video generation for content and B-roll",
    icon: "/integrations/runway.svg",
    website: "https://runwayml.com",
    capabilities: ["video_generation"],
    configSchema: runwayConfigSchema,
    clientClass: RunwayClient,
    pricing: {
      model: "pay-per-use",
      tiers: [
        {
          name: "Gen-3 Alpha",
          perUnit: 0.05,
          unit: "per second of video",
        },
      ],
    },
    setupInstructions:
      "1. Visit runwayml.com\n2. Sign up for API access\n3. Generate an API key\n4. Paste it below",
    setupUrl: "https://runwayml.com",
  },

  // ============================================
  // CMS PUBLISHING PROVIDERS
  // ============================================

  sanity: {
    id: "sanity",
    category: "publishing",
    name: "Sanity CMS",
    description: "Headless CMS for publishing blog content",
    icon: "/integrations/sanity.svg",
    website: "https://sanity.io",
    capabilities: ["blog_publishing", "media_management"],
    configSchema: sanityConfigSchema,
    clientClass: SanityClient,
    pricing: {
      model: "free",
    },
    setupInstructions:
      "1. Go to sanity.io/manage\n2. Select your project\n3. Navigate to API → Tokens\n4. Create a token with Editor permissions\n5. Copy project ID, dataset, and token below",
    setupUrl: "https://www.sanity.io/manage",
  },

  wordpress: {
    id: "wordpress",
    category: "publishing",
    name: "WordPress",
    description: "Publish content to WordPress sites via REST API",
    icon: "/integrations/wordpress.svg",
    website: "https://wordpress.org",
    capabilities: ["blog_publishing"],
    configSchema: wordpressConfigSchema,
    clientClass: WordPressClient,
    pricing: {
      model: "free",
    },
    setupInstructions:
      "1. Log into your WordPress admin panel\n2. Go to Users → Profile\n3. Scroll down to Application Passwords\n4. Enter a name and click 'Add New Application Password'\n5. Copy the generated password and paste below",
  },

  // ============================================
  // SOCIAL MEDIA PROVIDERS
  // ============================================

  linkedin: {
    id: "linkedin",
    category: "social_media",
    name: "LinkedIn",
    description: "Publish posts to your LinkedIn profile or company page",
    icon: "/integrations/linkedin.svg",
    website: "https://linkedin.com",
    capabilities: ["social_publishing"],
    configSchema: linkedinConfigSchema,
    clientClass: LinkedInClient,
    pricing: {
      model: "free",
    },
    setupInstructions: "Click 'Connect LinkedIn' below to authenticate via OAuth 2.0",
    oauth: {
      authUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      scopes: ["openid", "profile", "w_member_social"],
    },
  },

  twitter: {
    id: "twitter",
    category: "social_media",
    name: "Twitter / X",
    description: "Publish tweets and threads to your Twitter account",
    icon: "/integrations/twitter.svg",
    website: "https://twitter.com",
    capabilities: ["social_publishing"],
    configSchema: twitterConfigSchema,
    clientClass: TwitterClient,
    pricing: {
      model: "free",
    },
    setupInstructions: "Click 'Connect Twitter' below to authenticate via OAuth 2.0",
    oauth: {
      authUrl: "https://twitter.com/i/oauth2/authorize",
      tokenUrl: "https://api.twitter.com/2/oauth2/token",
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    },
  },

  instagram: {
    id: "instagram",
    category: "social_media",
    name: "Instagram",
    description: "Publish images, carousels, and reels to Instagram",
    icon: "/integrations/instagram.svg",
    website: "https://instagram.com",
    capabilities: ["social_publishing"],
    configSchema: instagramConfigSchema,
    clientClass: InstagramClient,
    pricing: {
      model: "free",
    },
    setupInstructions: "Click 'Connect Instagram' below to authenticate via OAuth 2.0",
    oauth: {
      authUrl: "https://api.instagram.com/oauth/authorize",
      tokenUrl: "https://api.instagram.com/oauth/access_token",
      scopes: ["user_profile", "user_media"],
    },
  },

  ghost: {
    id: "ghost",
    category: "publishing",
    name: "Ghost CMS",
    description: "Publish content to your Ghost blog or publication",
    icon: "/integrations/ghost.svg",
    website: "https://ghost.org",
    capabilities: ["blog_publishing"],
    configSchema: ghostConfigSchema,
    clientClass: GhostClient,
    pricing: {
      model: "free",
    },
    setupInstructions:
      "1. Log into your Ghost admin panel\n2. Go to Settings → Integrations\n3. Click 'Add custom integration'\n4. Copy the Admin API Key\n5. Paste your site URL and API key below",
    setupUrl: "https://ghost.org/integrations/custom-integrations/",
  },

  medium: {
    id: "medium",
    category: "publishing",
    name: "Medium",
    description: "Publish stories to your Medium account or publications",
    icon: "/integrations/medium.svg",
    website: "https://medium.com",
    capabilities: ["blog_publishing"],
    configSchema: mediumConfigSchema,
    clientClass: MediumClient,
    pricing: {
      model: "free",
    },
    setupInstructions:
      "1. Go to medium.com/me/settings\n2. Scroll to 'Integration tokens'\n3. Enter a token description and click 'Get integration token'\n4. Copy and paste the token below",
    setupUrl: "https://medium.com/me/settings",
  },
};

/**
 * Get provider definition by ID
 */
export function getProvider(providerId: string): IntegrationProvider | undefined {
  return INTEGRATION_REGISTRY[providerId];
}

/**
 * Get all providers for a specific category
 */
export function getProvidersByCategory(category: string): IntegrationProvider[] {
  return Object.values(INTEGRATION_REGISTRY).filter((p) => p.category === category);
}

/**
 * Get all providers with a specific capability
 */
export function getProvidersByCapability(capability: string): IntegrationProvider[] {
  return Object.values(INTEGRATION_REGISTRY).filter((p) => p.capabilities.includes(capability as any));
}

/**
 * Get all available providers
 */
export function getAllProviders(): IntegrationProvider[] {
  return Object.values(INTEGRATION_REGISTRY);
}

/**
 * Get categorized providers for UI display
 */
export function getCategorizedProviders() {
  const categories = {
    ai_provider: getProvidersByCategory("ai_provider"),
    image_generation: getProvidersByCategory("image_generation"),
    video_generation: getProvidersByCategory("video_generation"),
    publishing: getProvidersByCategory("publishing"),
    social_media: getProvidersByCategory("social_media"),
    analytics: getProvidersByCategory("analytics"),
  };

  return categories;
}
