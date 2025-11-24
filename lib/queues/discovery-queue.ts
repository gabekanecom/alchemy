// BullMQ Discovery Queue
// Handles automated content discovery from multiple sources

import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { prisma } from "@/lib/db/client";
import { RedditDiscovery } from "@/lib/discovery/reddit-client";
import { YouTubeDiscovery } from "@/lib/discovery/youtube-client";
import { TwitterDiscovery } from "@/lib/discovery/twitter-client";
import { SEODiscovery } from "@/lib/discovery/seo-client";
import { QuoraDiscovery } from "@/lib/discovery/quora-client";
import { FirecrawlDiscovery } from "@/lib/discovery/firecrawl-client";
import { analyzeIdeaRelevance } from "@/lib/discovery/ai-analyzer";
import { calculateOverallScore } from "@/lib/discovery/scoring";

// Redis connection for BullMQ
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Discovery Queue
export const discoveryQueue = new Queue("discovery", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
    },
  },
});

interface DiscoveryJobData {
  brandId: string;
  source?: string; // If specified, only run this source
  sources?: string[]; // Or run multiple sources
}

/**
 * Schedule a discovery job
 */
export async function scheduleDiscovery(brandId: string, sources: string[] = ["all"]) {
  await discoveryQueue.add(
    "run-discovery",
    {
      brandId,
      sources,
    },
    {
      jobId: `discovery-${brandId}-${Date.now()}`,
    }
  );
}

/**
 * Discovery Worker
 * Processes discovery jobs in the background
 */
export const discoveryWorker = new Worker<DiscoveryJobData>(
  "discovery",
  async (job: Job<DiscoveryJobData>) => {
    const { brandId, sources = ["all"] } = job.data;

    console.log(`[Discovery Worker] Starting discovery for brand ${brandId}, sources: ${sources.join(", ")}`);

    // Get brand and config
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { discoveryConfig: true },
    });

    if (!brand) {
      throw new Error(`Brand not found: ${brandId}`);
    }

    if (!brand.discoveryConfig) {
      throw new Error(`Discovery config not found for brand: ${brandId}`);
    }

    const config = brand.discoveryConfig;
    const scoringWeights = config.scoringWeights as any;

    // Determine which sources to run
    const sourcesToRun =
      sources.includes("all") ? config.enabledSources : sources.filter((s) => config.enabledSources.includes(s));

    if (sourcesToRun.length === 0) {
      console.log(`[Discovery Worker] No enabled sources for brand ${brandId}`);
      return { totalIdeasFound: 0, totalIdeasSaved: 0 };
    }

    let totalIdeasFound = 0;
    let totalIdeasSaved = 0;

    // Run discovery for each source
    for (const source of sourcesToRun) {
      const run = await prisma.discoveryRun.create({
        data: {
          brandId,
          source,
          status: "running",
          startedAt: new Date(),
        },
      });

      try {
        console.log(`[Discovery Worker] Running ${source} discovery...`);

        let rawIdeas: any[] = [];

        // Execute source-specific discovery
        switch (source) {
          case "reddit": {
            const reddit = new RedditDiscovery();
            const redditConfig = config.redditConfig as any;
            const redditIdeas = await reddit.discoverIdeas(redditConfig);
            rawIdeas = redditIdeas.map((idea) => ({
              source: "reddit",
              sourceId: idea.id,
              sourceUrl: idea.permalink,
              title: idea.title,
              description: idea.selftext || "",
              sourceData: idea,
              viralityScore: reddit.calculateViralityScore(idea),
              competitionScore: 50,
              timelinessScore: 50,
            }));
            break;
          }

          case "youtube": {
            const youtube = new YouTubeDiscovery();
            const youtubeConfig = config.youtubeConfig as any;
            const youtubeIdeas = await youtube.discoverIdeas(youtubeConfig);
            rawIdeas = youtubeIdeas.map((idea) => ({
              source: "youtube",
              sourceId: idea.videoId,
              sourceUrl: idea.url,
              title: idea.title,
              description: idea.description,
              sourceData: idea,
              viralityScore: youtube.calculateViralityScore(idea),
              competitionScore: 50,
              timelinessScore: 50,
            }));
            break;
          }

          case "twitter": {
            const twitter = new TwitterDiscovery();
            const twitterConfig = config.twitterConfig as any;
            const twitterIdeas = await twitter.discoverIdeas(twitterConfig);
            rawIdeas = twitterIdeas.map((idea) => ({
              source: "twitter",
              sourceId: idea.tweetId,
              sourceUrl: idea.url,
              title: idea.text.slice(0, 200),
              description: idea.text,
              sourceData: idea,
              viralityScore: twitter.calculateViralityScore(idea),
              competitionScore: 50,
              timelinessScore: 50,
            }));
            break;
          }

          case "seo": {
            const seo = new SEODiscovery();
            const seoConfig = config.seoConfig as any;
            const keywordData = await seo.discoverKeywords(seoConfig);
            rawIdeas = keywordData.map((data) => ({
              source: "seo",
              sourceId: data.keyword,
              title: `Content opportunity: ${data.keyword}`,
              description: `Search volume: ${data.searchVolume.toLocaleString()}/mo | Difficulty: ${data.difficulty}/100`,
              sourceData: data,
              keywords: [data.keyword, ...data.relatedKeywords.slice(0, 9)],
              seoData: data,
              viralityScore: Math.min((data.searchVolume / 10000) * 100, 100),
              competitionScore: seo.calculateCompetitionScore(data),
              timelinessScore: seo.calculateTimelinessScore(data),
            }));
            break;
          }

          case "quora": {
            const quora = new QuoraDiscovery();
            const quoraConfig = config.quoraConfig as any;
            const quoraIdeas = await quora.discoverIdeas(quoraConfig);
            rawIdeas = quoraIdeas.map((idea) => ({
              source: "quora",
              sourceId: idea.questionId,
              sourceUrl: idea.url,
              title: idea.question,
              description: `${idea.upvotes} upvotes • ${idea.answers} answers`,
              sourceData: idea,
              viralityScore: quora.calculateViralityScore(idea),
              competitionScore: 50,
              timelinessScore: 50,
            }));
            break;
          }

          case "firecrawl": {
            const firecrawl = new FirecrawlDiscovery();
            const firecrawlConfig = config.firecrawlConfig as any;
            const firecrawlIdeas = await firecrawl.discoverIdeas(firecrawlConfig);
            rawIdeas = firecrawlIdeas.map((idea) => ({
              source: "firecrawl",
              sourceId: idea.url,
              sourceUrl: idea.url,
              title: idea.title,
              description: idea.description,
              sourceData: idea,
              keywords: idea.keywords,
              viralityScore: firecrawl.calculateViralityScore(idea),
              competitionScore: 50,
              timelinessScore: 50,
            }));
            break;
          }
        }

        totalIdeasFound += rawIdeas.length;
        console.log(`[Discovery Worker] Found ${rawIdeas.length} ideas from ${source}`);

        // Process each idea
        let ideasSaved = 0;
        let ideasFiltered = 0;

        for (const ideaData of rawIdeas) {
          try {
            // Check for duplicates
            const existing = await prisma.idea.findFirst({
              where: {
                brandId,
                sourceId: ideaData.sourceId,
                source: ideaData.source,
              },
            });

            if (existing) {
              console.log(`[Discovery Worker] Duplicate idea found: ${ideaData.title}`);
              ideasFiltered++;
              continue;
            }

            // AI analysis for relevance
            const analysis = await analyzeIdeaRelevance(ideaData, brand);

            // Calculate overall score
            const overallScore = calculateOverallScore(
              {
                viralityScore: ideaData.viralityScore || 50,
                relevanceScore: analysis.relevanceScore,
                competitionScore: ideaData.competitionScore || 50,
                timelinessScore: ideaData.timelinessScore || 50,
              },
              scoringWeights
            );

            // Filter by minimum score
            if (overallScore < (config.minScore || 50)) {
              console.log(`[Discovery Worker] Idea below minimum score (${overallScore}): ${ideaData.title}`);
              ideasFiltered++;
              continue;
            }

            // Check daily limit
            if (totalIdeasSaved >= (config.maxIdeasPerDay || 50)) {
              console.log(`[Discovery Worker] Daily limit reached: ${config.maxIdeasPerDay}`);
              break;
            }

            // Determine priority
            const priority = overallScore >= 80 ? "urgent" : overallScore >= 65 ? "high" : overallScore >= 50 ? "medium" : "low";

            // Save idea
            await prisma.idea.create({
              data: {
                userId: brand.userId,
                brandId,
                source: ideaData.source,
                sourceId: ideaData.sourceId,
                sourceUrl: ideaData.sourceUrl,
                title: ideaData.title,
                description: ideaData.description,
                keywords: ideaData.keywords || analysis.keywords,
                contentBrief: analysis.contentBrief,
                aiInsights: analysis.aiInsights,
                sourceData: ideaData.sourceData,
                discoveredAt: new Date(),
                category: analysis.category,
                contentType: analysis.contentType,
                targetPlatforms: analysis.targetPlatforms,
                viralityScore: ideaData.viralityScore || 50,
                relevanceScore: analysis.relevanceScore,
                competitionScore: ideaData.competitionScore || 50,
                timelinessScore: ideaData.timelinessScore || 50,
                overallScore,
                priority,
                seoData: ideaData.seoData || null,
                status: "new",
              },
            });

            ideasSaved++;
            totalIdeasSaved++;
            console.log(`[Discovery Worker] Saved idea (score: ${overallScore}): ${ideaData.title}`);
          } catch (error) {
            console.error(`[Discovery Worker] Error processing idea:`, error);
          }
        }

        // Update run status
        await prisma.discoveryRun.update({
          where: { id: run.id },
          data: {
            status: "completed",
            completedAt: new Date(),
            ideasFound: rawIdeas.length,
            ideasSaved,
            ideasFiltered,
          },
        });

        console.log(`[Discovery Worker] ${source} discovery completed: ${ideasSaved} saved, ${ideasFiltered} filtered`);
      } catch (error: any) {
        console.error(`[Discovery Worker] Error in ${source} discovery:`, error);

        // Update run with error
        await prisma.discoveryRun.update({
          where: { id: run.id },
          data: {
            status: "failed",
            completedAt: new Date(),
            errorMessage: error.message,
            errorCount: 1,
          },
        });
      }
    }

    console.log(`[Discovery Worker] Discovery completed for brand ${brandId}: ${totalIdeasSaved} ideas saved`);

    return {
      totalIdeasFound,
      totalIdeasSaved,
    };
  },
  {
    connection,
    concurrency: 2, // Process 2 discovery jobs at a time
  }
);

// Error handling
discoveryWorker.on("failed", (job, err) => {
  console.error(`[Discovery Worker] Job ${job?.id} failed:`, err);
});

discoveryWorker.on("completed", (job, result) => {
  console.log(`[Discovery Worker] Job ${job.id} completed:`, result);
});

console.log("[Discovery Worker] Worker initialized and listening for jobs");
