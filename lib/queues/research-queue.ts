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
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 500,
    },
  },
};

export interface ResearchJob {
  userId: string;
  brandId?: string;
  source: "reddit" | "youtube" | "twitter" | "firecrawl";
  query: string;
  filters?: Record<string, any>;
}

export const researchQueue = new Queue<ResearchJob>(
  "research",
  queueOptions
);

console.log("✅ Research queue initialized");

export default researchQueue;
