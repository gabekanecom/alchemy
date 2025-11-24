// OpenAI Client Implementation

import OpenAI from "openai";
import { AIProviderClient, AITextResponse } from "./base";

export class OpenAIClient implements AIProviderClient {
  private client: OpenAI;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async generateText(prompt: string, options?: any): Promise<AITextResponse> {
    const model = options?.model || this.config.model || "gpt-4o";
    const temperature = options?.temperature ?? this.config.defaultSettings?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || this.config.defaultSettings?.maxTokens || 4000;

    const response = await this.client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const message = response.choices[0]?.message;

    return {
      text: message?.content || "",
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
      finishReason: response.choices[0]?.finish_reason || undefined,
    };
  }

  async *streamText(prompt: string, options?: any): AsyncGenerator<string> {
    const model = options?.model || this.config.model || "gpt-4o";
    const temperature = options?.temperature ?? this.config.defaultSettings?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || this.config.defaultSettings?.maxTokens || 4000;

    const stream = await this.client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
