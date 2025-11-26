import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface IdeaToVet {
  title: string;
  description?: string;
  keywords?: string[];
  sourceUrl?: string;
}

interface VettedIdea extends IdeaToVet {
  viralityScore: number;
  relevanceScore: number;
  competitionScore: number;
  overallScore: number;
  reasoning: string;
  suggestedAngles: string[];
  targetPlatforms: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ideas, autoSave = true, brandId } = body as {
      ideas: IdeaToVet[];
      autoSave?: boolean;
      brandId?: string;
    };

    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json(
        { error: "Ideas array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Limit batch size
    if (ideas.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 ideas per batch" },
        { status: 400 }
      );
    }

    // Get brand context if provided
    let brandContext = "";
    if (brandId) {
      const brand = await prisma.brand.findFirst({
        where: { id: brandId, userId: user.id },
      });

      if (brand) {
        brandContext = `
Brand Context:
- Name: ${brand.name}
- Target Audience: ${JSON.stringify(brand.targetAudience)}
- Content Preferences: ${JSON.stringify(brand.contentPreferences)}
`;
      }
    }

    // Prepare AI vetting prompt
    const prompt = `You are an expert content strategist analyzing content ideas for viral potential.

${brandContext}

Analyze the following content ideas and score each on:
1. Virality Score (0-100): Trending potential, emotional hooks, shareability
2. Relevance Score (0-100): Brand fit, audience alignment, timeliness
3. Competition Score (0-100): Uniqueness, market saturation (higher = less competition)
4. Overall Score (0-100): Weighted average (virality 40%, relevance 30%, competition 30%)

For each idea, also provide:
- Brief reasoning for the scores
- 3-5 suggested angles/hooks to make it more compelling
- Best target platforms (blog, youtube, linkedin, twitter, email)

Ideas to analyze:
${ideas.map((idea, idx) => `
${idx + 1}. Title: ${idea.title}
   Description: ${idea.description || "N/A"}
   Keywords: ${idea.keywords?.join(", ") || "N/A"}
`).join("\n")}

Respond with a JSON array of scored ideas. Each object should have:
{
  "title": string,
  "viralityScore": number,
  "relevanceScore": number,
  "competitionScore": number,
  "overallScore": number,
  "reasoning": string,
  "suggestedAngles": string[],
  "targetPlatforms": string[]
}`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse response
    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response format from Claude");
    }

    // Extract JSON from response (Claude might wrap it in markdown)
    let responseText = content.text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const vettedIdeas: VettedIdea[] = JSON.parse(responseText);

    // Merge with original idea data
    const enrichedIdeas = ideas.map((original, idx) => ({
      ...original,
      ...(vettedIdeas[idx] || {
        viralityScore: 50,
        relevanceScore: 50,
        competitionScore: 50,
        overallScore: 50,
        reasoning: "Unable to score",
        suggestedAngles: [],
        targetPlatforms: ["blog"],
      }),
    }));

    // Sort by overall score (highest first)
    enrichedIdeas.sort((a, b) => b.overallScore - a.overallScore);

    // Auto-save to database if requested
    if (autoSave) {
      await Promise.all(
        enrichedIdeas.map(async (idea) => {
          await prisma.idea.create({
            data: {
              userId: user.id,
              brandId: brandId || null,
              title: idea.title,
              description: idea.description || null,
              source: "manual",
              sourceUrl: idea.sourceUrl || null,
              contentType: "article", // Default
              status: "new",
              priority: idea.overallScore >= 80 ? "high" : idea.overallScore >= 60 ? "medium" : "low",
              targetPlatforms: idea.targetPlatforms,
              keywords: idea.keywords || [],
              viralityScore: idea.viralityScore,
              relevanceScore: idea.relevanceScore,
              competitionScore: idea.competitionScore,
              overallScore: idea.overallScore,
              // @ts-ignore - researchData is a JSON field
              researchData: {
                reasoning: idea.reasoning,
                suggestedAngles: idea.suggestedAngles,
                vettedAt: new Date().toISOString(),
              },
            },
          });
        })
      );
    }

    return NextResponse.json({
      success: true,
      ideas: enrichedIdeas,
      stats: {
        total: enrichedIdeas.length,
        highPriority: enrichedIdeas.filter((i) => i.overallScore >= 80).length,
        mediumPriority: enrichedIdeas.filter((i) => i.overallScore >= 60 && i.overallScore < 80).length,
        lowPriority: enrichedIdeas.filter((i) => i.overallScore < 60).length,
      },
    });
  } catch (error) {
    console.error("Vetting error:", error);
    return NextResponse.json(
      { error: "Failed to vet ideas", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
