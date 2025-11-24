// Google Gemini Client Implementation

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProviderClient, AITextResponse } from "./base";

export class GeminiClient implements AIProviderClient {
  private client: GoogleGenerativeAI;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateText(prompt: string, options?: any): Promise<AITextResponse> {
    const modelName = options?.model || this.config.model || "gemini-1.5-pro";
    const temperature = options?.temperature ?? this.config.defaultSettings?.temperature ?? 0.7;
    const maxOutputTokens = options?.maxTokens || this.config.defaultSettings?.maxOutputTokens || 4000;

    const model = this.client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Gemini doesn't always provide detailed token usage
    const usage = {
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    };

    return {
      text,
      usage,
      model: modelName,
    };
  }

  async *streamText(prompt: string, options?: any): AsyncGenerator<string> {
    const modelName = options?.model || this.config.model || "gemini-1.5-pro";
    const temperature = options?.temperature ?? this.config.defaultSettings?.temperature ?? 0.7;
    const maxOutputTokens = options?.maxTokens || this.config.defaultSettings?.maxOutputTokens || 4000;

    const model = this.client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    });

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }
}
