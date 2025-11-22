import { Queue, QueueOptions } from "bullmq";
import redis from "@/lib/redis/client";

const queueOptions: QueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 2, // Media generation can be expensive, fewer retries
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: {
      count: 50,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 200,
    },
  },
};

export interface MediaGenerationJob {
  userId: string;
  brandId?: string;
  type: "image" | "video" | "audio";
  generator: "dalle" | "stability" | "elevenlabs" | "heygen";
  prompt: string;
  config?: Record<string, any>;
}

export const mediaQueue = new Queue<MediaGenerationJob>(
  "media-generation",
  queueOptions
);

console.log("✅ Media generation queue initialized");

export default mediaQueue;
