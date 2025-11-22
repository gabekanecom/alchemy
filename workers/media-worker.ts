import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis/client";
import { mediaQueue, type MediaGenerationJob } from "@/lib/queues/media-queue";
import { createMedia, updateMediaStatus } from "@/lib/db/queries/media";
import { generateImage } from "@/lib/ai/openai";

/**
 * Media generation worker
 * Processes media generation jobs (images, thumbnails, etc.)
 */
export const mediaWorker = new Worker<MediaGenerationJob>(
  "media-generation",
  async (job: Job<MediaGenerationJob>) => {
    const { userId, brandId, contentId, mediaType, prompt, config } = job.data;

    console.log(`[Media Worker] Processing job ${job.id} - ${mediaType} generation`);

    try {
      if (mediaType === "image") {
        return await generateImageMedia(job.data);
      } else if (mediaType === "thumbnail") {
        return await generateThumbnail(job.data);
      } else {
        throw new Error(`Unsupported media type: ${mediaType}`);
      }
    } catch (error: any) {
      console.error(`[Media Worker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process up to 2 media jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // per minute
    },
  }
);

/**
 * Generate image using DALL-E
 */
async function generateImageMedia(data: MediaGenerationJob) {
  const { userId, brandId, contentId, prompt, config } = data;

  console.log(`[Media Worker] Generating image: "${prompt}"`);

  // Generate image using OpenAI DALL-E
  const result = await generateImage({
    prompt,
    size: config?.size || "1024x1024",
    quality: config?.quality || "standard",
    style: config?.style || "vivid",
  });

  // Create media record
  const media = await createMedia(userId, {
    brandId,
    contentId,
    type: "image",
    url: result.url,
    filename: `generated-${Date.now()}.png`,
    mimeType: "image/png",
    fileSize: 0, // Placeholder - would need to fetch actual size
    width: parseInt(config?.size?.split("x")[0] || "1024"),
    height: parseInt(config?.size?.split("x")[1] || "1024"),
    altText: prompt.substring(0, 200),
    metadata: {
      prompt,
      model: "dall-e-3",
      revisedPrompt: result.revisedPrompt,
      generatedAt: new Date().toISOString(),
    },
  });

  console.log(`[Media Worker] Image generated successfully - Media ID: ${media.id}`);

  return {
    success: true,
    mediaId: media.id,
    url: result.url,
  };
}

/**
 * Generate thumbnail from content
 */
async function generateThumbnail(data: MediaGenerationJob) {
  const { userId, brandId, contentId, prompt, config } = data;

  console.log(`[Media Worker] Generating thumbnail: "${prompt}"`);

  // Generate smaller image for thumbnail
  const result = await generateImage({
    prompt: `Create a thumbnail image: ${prompt}`,
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  });

  // Create media record
  const media = await createMedia(userId, {
    brandId,
    contentId,
    type: "image",
    url: result.url,
    thumbnailUrl: result.url, // In real scenario, would resize
    filename: `thumbnail-${Date.now()}.png`,
    mimeType: "image/png",
    fileSize: 0,
    width: 1024,
    height: 1024,
    altText: `Thumbnail: ${prompt.substring(0, 150)}`,
    metadata: {
      prompt,
      model: "dall-e-3",
      type: "thumbnail",
      revisedPrompt: result.revisedPrompt,
      generatedAt: new Date().toISOString(),
    },
  });

  console.log(`[Media Worker] Thumbnail generated successfully - Media ID: ${media.id}`);

  return {
    success: true,
    mediaId: media.id,
    url: result.url,
  };
}

// Event handlers
mediaWorker.on("completed", (job) => {
  console.log(`[Media Worker] Job ${job.id} completed successfully`);
});

mediaWorker.on("failed", (job, err) => {
  console.error(`[Media Worker] Job ${job?.id} failed:`, err.message);
});

mediaWorker.on("error", (err) => {
  console.error("[Media Worker] Worker error:", err);
});

console.log("[Media Worker] Worker started and waiting for jobs...");
