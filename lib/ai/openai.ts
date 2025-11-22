import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

const getApiKey = () => {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  throw new Error("OPENAI_API_KEY is not defined");
};

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: getApiKey(),
  });

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;

/**
 * Generate content using GPT-4
 */
export async function generateWithGPT({
  systemPrompt,
  userPrompt,
  model = "gpt-4-turbo-preview",
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
    const response = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    return {
      content,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      model: response.model,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

/**
 * Generate image using DALL-E 3
 */
export async function generateImage({
  prompt,
  size = "1024x1024",
  quality = "standard",
}: {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
}) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality,
    });

    return {
      url: response.data[0]?.url,
      revisedPrompt: response.data[0]?.revised_prompt,
    };
  } catch (error) {
    console.error("DALL-E API error:", error);
    throw error;
  }
}

export default openai;
