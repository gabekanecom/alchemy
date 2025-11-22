import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis/client";
import { researchQueue, type ResearchJob } from "@/lib/queues/research-queue";
import { getIdeaById, updateIdea, updateIdeaScores } from "@/lib/db/queries/ideas";
import { generateWithClaude } from "@/lib/ai/claude";

/**
 * Research worker
 * Processes research jobs for ideas
 */
export const researchWorker = new Worker<ResearchJob>(
  "research",
  async (job: Job<ResearchJob>) => {
    const { ideaId, userId, researchType } = job.data;

    console.log(`[Research Worker] Processing job ${job.id} for idea ${ideaId} (${researchType})`);

    try {
      // Fetch idea details
      const idea = await getIdeaById(ideaId, userId);
      if (!idea) {
        throw new Error(`Idea ${ideaId} not found`);
      }

      // Update idea status
      await updateIdea(ideaId, userId, { status: "researching" });

      let researchResults: any = {};

      switch (researchType) {
        case "keywords":
          researchResults = await performKeywordResearch(idea);
          break;
        case "competitors":
          researchResults = await performCompetitorAnalysis(idea);
          break;
        case "trends":
          researchResults = await performTrendAnalysis(idea);
          break;
        case "full":
          // Perform all types of research
          const [keywords, competitors, trends] = await Promise.all([
            performKeywordResearch(idea),
            performCompetitorAnalysis(idea),
            performTrendAnalysis(idea),
          ]);
          researchResults = {
            keywords,
            competitors,
            trends,
          };
          break;
        default:
          throw new Error(`Unknown research type: ${researchType}`);
      }

      // Calculate virality and relevance scores
      const scores = calculateIdeaScores(idea, researchResults);

      // Update idea with research results and scores
      await updateIdea(ideaId, userId, {
        keywords: researchResults.keywords?.keywords || idea.keywords,
        relatedTopics: researchResults.trends?.relatedTopics || idea.relatedTopics,
        targetKeywords: researchResults.keywords?.targetKeywords || idea.targetKeywords,
        competitorUrls: researchResults.competitors?.urls || idea.competitorUrls,
        researchData: researchResults,
        status: "new",
      });

      // Update scores
      await updateIdeaScores(ideaId, scores);

      console.log(`[Research Worker] Completed job ${job.id} - Idea ${ideaId} researched`);

      return {
        success: true,
        ideaId,
        researchResults,
        scores,
      };
    } catch (error: any) {
      console.error(`[Research Worker] Error processing job ${job.id}:`, error);

      // Update idea status back to new
      await updateIdea(ideaId, userId, { status: "new" });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process up to 2 research jobs concurrently
    limiter: {
      max: 5, // Max 5 jobs
      duration: 60000, // per minute
    },
  }
);

/**
 * Perform keyword research using AI
 */
async function performKeywordResearch(idea: any) {
  const systemPrompt = `You are an SEO and keyword research expert. Your task is to identify relevant keywords, search volumes, and difficulty scores for content topics.`;

  const userPrompt = `Topic: ${idea.title}
${idea.description ? `Description: ${idea.description}` : ""}

Please provide:
1. Primary target keywords (5-10)
2. Secondary keywords (10-15)
3. Long-tail keyword opportunities (5-10)
4. Related search queries

Format your response as JSON:
{
  "targetKeywords": ["keyword1", "keyword2", ...],
  "secondaryKeywords": ["keyword1", "keyword2", ...],
  "longTailKeywords": ["phrase1", "phrase2", ...],
  "relatedQueries": ["query1", "query2", ...]
}`;

  const result = await generateWithClaude({
    systemPrompt,
    userPrompt,
    maxTokens: 2000,
  });

  try {
    // Extract JSON from response
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const keywords = JSON.parse(jsonMatch[0]);
      return {
        keywords: [
          ...(keywords.targetKeywords || []),
          ...(keywords.secondaryKeywords || []),
        ].slice(0, 20),
        targetKeywords: keywords.targetKeywords || [],
        longTailKeywords: keywords.longTailKeywords || [],
        relatedQueries: keywords.relatedQueries || [],
      };
    }
  } catch (err) {
    console.error("[Research Worker] Failed to parse keyword research:", err);
  }

  return {
    keywords: [],
    targetKeywords: [],
    longTailKeywords: [],
    relatedQueries: [],
  };
}

/**
 * Perform competitor analysis using AI
 */
async function performCompetitorAnalysis(idea: any) {
  const systemPrompt = `You are a competitive analysis expert. Your task is to identify key competitors and content gaps for a given topic.`;

  const userPrompt = `Topic: ${idea.title}
${idea.description ? `Description: ${idea.description}` : ""}
${idea.sourceUrl ? `Source: ${idea.sourceUrl}` : ""}

Please analyze:
1. Who are the main competitors/publishers in this space?
2. What content gaps exist?
3. What unique angles can we take?
4. What is the competition level (low/medium/high)?

Format your response as JSON:
{
  "competitors": ["competitor1", "competitor2", ...],
  "contentGaps": ["gap1", "gap2", ...],
  "uniqueAngles": ["angle1", "angle2", ...],
  "competitionLevel": "low|medium|high"
}`;

  const result = await generateWithClaude({
    systemPrompt,
    userPrompt,
    maxTokens: 2000,
  });

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        competitors: analysis.competitors || [],
        contentGaps: analysis.contentGaps || [],
        uniqueAngles: analysis.uniqueAngles || [],
        competitionLevel: analysis.competitionLevel || "medium",
        urls: [], // Placeholder for actual competitor URLs
      };
    }
  } catch (err) {
    console.error("[Research Worker] Failed to parse competitor analysis:", err);
  }

  return {
    competitors: [],
    contentGaps: [],
    uniqueAngles: [],
    competitionLevel: "medium",
    urls: [],
  };
}

/**
 * Perform trend analysis using AI
 */
async function performTrendAnalysis(idea: any) {
  const systemPrompt = `You are a trend analysis expert. Your task is to assess the timeliness, trend trajectory, and viral potential of content topics.`;

  const userPrompt = `Topic: ${idea.title}
${idea.description ? `Description: ${idea.description}` : ""}
Source: ${idea.source}
${idea.sourceUrl ? `URL: ${idea.sourceUrl}` : ""}

Please analyze:
1. Is this topic trending up, stable, or declining?
2. What is the estimated viral potential (0-100)?
3. What related trending topics should we consider?
4. What is the optimal timing for publishing content on this topic?

Format your response as JSON:
{
  "trendDirection": "rising|stable|declining",
  "viralPotential": 0-100,
  "relatedTopics": ["topic1", "topic2", ...],
  "optimalTiming": "immediate|this_week|this_month|evergreen",
  "trendingScore": 0-100
}`;

  const result = await generateWithClaude({
    systemPrompt,
    userPrompt,
    maxTokens: 2000,
  });

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const trends = JSON.parse(jsonMatch[0]);
      return {
        trendDirection: trends.trendDirection || "stable",
        viralPotential: trends.viralPotential || 50,
        relatedTopics: trends.relatedTopics || [],
        optimalTiming: trends.optimalTiming || "evergreen",
        trendingScore: trends.trendingScore || 50,
      };
    }
  } catch (err) {
    console.error("[Research Worker] Failed to parse trend analysis:", err);
  }

  return {
    trendDirection: "stable",
    viralPotential: 50,
    relatedTopics: [],
    optimalTiming: "evergreen",
    trendingScore: 50,
  };
}

/**
 * Calculate virality, relevance, and competition scores
 */
function calculateIdeaScores(idea: any, researchResults: any) {
  let viralityScore = idea.viralityScore || 50;
  let relevanceScore = idea.relevanceScore || 50;
  let competitionScore = idea.competitionScore || 50;

  // Update virality score from trend analysis
  if (researchResults.trends) {
    viralityScore = researchResults.trends.viralPotential || viralityScore;
  }

  // Update relevance score based on keywords and gaps
  if (researchResults.keywords) {
    const hasTargetKeywords = researchResults.keywords.targetKeywords?.length > 0;
    const hasLongTail = researchResults.keywords.longTailKeywords?.length > 0;
    if (hasTargetKeywords && hasLongTail) {
      relevanceScore = Math.min(100, relevanceScore + 20);
    } else if (hasTargetKeywords) {
      relevanceScore = Math.min(100, relevanceScore + 10);
    }
  }

  // Update competition score
  if (researchResults.competitors) {
    const level = researchResults.competitors.competitionLevel;
    if (level === "low") {
      competitionScore = 80;
    } else if (level === "medium") {
      competitionScore = 50;
    } else if (level === "high") {
      competitionScore = 20;
    }
  }

  return {
    viralityScore,
    relevanceScore,
    competitionScore,
  };
}

// Event handlers
researchWorker.on("completed", (job) => {
  console.log(`[Research Worker] Job ${job.id} completed successfully`);
});

researchWorker.on("failed", (job, err) => {
  console.error(`[Research Worker] Job ${job?.id} failed:`, err.message);
});

researchWorker.on("error", (err) => {
  console.error("[Research Worker] Worker error:", err);
});

console.log("[Research Worker] Worker started and waiting for jobs...");
