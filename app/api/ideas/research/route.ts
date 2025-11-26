import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ResearchResult {
  trendingAngles: string[];
  competitorInsights: {
    topPerformingContent: string[];
    contentGaps: string[];
    uniqueApproaches: string[];
  };
  keyStatistics: {
    stat: string;
    source: string;
  }[];
  expertQuotes: {
    quote: string;
    author: string;
    source: string;
  }[];
  recommendedStructure: {
    sections: string[];
    estimatedLength: number;
    contentFormat: string;
  };
  seoKeywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
  targetAudiencePainPoints: string[];
  callToActionSuggestions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ideaId, depth = "standard" } = body as {
      ideaId: string;
      depth?: "quick" | "standard" | "deep";
    };

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    // Fetch idea from database
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        userId: user.id,
      },
      include: {
        brand: true,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    // Update status to researching
    await prisma.idea.update({
      where: { id: ideaId },
      data: { status: "researching" },
    });

    // Prepare research prompt
    const researchPrompt = `You are an expert content researcher. Research the following content idea in depth.

Content Idea:
Title: ${idea.title}
Description: ${idea.description || "N/A"}
Keywords: ${idea.keywords?.join(", ") || "N/A"}
Target Platforms: ${idea.targetPlatforms?.join(", ") || "N/A"}

${idea.brand ? `
Brand Context:
- Name: ${idea.brand.name}
- Target Audience: ${JSON.stringify(idea.brand.targetAudience)}
` : ""}

Research Depth: ${depth}

Provide comprehensive research data to help create exceptional content:

1. TRENDING ANGLES (5-7 angles)
   - Current hot takes and perspectives on this topic
   - Unique angles that haven't been overdone
   - Controversial or thought-provoking approaches

2. COMPETITOR INSIGHTS
   - Top 3-5 performing content pieces on this topic (infer from trends)
   - Content gaps: What hasn't been covered well?
   - Unique approaches to stand out

3. KEY STATISTICS (8-12 stats with sources)
   - Recent data points and statistics
   - Industry trends and numbers
   - Research findings that support the topic

4. EXPERT QUOTES (3-5 quotes)
   - Thought leader perspectives (can be from known experts in the field)
   - Industry insights
   - Authoritative voices

5. RECOMMENDED STRUCTURE
   - Suggested sections/outline
   - Estimated content length (words/minutes)
   - Best format (long-form article, listicle, how-to, case study, etc.)

6. SEO KEYWORDS
   - Primary keywords (3-5)
   - Secondary keywords (5-8)
   - Long-tail keywords (8-12)

7. TARGET AUDIENCE PAIN POINTS (5-8 pain points)
   - What problems does the audience face related to this topic?
   - What questions are they asking?
   - What outcomes do they want?

8. CALL TO ACTION SUGGESTIONS (3-5 CTAs)
   - What actions should readers take?
   - How to engage further?
   - Next steps for the audience

Respond with a JSON object matching this structure:
{
  "trendingAngles": string[],
  "competitorInsights": {
    "topPerformingContent": string[],
    "contentGaps": string[],
    "uniqueApproaches": string[]
  },
  "keyStatistics": [{ "stat": string, "source": string }],
  "expertQuotes": [{ "quote": string, "author": string, "source": string }],
  "recommendedStructure": {
    "sections": string[],
    "estimatedLength": number,
    "contentFormat": string
  },
  "seoKeywords": {
    "primary": string[],
    "secondary": string[],
    "longTail": string[]
  },
  "targetAudiencePainPoints": string[],
  "callToActionSuggestions": string[]
}`;

    // Determine max tokens based on depth
    const maxTokens = {
      quick: 3000,
      standard: 6000,
      deep: 12000,
    }[depth];

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: researchPrompt,
        },
      ],
    });

    // Parse response
    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response format from Claude");
    }

    // Extract JSON from response
    let responseText = content.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const researchData: ResearchResult = JSON.parse(responseText);

    // Update idea with research data
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        status: "queued", // Ready for content generation
        // @ts-ignore - researchData is a JSON field
        researchData: {
          ...((idea as any).researchData as object || {}),
          ...researchData,
          researchedAt: new Date().toISOString(),
          researchDepth: depth,
        },
        // Update keywords if we found better ones
        keywords: [
          ...(idea.keywords || []),
          ...researchData.seoKeywords.primary,
          ...researchData.seoKeywords.secondary,
        ].filter((k, i, arr) => arr.indexOf(k) === i), // Deduplicate
      },
    });

    return NextResponse.json({
      success: true,
      ideaId,
      researchData,
      message: "Research completed successfully",
    });
  } catch (error) {
    console.error("Research error:", error);

    // Update idea status to failed if there's an error
    try {
      const body = await request.json();
      if (body.ideaId) {
        await prisma.idea.update({
          where: { id: body.ideaId },
          data: { status: "new" }, // Reset to new status
        });
      }
    } catch (e) {
      // Ignore errors updating status
    }

    return NextResponse.json(
      {
        error: "Failed to research idea",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
