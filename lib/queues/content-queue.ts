import { Queue, QueueOptions } from "bullmq";
import redis from "@/lib/redis/client";

const queueOptions: QueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
    },
  },
};

export interface ContentGenerationJob {
  queueId: string;
  userId: string;
  brandId?: string;
  ideaId?: string;
  platform: string;
  contentType: string;
  generationConfig?: Record<string, any>;
  brief?: Record<string, any>;
}

export const contentQueue = new Queue<ContentGenerationJob>(
  "content-generation",
  queueOptions
);

console.log("✅ Content generation queue initialized");

export default contentQueue;
