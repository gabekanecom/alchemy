// DALL-E Image Generation Client

import OpenAI from "openai";
import { ImageGenerationClient, ImageResponse } from "./base";

export class DALLEClient implements ImageGenerationClient {
  private client: OpenAI;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async generateImage(prompt: string, options?: any): Promise<ImageResponse> {
    const model = options?.model || this.config.defaultSettings?.model || "dall-e-3";
    const size = options?.size || this.config.defaultSettings?.size || "1792x1024";
    const quality = options?.quality || this.config.defaultSettings?.quality || "hd";
    const style = options?.style || this.config.defaultSettings?.style || "natural";

    const response = await this.client.images.generate({
      model,
      prompt,
      n: 1,
      size: size as any,
      quality: quality as any,
      style: style as any,
    });

    const image = response.data[0];

    return {
      url: image.url!,
      revisedPrompt: image.revised_prompt,
      size,
      format: "png",
    };
  }
}
