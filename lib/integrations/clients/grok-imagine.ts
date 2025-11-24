import { ImageGenerationClient, ImageGenerationResponse } from "./base";

export class GrokImagineClient implements ImageGenerationClient {
  private apiKey: string;
  private baseUrl = "https://api.x.ai/v1";

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  async generateImage(
    prompt: string,
    options?: {
      size?: string;
      quality?: string;
      n?: number;
      style?: string;
    }
  ): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          model: "grok-imagine-1",
          size: options?.size || "1024x1024",
          quality: options?.quality || "standard",
          n: options?.n || 1,
          style: options?.style || "vivid",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Grok Imagine API error: ${error}`);
      }

      const data = await response.json();

      return {
        images: data.data.map((img: any) => ({
          url: img.url,
          base64: img.b64_json,
        })),
        metadata: {
          model: "grok-imagine-1",
          prompt,
          size: options?.size || "1024x1024",
        },
      };
    } catch (error) {
      throw new Error(
        `Grok Imagine generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple generation
      await this.generateImage("test image", { n: 1 });
      return true;
    } catch (error) {
      console.error("Grok Imagine connection test failed:", error);
      return false;
    }
  }
}
