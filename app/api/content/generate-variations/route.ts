import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db";
import { integrationManager } from "@/lib/integrations/manager";

interface Variation {
  id: string;
  type: "headline" | "hook" | "cta" | "full-content";
  content: string;
  framework: string;
  viralScore?: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      contentId,
      variationType = "headline",
      numberOfVariations = 5,
      originalContent,
      platform,
      contentType,
    } = body as {
      contentId?: string;
      variationType: "headline" | "hook" | "cta" | "full-content";
      numberOfVariations?: number;
      originalContent?: string;
      platform: string;
      contentType: string;
    };

    // Fetch original content if contentId provided
    let content = originalContent;
    if (contentId) {
      const generatedContent = await prisma.generatedContent.findFirst({
        where: {
          id: contentId,
          userId: user.id,
        },
      });

      if (!generatedContent) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
      }

      content = generatedContent.body;
    }

    if (!content) {
      return NextResponse.json(
        { error: "Either contentId or originalContent must be provided" },
        { status: 400 }
      );
    }

    // Generate variations based on type
    const variations = await generateVariations({
      content,
      variationType,
      numberOfVariations,
      platform,
      contentType,
      userId: user.id,
    });

    // Save variations to database if contentId provided
    if (contentId) {
      await Promise.all(
        variations.map(async (variation) => {
          await prisma.contentVariation.create({
            data: {
              contentId,
              userId: user.id,
              type: variation.type,
              content: variation.content,
              framework: variation.framework,
              metadata: {
                reasoning: variation.reasoning,
                predictedViralScore: variation.viralScore,
              },
              status: "testing",
            },
          });
        })
      );
    }

    return NextResponse.json({
      success: true,
      variations,
      message: `Generated ${variations.length} ${variationType} variations`,
    });
  } catch (error) {
    console.error("Variation generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate variations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function generateVariations(config: {
  content: string;
  variationType: string;
  numberOfVariations: number;
  platform: string;
  contentType: string;
  userId: string;
}): Promise<Variation[]> {
  const { content, variationType, numberOfVariations, platform, contentType, userId } = config;

  const variationPrompts: Record<string, string> = {
    headline: `Generate ${numberOfVariations} headline variations for this ${contentType} on ${platform}.

ORIGINAL CONTENT:
${content.substring(0, 500)}...

Generate ${numberOfVariations} different headlines using these frameworks:
1. Number-driven (e.g., "7 Ways to...")
2. Question-based (e.g., "Are You Making These Mistakes?")
3. Curiosity gap (e.g., "The Secret That...")
4. Fear/loss aversion (e.g., "Stop Losing...")
5. Social proof (e.g., "How [Authority] Achieves...")

Each headline must:
- Pass the 4 U's test (Useful, Urgent, Unique, Ultra-specific)
- Be under 100 characters
- Create strong curiosity
- Be platform-appropriate for ${platform}

Respond with JSON array:
[
  {
    "id": "1",
    "type": "headline",
    "content": "the headline text",
    "framework": "framework name",
    "viralScore": estimated_score,
    "reasoning": "why this headline will perform well"
  }
]`,

    hook: `Generate ${numberOfVariations} opening hook variations for this ${contentType} on ${platform}.

ORIGINAL CONTENT:
${content.substring(0, 1000)}

Generate ${numberOfVariations} different opening hooks (first 1-3 sentences) using these frameworks:
1. Pattern interrupt (break expectations)
2. Curiosity gap (create knowledge gap)
3. Social proof (leverage authority)
4. Controversy (polarizing take)
5. Transformation (before/after)

Each hook must:
- Stop the scroll in 1 second
- Create immediate intrigue
- Match ${platform} style
- Lead naturally into the content

Respond with JSON array:
[
  {
    "id": "1",
    "type": "hook",
    "content": "the hook text",
    "framework": "framework name",
    "viralScore": estimated_score,
    "reasoning": "why this hook will perform well"
  }
]`,

    cta: `Generate ${numberOfVariations} call-to-action variations for this ${contentType} on ${platform}.

ORIGINAL CONTENT:
${content}

Generate ${numberOfVariations} different CTAs using these approaches:
1. Soft ask (question format)
2. Direct ask (command format)
3. Value-based (promise format)
4. Social (engagement format)
5. Urgency-based (time-sensitive)

Each CTA must:
- Be platform-appropriate for ${platform}
- Match the content's tone
- Create clear next action
- Maximize engagement

Respond with JSON array:
[
  {
    "id": "1",
    "type": "cta",
    "content": "the cta text",
    "framework": "framework name",
    "viralScore": estimated_score,
    "reasoning": "why this CTA will perform well"
  }
]`,

    "full-content": `Generate ${numberOfVariations} full content variations for this ${platform} ${contentType}.

ORIGINAL CONCEPT:
${content.substring(0, 500)}

Generate ${numberOfVariations} complete variations using different:
- Storytelling frameworks (Hero's Journey, SCQA, BAB, PAS)
- Emotional angles (awe, joy, surprise, validation)
- Tones (inspirational, educational, entertaining, provocative)

Each variation must:
- Maintain core value proposition
- Use different viral framework
- Be optimized for ${platform}
- Target different emotional trigger

Respond with JSON array:
[
  {
    "id": "1",
    "type": "full-content",
    "content": "the complete content",
    "framework": "framework combination used",
    "viralScore": estimated_score,
    "reasoning": "why this variation will perform well"
  }
]`,
  };

  const prompt = variationPrompts[variationType];

  // Use Integration Manager to get AI provider
  let responseText: string;

  const integration = await integrationManager.getIntegrationFor(userId, "text_generation");

  if (integration) {
    const client = integrationManager.getClient(integration);
    const response = await client.generateText(prompt, {
      temperature: 0.8, // Higher temperature for creative variations
      maxTokens: variationType === "full-content" ? 16000 : 4000,
    });

    responseText = response.text;

    // Track usage
    await integrationManager.trackUsage(
      integration.id,
      "text_generation",
      response.usage.totalTokens || 0,
      { success: true, metadata: { variationType } }
    );
  } else {
    // Fallback to env API key
    const Anthropic = require("@anthropic-ai/sdk").default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: variationType === "full-content" ? 16000 : 4000,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response format");
    responseText = content.text;
  }

  // Extract JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    responseText = jsonMatch[0];
  }

  const variations: Variation[] = JSON.parse(responseText);

  return variations;
}
