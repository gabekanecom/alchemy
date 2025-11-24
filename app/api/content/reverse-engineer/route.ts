import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ReverseEngineeringResult {
  analysis: {
    hookFramework: string;
    storyFramework: string;
    emotionalTriggers: string[];
    psychologicalPrinciples: string[];
    platformTactics: string[];
    viralScore: number;
    whyItWorks: string;
  };
  blueprint: {
    structure: string[];
    keyElements: string[];
    replicationGuide: string;
  };
  adaptedContent: string;
  variations: Array<{
    title: string;
    hook: string;
    angle: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      viralContent,
      sourceUrl,
      platform,
      yourTopic,
      yourAngle,
      targetPlatform,
    } = body as {
      viralContent: string;
      sourceUrl?: string;
      platform: string;
      yourTopic?: string;
      yourAngle?: string;
      targetPlatform?: string;
    };

    if (!viralContent) {
      return NextResponse.json(
        { error: "viralContent is required" },
        { status: 400 }
      );
    }

    // Reverse-engineer the viral content
    const prompt = `You are an expert at reverse-engineering viral content. Analyze this high-performing ${platform} content and extract the exact formula that made it successful.

VIRAL CONTENT TO ANALYZE:
${sourceUrl ? `Source: ${sourceUrl}\n` : ''}
${viralContent}

---

## YOUR TASK:

Perform deep analysis and provide:

### 1. FRAMEWORK ANALYSIS
Identify exactly which viral frameworks were used:
- Hook framework (pattern interrupt, curiosity gap, social proof, etc.)
- Storytelling structure (Hero's Journey, SCQA, BAB, PAS, etc.)
- Emotional triggers activated (awe, surprise, validation, etc.)
- Psychological principles (social currency, identity signaling, etc.)
- Platform-specific tactics

### 2. VIRAL SCORE
Score this content 0-100 based on viral potential metrics.

### 3. WHY IT WORKS
Detailed explanation of what makes this content spread.

### 4. BLUEPRINT FOR REPLICATION
Step-by-step structure to replicate this success:
- Opening pattern
- Body structure
- Transition techniques
- Closing pattern
- CTA strategy

### 5. KEY ELEMENTS
List 5-10 specific elements that MUST be included when replicating.

${yourTopic ? `
### 6. ADAPTED VERSION
Create a similar piece of content about: "${yourTopic}"
${yourAngle ? `Angle/approach: ${yourAngle}` : ''}
${targetPlatform ? `For platform: ${targetPlatform}` : `For platform: ${platform}`}

Use the EXACT SAME viral formula but adapted to this new topic.
` : ''}

### ${yourTopic ? '7' : '6'}. VARIATIONS
Generate 3 different angles/variations using the same viral formula.

---

Respond with JSON:
{
  "analysis": {
    "hookFramework": string,
    "storyFramework": string,
    "emotionalTriggers": string[],
    "psychologicalPrinciples": string[],
    "platformTactics": string[],
    "viralScore": number,
    "whyItWorks": string (detailed explanation)
  },
  "blueprint": {
    "structure": string[] (step-by-step breakdown),
    "keyElements": string[] (must-have elements),
    "replicationGuide": string (how to apply this formula)
  },
  ${yourTopic ? `"adaptedContent": string (full content adapted to new topic),` : ''}
  "variations": [
    {
      "title": string,
      "hook": string,
      "angle": string
    }
  ]
}`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 12000,
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

    // Extract JSON from response
    let responseText = content.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const result: ReverseEngineeringResult = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Reverse engineering error:", error);
    return NextResponse.json(
      {
        error: "Failed to reverse-engineer content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
