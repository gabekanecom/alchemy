import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis/client";
import { contentQueue, type ContentGenerationJob } from "@/lib/queues/content-queue";
import {
  getContentQueueById,
  updateContentQueue,
  createGeneratedContent,
} from "@/lib/db/queries/content";
import { getBrandById } from "@/lib/db/queries/brands";
import { getIdeaById } from "@/lib/db/queries/ideas";
import { generateWithClaude } from "@/lib/ai/claude";
import { generateWithGPT } from "@/lib/ai/openai";
import type { BrandResponse } from "@/types/brand";
import type { IdeaResponse } from "@/types/idea";

/**
 * Content generation worker
 * Processes jobs from the content generation queue
 */
export const contentWorker = new Worker<ContentGenerationJob>(
  "content-generation",
  async (job: Job<ContentGenerationJob>) => {
    const { queueId, userId, brandId, platform, contentType, generationConfig } = job.data;

    console.log(`[Content Worker] Processing job ${job.id} for queue ${queueId}`);

    try {
      // Update queue status to processing
      await updateContentQueue(queueId, userId, {
        status: "processing",
        progress: 10,
      });

      // Fetch queue details
      const queue = await getContentQueueById(queueId, userId);
      if (!queue) {
        throw new Error(`Queue entry ${queueId} not found`);
      }

      // Fetch brand details if available
      let brand: BrandResponse | null = null;
      if (brandId) {
        brand = await getBrandById(brandId, userId);
        await updateContentQueue(queueId, userId, { progress: 20 });
      }

      // Fetch idea details if available
      let idea: IdeaResponse | null = null;
      if (queue.ideaId) {
        idea = await getIdeaById(queue.ideaId, userId);
        await updateContentQueue(queueId, userId, { progress: 30 });
      }

      // Build system prompt
      const systemPrompt = buildSystemPrompt(brand, contentType, platform);

      // Build user prompt
      const userPrompt = buildUserPrompt(queue, idea, brand);

      await updateContentQueue(queueId, userId, { progress: 40 });

      // Generate content using AI
      const aiModel = generationConfig?.aiModel || "claude-sonnet-4-20250514";
      let generatedText: string;
      let aiMetadata: any;

      if (aiModel.startsWith("claude")) {
        const result = await generateWithClaude({
          systemPrompt,
          userPrompt,
          model: aiModel,
          temperature: generationConfig?.temperature || 1.0,
          maxTokens: generationConfig?.maxTokens || 4096,
        });
        generatedText = result.content;
        aiMetadata = {
          model: result.model,
          usage: result.usage,
        };
      } else {
        const result = await generateWithGPT({
          systemPrompt,
          userPrompt,
          model: aiModel,
          temperature: generationConfig?.temperature || 1.0,
          maxTokens: generationConfig?.maxTokens || 4096,
        });
        generatedText = result.content;
        aiMetadata = {
          model: result.model,
          usage: result.usage,
        };
      }

      await updateContentQueue(queueId, userId, { progress: 70 });

      // Parse generated content
      const parsedContent = parseGeneratedContent(generatedText, contentType);

      await updateContentQueue(queueId, userId, { progress: 80 });

      // Calculate quality scores
      const scores = calculateQualityScores(parsedContent, contentType);

      // Save generated content to database
      const content = await createGeneratedContent(userId, brandId || null, {
        queueId,
        contentType,
        platform,
        title: parsedContent.title,
        body: parsedContent.body,
        excerpt: parsedContent.excerpt,
        metadata: {
          ...parsedContent.metadata,
          generationConfig,
        },
        seoData: parsedContent.seoData,
        mediaAssets: parsedContent.mediaAssets,
        aiMetadata,
      });

      // Update content with scores
      await updateContentQueue(queueId, userId, { progress: 90 });

      // Mark queue as completed
      await updateContentQueue(queueId, userId, {
        status: "completed",
        progress: 100,
      });

      console.log(`[Content Worker] Completed job ${job.id} - Content ID: ${content.id}`);

      return {
        success: true,
        contentId: content.id,
        queueId,
      };
    } catch (error: any) {
      console.error(`[Content Worker] Error processing job ${job.id}:`, error);

      // Mark queue as failed
      await updateContentQueue(queueId, userId, {
        status: "failed",
        errorMessage: error.message,
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3, // Process up to 3 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // per minute
    },
  }
);

/**
 * Build system prompt based on brand voice and content type
 */
function buildSystemPrompt(
  brand: BrandResponse | null,
  contentType: string,
  platform: string
): string {
  let prompt = `You are an expert content creator specializing in ${contentType} for ${platform}.`;

  if (brand?.brandVoice) {
    const voice = brand.brandVoice as any;
    prompt += `\n\nBrand Voice Guidelines:
- Tone: ${voice.tone}
- Formality: ${voice.formality}
- Writing Style: ${voice.writingStyle}`;

    if (voice.personality?.length > 0) {
      prompt += `\n- Personality Traits: ${voice.personality.join(", ")}`;
    }

    if (voice.vocabulary?.preferred?.length > 0) {
      prompt += `\n- Preferred Vocabulary: ${voice.vocabulary.preferred.join(", ")}`;
    }

    if (voice.vocabulary?.avoid?.length > 0) {
      prompt += `\n- Avoid These Words: ${voice.vocabulary.avoid.join(", ")}`;
    }
  }

  if (brand?.targetAudience) {
    const audience = brand.targetAudience as any;
    prompt += `\n\nTarget Audience:
- Demographics: ${audience.demographics?.ageRange || "General"}, ${audience.demographics?.gender || "All"}
- Expertise Level: ${audience.expertiseLevel}
- Primary Pain Points: ${audience.painPoints?.join(", ") || "N/A"}`;
  }

  prompt += `\n\nYour task is to create high-quality, engaging ${contentType} that resonates with the target audience while maintaining the brand voice.`;

  return prompt;
}

/**
 * Build user prompt with content requirements
 */
function buildUserPrompt(
  queue: any,
  idea: IdeaResponse | null,
  brand: BrandResponse | null
): string {
  let prompt = "";

  if (idea) {
    prompt += `Topic: ${idea.title}\n`;
    if (idea.description) {
      prompt += `Description: ${idea.description}\n`;
    }
    if (idea.keywords?.length > 0) {
      prompt += `Keywords: ${idea.keywords.join(", ")}\n`;
    }
  }

  if (queue.brief) {
    const brief = queue.brief as any;
    if (brief.outline?.length > 0) {
      prompt += `\nOutline:\n${brief.outline.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}\n`;
    }
    if (brief.keyPoints?.length > 0) {
      prompt += `\nKey Points to Cover:\n${brief.keyPoints.map((point: string) => `- ${point}`).join("\n")}\n`;
    }
    if (brief.targetWordCount) {
      prompt += `\nTarget Word Count: ${brief.targetWordCount}\n`;
    }
  }

  if (brand?.contentPreferences) {
    const prefs = brand.contentPreferences as any;
    if (prefs.callToAction) {
      prompt += `\nCall to Action: ${prefs.callToAction}\n`;
    }
  }

  prompt += `\nPlease generate the content in the following format:
---
TITLE: [Engaging title here]
---
EXCERPT: [Brief summary/meta description, 150-160 characters]
---
BODY:
[Main content here]
---`;

  return prompt;
}

/**
 * Parse generated content from AI response
 */
function parseGeneratedContent(text: string, contentType: string) {
  const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|---)/i);
  const excerptMatch = text.match(/EXCERPT:\s*(.+?)(?:\n|---)/i);
  const bodyMatch = text.match(/BODY:\s*(.+?)(?:---|\n---|\Z)/is);

  const title = titleMatch?.[1]?.trim() || `Untitled ${contentType}`;
  const excerpt = excerptMatch?.[1]?.trim() || null;
  const body = bodyMatch?.[1]?.trim() || text;

  return {
    title,
    excerpt,
    body,
    metadata: {
      wordCount: body.split(/\s+/).length,
      characterCount: body.length,
      generatedAt: new Date().toISOString(),
    },
    seoData: {},
    mediaAssets: [],
  };
}

/**
 * Calculate quality scores for generated content
 */
function calculateQualityScores(content: any, contentType: string) {
  // Simple scoring algorithm (can be enhanced later)
  const wordCount = content.metadata.wordCount;
  const hasTitle = content.title && content.title !== `Untitled ${contentType}`;
  const hasExcerpt = !!content.excerpt;

  let qualityScore = 50;

  // Word count scoring
  if (wordCount >= 300 && wordCount <= 2000) {
    qualityScore += 20;
  } else if (wordCount >= 200) {
    qualityScore += 10;
  }

  // Structure scoring
  if (hasTitle) qualityScore += 15;
  if (hasExcerpt) qualityScore += 15;

  // Readability (basic check for sentence structure)
  const sentences = content.body.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / sentences.length;
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
    qualityScore += 10;
  }

  return {
    qualityScore: Math.min(100, qualityScore),
    readabilityScore: 75, // Placeholder
    seoScore: 70, // Placeholder
  };
}

// Event handlers
contentWorker.on("completed", (job) => {
  console.log(`[Content Worker] Job ${job.id} completed successfully`);
});

contentWorker.on("failed", (job, err) => {
  console.error(`[Content Worker] Job ${job?.id} failed:`, err.message);
});

contentWorker.on("error", (err) => {
  console.error("[Content Worker] Worker error:", err);
});

console.log("[Content Worker] Worker started and waiting for jobs...");
