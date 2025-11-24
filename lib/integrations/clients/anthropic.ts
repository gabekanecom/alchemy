// Anthropic Claude Client Implementation

import Anthropic from "@anthropic-ai/sdk";
import { AIProviderClient, AITextResponse } from "./base";

export class AnthropicClient implements AIProviderClient {
  private client: Anthropic;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async generateText(prompt: string, options?: any): Promise<AITextResponse> {
    const model = options?.model || this.config.model || "claude-sonnet-4-20250514";
    const temperature = options?.temperature ?? this.config.defaultSettings?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || this.config.defaultSettings?.maxTokens || 4000;

    const response = await this.client.messages.create({
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

    const textContent = response.content.find((c) => c.type === "text");

    return {
      text: textContent?.type === "text" ? textContent.text : "",
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
      finishReason: response.stop_reason || undefined,
    };
  }

  async *streamText(prompt: string, options?: any): AsyncGenerator<string> {
    const model = options?.model || this.config.model || "claude-sonnet-4-20250514";
    const temperature = options?.temperature ?? this.config.defaultSettings?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || this.config.defaultSettings?.maxTokens || 4000;

    const stream = await this.client.messages.stream({
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

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }
}
