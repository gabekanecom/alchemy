import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/utils";
import { scheduleDiscovery } from "@/lib/queues/discovery-queue";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/discovery/scoring";

/**
 * POST /api/discovery/run
 * Schedules a discovery job in the background queue
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { brandId, source, sources } = body;

  if (!brandId) {
    return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
  }

  // Verify brand ownership
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      userId: user.id,
    },
    include: {
      discoveryConfig: true,
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Create or get discovery config with defaults
  let config = brand.discoveryConfig;
  if (!config) {
    config = await prisma.discoveryConfig.create({
      data: {
        brandId,
        enabledSources: ["reddit", "youtube", "twitter", "seo", "quora", "firecrawl"],
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
        excludeKeywords: [],
        minScore: 50,
        maxIdeasPerDay: 50,
        redditConfig: {
          subreddits: ["entrepreneur", "marketing", "startups"],
          sortBy: "hot",
          limit: 10,
          minUpvotes: 100,
        },
        youtubeConfig: {
          keywords: ["marketing", "content creation", "entrepreneurship"],
          maxResults: 10,
          minViews: 10000,
        },
        twitterConfig: {
          keywords: ["marketing", "content", "viral"],
          maxResults: 20,
          minLikes: 100,
        },
        seoConfig: {
          targetKeywords: ["content marketing", "viral content", "social media strategy"],
        },
        quoraConfig: {
          topics: ["marketing", "content creation"],
          keywords: ["viral content", "social media", "content marketing"],
          maxResults: 10,
          minUpvotes: 50,
        },
        firecrawlConfig: {
          urls: [
            "https://www.hubspot.com/blog",
            "https://neilpatel.com/blog",
            "https://backlinko.com/blog",
          ],
          maxResults: 5,
          includeSubpages: false,
        },
      },
    });
  }

  try {
    // Determine which sources to run
    let sourcesToRun: string[] = [];
    if (sources && Array.isArray(sources)) {
      sourcesToRun = sources;
    } else if (source) {
      sourcesToRun = [source];
    } else {
      sourcesToRun = ["all"];
    }

    // Schedule discovery job in the background
    await scheduleDiscovery(brandId, sourcesToRun);

    return NextResponse.json({
      success: true,
      message: "Discovery job scheduled successfully",
      sources: sourcesToRun,
    });
  } catch (error) {
    console.error("Failed to schedule discovery:", error);

    return NextResponse.json(
      {
        error: "Failed to schedule discovery",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
