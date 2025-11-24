import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db";
import { integrationManager } from "@/lib/integrations/manager";
import { buildViralSystemPrompt, buildUserPrompt } from "@/lib/ai/viral-prompts";

interface RepurposeConfig {
  sourceContent: string;
  sourcePlatform: string;
  targetPlatforms: string[];
  brandId?: string;
  maintainCore: boolean; // Keep core message vs adapt freely
}

interface RepurposedContent {
  platform: string;
  contentType: string;
  content: string;
  title?: string;
  viralScore: number;
  adaptations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sourceContent,
      sourcePlatform,
      targetPlatforms,
      brandId,
      maintainCore = true,
      autoQueue = false,
    } = body as RepurposeConfig & { autoQueue?: boolean };

    if (!sourceContent || !targetPlatforms || targetPlatforms.length === 0) {
      return NextResponse.json(
        { error: "sourceContent and targetPlatforms are required" },
        { status: 400 }
      );
    }

    // Fetch brand if provided
    let brand = null;
    if (brandId) {
      brand = await prisma.brand.findFirst({
        where: { id: brandId, userId: user.id },
      });
    }

    // Repurpose content for each target platform
    const repurposedContent = await Promise.all(
      targetPlatforms.map(async (targetPlatform) => {
        return await repurposeForPlatform({
          sourceContent,
          sourcePlatform,
          targetPlatform,
          brand,
          maintainCore,
          userId: user.id,
        });
      })
    );

    // If autoQueue, create content queue entries
    if (autoQueue && brandId) {
      await Promise.all(
        repurposedContent.map(async (content) => {
          await prisma.contentQueue.create({
            data: {
              userId: user.id,
              brandId,
              platform: content.platform,
              contentType: content.contentType,
              status: "review",
              progress: 100,
              generationConfig: {
                method: "repurposed",
                sourcePlatform,
              },
              // TODO: Link to generated content
            },
          });
        })
      );
    }

    return NextResponse.json({
      success: true,
      repurposedContent,
      message: `Content successfully repurposed for ${targetPlatforms.length} platform(s)`,
    });
  } catch (error) {
    console.error("Repurposing error:", error);
    return NextResponse.json(
      {
        error: "Failed to repurpose content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function repurposeForPlatform(config: {
  sourceContent: string;
  sourcePlatform: string;
  targetPlatform: string;
  brand: any;
  maintainCore: boolean;
  userId?: string;
}): Promise<RepurposedContent> {
  const { sourceContent, sourcePlatform, targetPlatform, brand, maintainCore, userId } = config;

  // Define platform-specific repurposing strategies
  const repurposingStrategies: Record<string, any> = {
    "blog-to-twitter": {
      contentType: "thread",
      instructions: `
Transform this blog post into a viral Twitter thread.

STRATEGY:
- Extract 8-12 key points
- Tweet 1: Hook (use blog's best insight)
- Tweets 2-10: One insight per tweet (standalone + connected)
- Tweet 11: Summary + CTA
- Each tweet must be tweetable on its own
- Use line breaks for readability
- No fluff, pure value
`,
    },
    "blog-to-linkedin": {
      contentType: "article",
      instructions: `
Adapt this blog post for LinkedIn.

STRATEGY:
- Professional storytelling tone
- Personal anecdote opening
- Short paragraphs with line breaks
- Behind-the-scenes insights
- Data/results if available
- Engagement question at end
- 1200-1500 words max
`,
    },
    "blog-to-youtube": {
      contentType: "script",
      instructions: `
Convert this blog post into a YouTube video script.

STRATEGY:
- First 30 seconds: Hook + promise
- Clear chapter structure
- "Show don't tell" (visual descriptions)
- Retention hooks every 90 seconds
- Practical examples and demos
- Strong ending + CTA
- Include [Visual cue] and (Pause) notes
`,
    },
    "blog-to-email": {
      contentType: "newsletter",
      instructions: `
Turn this blog post into an email newsletter.

STRATEGY:
- Compelling subject line
- Conversational, personal tone
- Story-driven opening
- 3-5 key takeaways
- One clear CTA
- P.S. with bonus value
- 800-1200 words
`,
    },
    "youtube-to-blog": {
      contentType: "article",
      instructions: `
Transform this YouTube script into a blog post.

STRATEGY:
- Engaging headline
- Extract key chapters as sections
- Add context where needed
- Convert visual cues to images/descriptions
- Add data and examples
- Scannability (bullets, subheads)
- 2000-3000 words
`,
    },
    "youtube-to-twitter": {
      contentType: "thread",
      instructions: `
Extract the essence of this video into a Twitter thread.

STRATEGY:
- Tweet 1: Video's main hook
- Tweets 2-8: Key insights from video
- Tweet 9: Tease watching full video
- Link to video in final tweet
- Use timestamps in tweets
`,
    },
    "twitter-to-linkedin": {
      contentType: "post",
      instructions: `
Expand this Twitter thread into a LinkedIn post.

STRATEGY:
- More professional tone
- Add context and depth
- Personal story elements
- Line breaks between thoughts
- Keep core insights
- 300-500 words
`,
    },
    "linkedin-to-twitter": {
      contentType: "thread",
      instructions: `
Condense this LinkedIn post into a Twitter thread.

STRATEGY:
- Extract core narrative
- Punchier language
- Remove corporate speak
- 6-10 tweets
- Each tweet standalone
`,
    },
  };

  const strategyKey = `${sourcePlatform}-to-${targetPlatform}`;
  const strategy = repurposingStrategies[strategyKey] || {
    contentType: "article",
    instructions: `Adapt this ${sourcePlatform} content for ${targetPlatform}.`,
  };

  // Build prompt
  const prompt = `You are an expert at repurposing content across platforms.

SOURCE CONTENT (${sourcePlatform}):
${sourceContent}

TARGET PLATFORM: ${targetPlatform}

${strategy.instructions}

${maintainCore ? `
IMPORTANT: Maintain the core message and key insights, but adapt presentation for ${targetPlatform}.
` : `
IMPORTANT: Feel free to adapt the angle and emphasis to best suit ${targetPlatform}, while keeping the general topic.
`}

${brand ? `
BRAND VOICE:
${JSON.stringify(brand.brandVoice, null, 2)}

Apply this brand voice to the repurposed content.
` : ''}

VIRAL OPTIMIZATION:
- Use platform-specific viral tactics
- Apply appropriate hook framework
- Optimize for ${targetPlatform} engagement
- Target viral score 80+

Respond with JSON:
{
  "title": string (if applicable),
  "content": string (full repurposed content),
  "viralScore": number (estimated),
  "adaptations": string[] (list of key changes made)
}`;

  // Use Integration Manager to get AI provider
  let responseText: string;

  if (userId) {
    try {
      const integration = await integrationManager.getIntegrationFor(userId, "text_generation");

      if (integration) {
        const client = integrationManager.getClient(integration);
        const response = await client.generateText(prompt, {
          temperature: 0.7,
          maxTokens: 8000,
        });

        responseText = response.text;

        // Track usage
        await integrationManager.trackUsage(
          integration.id,
          "text_generation",
          response.usage.totalTokens || 0,
          { success: true }
        );
      } else {
        throw new Error("No AI integration configured");
      }
    } catch (error) {
      console.error("Integration Manager error, falling back to env API key:", error);
      // Fallback to direct Anthropic API if integration fails
      const Anthropic = require("@anthropic-ai/sdk").default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== "text") throw new Error("Unexpected response format");
      responseText = content.text;
    }
  } else {
    // No userId provided, use env API key
    const Anthropic = require("@anthropic-ai/sdk").default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response format");
    responseText = content.text;
  }

  // Parse JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    responseText = jsonMatch[0];
  }

  const result = JSON.parse(responseText);

  return {
    platform: targetPlatform,
    contentType: strategy.contentType,
    content: result.content,
    title: result.title,
    viralScore: result.viralScore,
    adaptations: result.adaptations,
  };
}
