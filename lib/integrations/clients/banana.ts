import { ImageGenerationClient, ImageGenerationResponse } from "./base";

export class BananaClient implements ImageGenerationClient {
  private apiKey: string;
  private modelKey: string;
  private baseUrl = "https://api.banana.dev";

  constructor(config: { apiKey: string; modelKey?: string }) {
    this.apiKey = config.apiKey;
    // Default to nano banana model
    this.modelKey = config.modelKey || "nano-banana";
  }

  async generateImage(
    prompt: string,
    options?: {
      width?: number;
      height?: number;
      numInferenceSteps?: number;
      guidanceScale?: number;
      seed?: number;
    }
  ): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/start/v4`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          modelKey: this.modelKey,
          modelInputs: {
            prompt,
            width: options?.width || 512,
            height: options?.height || 512,
            num_inference_steps: options?.numInferenceSteps || 20,
            guidance_scale: options?.guidanceScale || 7.5,
            seed: options?.seed || Math.floor(Math.random() * 1000000),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Banana.dev API error: ${error}`);
      }

      const data = await response.json();

      // Banana.dev returns base64 encoded images
      const images = Array.isArray(data.modelOutputs)
        ? data.modelOutputs.map((img: any) => ({
            base64: img.image_base64,
          }))
        : [{ base64: data.modelOutputs.image_base64 }];

      return {
        images,
        metadata: {
          model: this.modelKey,
          prompt,
          callId: data.callID,
          ...options,
        },
      };
    } catch (error) {
      throw new Error(
        `Banana.dev generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple generation
      await this.generateImage("test", { numInferenceSteps: 1 });
      return true;
    } catch (error) {
      console.error("Banana.dev connection test failed:", error);
      return false;
    }
  }
}
