// AI-Powered Idea Analysis using AI Integrations

import Anthropic from "@anthropic-ai/sdk";
import type { Brand } from "@prisma/client";
import { integrationManager } from "@/lib/integrations/manager";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnalysisResult {
  relevanceScore: number;
  category: string;
  contentType: string;
  targetPlatforms: string[];
  keywords: string[];
  contentBrief: string;
  aiInsights: string;
}

export async function analyzeIdeaRelevance(
  ideaData: {
    title: string;
    description?: string;
    text?: string;
    source: string;
    keywords?: string[];
  },
  brand: Brand
): Promise<AnalysisResult> {
  const brandVoice = brand.brandVoice as any;
  const targetAudience = brand.targetAudience as any;

  const prompt = `Analyze this content idea for brand relevance and potential.

BRAND CONTEXT:
Name: ${brand.name}
Description: ${brand.description || "N/A"}
Voice: ${brandVoice?.tone?.primary || "professional"}
Target Audience: ${targetAudience?.demographics?.professional?.jobTitles?.join(", ") || "general"}
Core Topics: ${brandVoice?.language?.keywords?.join(", ") || "various"}

IDEA DATA:
Title: ${ideaData.title}
Description: ${ideaData.description || ideaData.text || ""}
Source: ${ideaData.source}
${ideaData.keywords ? `Keywords: ${ideaData.keywords.join(", ")}` : ""}

ANALYZE:
1. Relevance Score (0-100): How relevant is this to the brand's audience and topics?
2. Category: What category/topic does this fall under?
3. Content Type: What type of content would work best? (how-to, listicle, case-study, comparison, etc.)
4. Target Platforms: Which platforms would this work best on? (blog, youtube, linkedin, twitter, instagram)
5. Keywords: Extract 5-10 relevant keywords
6. Content Brief: Write a 2-3 sentence content brief
7. Insights: What makes this idea compelling? What angle should we take?

Respond in JSON format:
{
  "relevanceScore": 85,
  "category": "AI Marketing",
  "contentType": "how-to",
  "targetPlatforms": ["blog", "linkedin"],
  "keywords": ["keyword1", "keyword2"],
  "contentBrief": "Brief description",
  "aiInsights": "Key insights and angle"
}`;

  try {
    // Try to use integration manager first
    const integration = await integrationManager.getIntegrationFor(
      brand.userId,
      "analysis"
    );

    let text: string;

    if (integration) {
      // Use configured AI integration
      console.log(`[AI Analyzer] Using integration: ${integration.displayName}`);
      const client = integrationManager.getClient(integration);
      const response = await client.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });
      text = response.text;

      // Track usage
      await integrationManager.trackUsage(
        integration.id,
        "analysis",
        response.usage.totalTokens || 0,
        {
          success: true,
          metadata: {
            operation: "idea_analysis",
            source: ideaData.source,
          },
        }
      );
    } else {
      // Fallback to legacy direct Claude API
      console.log("[AI Analyzer] Using legacy Claude API");
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      });
      text = response.content[0].type === "text" ? response.content[0].text : "";
    }

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Return default values if AI fails
    return {
      relevanceScore: 50,
      category: "General",
      contentType: "article",
      targetPlatforms: ["blog"],
      keywords: ideaData.keywords || [],
      contentBrief: ideaData.description || ideaData.title,
      aiInsights: "Automated analysis unavailable",
    };
  }
}

export async function detectDuplicates(
  newIdea: string,
  existingIdeas: Array<{ id: string; title: string; description?: string }>
): Promise<Array<{ id: string; similarity: number }>> {
  if (existingIdeas.length === 0) return [];

  const prompt = `Compare this new idea with existing ideas and identify duplicates or very similar topics.

NEW IDEA: "${newIdea}"

EXISTING IDEAS:
${existingIdeas.map((idea, i) => `${i + 1}. ${idea.title}`).join("\n")}

Return JSON array of similar ideas with similarity score 0-100. Only include ideas with similarity > 70:
[{"index": 1, "similarity": 85}]

If no similar ideas, return empty array: []`;

  try {
    // Try to use integration manager first (use first existing idea's userId as context)
    const userId = existingIdeas[0]?.id ? "system" : "system"; // For duplicate detection, we can use system-level integration

    let text: string;

    // For now, use legacy API for duplicate detection since we don't have userId context
    // TODO: Pass userId to this function to use integration manager
    console.log("[Duplicate Detection] Using legacy Claude API");
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });
    text = response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) return [];

    const results = JSON.parse(jsonMatch[0]) as Array<{ index: number; similarity: number }>;

    // Map indices to IDs
    return results.map((result) => ({
      id: existingIdeas[result.index - 1]?.id || "",
      similarity: result.similarity,
    }));
  } catch (error) {
    console.error("Duplicate detection failed:", error);
    return [];
  }
}
