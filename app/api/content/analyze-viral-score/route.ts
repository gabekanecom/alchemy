import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ViralScoreResult {
  overallScore: number;
  hookScore: number;
  valueScore: number;
  shareabilityScore: number;
  storyScore: number;
  platformOptimization: number;

  strengths: string[];
  weaknesses: string[];
  improvements: string[];

  hookAnalysis: {
    firstSentence: string;
    effectiveness: string;
    suggestedAlternatives: string[];
  };

  emotionalTriggers: string[];
  psychologicalPrinciples: string[];

  viralPotential: "low" | "moderate" | "high" | "extreme";
  recommendation: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, platform, contentType, title } = body as {
      content: string;
      platform: string;
      contentType: string;
      title?: string;
    };

    if (!content || !platform) {
      return NextResponse.json(
        { error: "content and platform are required" },
        { status: 400 }
      );
    }

    // Prepare viral analysis prompt
    const analysisPrompt = `You are an expert viral content analyst. Analyze this ${contentType} for ${platform} and provide a comprehensive viral score.

CONTENT TO ANALYZE:
${title ? `Title/Headline: ${title}\n` : ''}
${content}

---

Analyze this content using these criteria:

## 1. HOOK SCORE (0-100)
- Does it stop the scroll in 1 second?
- Pattern interrupt effectiveness
- Curiosity gap creation
- Emotional trigger in opening
- Platform-appropriate hook

## 2. VALUE SCORE (0-100)
- Immediately actionable insights
- Ultra-specific information (numbers, names, exact steps)
- Unique perspective or insider knowledge
- Time/money-saving potential
- Depth of useful content

## 3. SHAREABILITY SCORE (0-100)
- Makes sharer look good (social currency)
- Easy to understand and explain
- Emotional resonance (awe, anger, joy, surprise)
- "Wow" moments or quotable lines
- Clear value for recipient

## 4. STORY SCORE (0-100)
- Narrative arc present
- Relatable character or situation
- Emotional journey
- Tension and resolution
- Satisfying conclusion

## 5. PLATFORM OPTIMIZATION (0-100)
- Follows ${platform} best practices
- Appropriate length and format
- Platform-specific tactics used
- Formatting optimized for ${platform}
- CTA appropriate for platform

## ANALYSIS REQUIRED:

Provide detailed analysis in this JSON format:
{
  "overallScore": number (weighted average: hook 25%, value 25%, shareability 25%, story 15%, platform 10%),
  "hookScore": number,
  "valueScore": number,
  "shareabilityScore": number,
  "storyScore": number,
  "platformOptimization": number,

  "strengths": [
    "specific strength 1",
    "specific strength 2",
    "specific strength 3"
  ],

  "weaknesses": [
    "specific weakness 1",
    "specific weakness 2",
    "specific weakness 3"
  ],

  "improvements": [
    "actionable improvement 1",
    "actionable improvement 2",
    "actionable improvement 3"
  ],

  "hookAnalysis": {
    "firstSentence": "the actual first sentence",
    "effectiveness": "analysis of hook effectiveness",
    "suggestedAlternatives": [
      "alternative hook 1",
      "alternative hook 2",
      "alternative hook 3"
    ]
  },

  "emotionalTriggers": ["trigger1", "trigger2"],
  "psychologicalPrinciples": ["principle1", "principle2"],

  "viralPotential": "low|moderate|high|extreme",
  "recommendation": "specific recommendation based on score"
}

SCORING GUIDELINES:
- 90-100: Extremely likely to go viral, publish immediately
- 75-89: High viral potential, minor optimizations suggested
- 60-74: Moderate potential, significant improvements needed
- Below 60: Low potential, major revisions required

Be brutally honest. Only give high scores to truly exceptional content.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent scoring
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
    });

    // Parse response
    const responseContent = message.content[0];
    if (responseContent.type !== "text") {
      throw new Error("Unexpected response format from Claude");
    }

    // Extract JSON from response
    let responseText = responseContent.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const analysis: ViralScoreResult = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Viral analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze viral score",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
