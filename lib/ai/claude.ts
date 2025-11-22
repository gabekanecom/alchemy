import Anthropic from "@anthropic-ai/sdk";

const globalForClaude = globalThis as unknown as {
  claude: Anthropic | undefined;
};

const getApiKey = () => {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  throw new Error("ANTHROPIC_API_KEY is not defined");
};

export const claude =
  globalForClaude.claude ??
  new Anthropic({
    apiKey: getApiKey(),
  });

if (process.env.NODE_ENV !== "production") globalForClaude.claude = claude;

/**
 * Generate content using Claude
 */
export async function generateWithClaude({
  systemPrompt,
  userPrompt,
  model = "claude-sonnet-4-20250514",
  maxTokens = 4096,
  temperature = 1.0,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}) {
  try {
    const response = await claude.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    return {
      content: textContent.text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens:
          response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
    };
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
}

export default claude;
