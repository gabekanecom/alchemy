import { IntegrationClient } from "../types";
import { prisma } from "@/lib/db";
import { InstagramOAuth } from "@/lib/oauth/instagram";

interface InstagramConfig {
  accessToken: string;
  userId: string;
}

interface InstagramMediaResult {
  success: boolean;
  mediaId?: string;
  error?: string;
}

interface InstagramPublishResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

export class InstagramClient implements IntegrationClient {
  private config: InstagramConfig;
  private baseUrl = "https://graph.instagram.com";

  constructor(config: InstagramConfig) {
    this.config = config;
  }

  /**
   * Test connection to Instagram API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(
        `/me?fields=id,username,account_type`,
        "GET"
      );

      if (response.id) {
        return { success: true };
      }

      return { success: false, error: "Invalid response from Instagram API" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish single image post
   */
  async publishImage(content: {
    imageUrl: string;
    caption?: string;
    location?: string;
    userTags?: Array<{ username: string; x: number; y: number }>;
  }): Promise<InstagramPublishResult> {
    try {
      // Step 1: Create media container
      const containerResult = await this.createImageContainer(
        content.imageUrl,
        content.caption
      );

      if (!containerResult.success || !containerResult.mediaId) {
        return { success: false, error: containerResult.error };
      }

      // Step 2: Publish the container
      return await this.publishContainer(containerResult.mediaId);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish carousel post (multiple images)
   */
  async publishCarousel(content: {
    images: string[];
    caption?: string;
  }): Promise<InstagramPublishResult> {
    try {
      // Step 1: Create containers for each image
      const containerIds: string[] = [];

      for (const imageUrl of content.images) {
        const result = await this.createCarouselItemContainer(imageUrl);
        if (!result.success || !result.mediaId) {
          return { success: false, error: result.error };
        }
        containerIds.push(result.mediaId);
      }

      // Step 2: Create carousel container
      const carouselResult = await this.createCarouselContainer(
        containerIds,
        content.caption
      );

      if (!carouselResult.success || !carouselResult.mediaId) {
        return { success: false, error: carouselResult.error };
      }

      // Step 3: Publish the carousel
      return await this.publishContainer(carouselResult.mediaId);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish video post
   */
  async publishVideo(content: {
    videoUrl: string;
    caption?: string;
    coverUrl?: string;
  }): Promise<InstagramPublishResult> {
    try {
      // Step 1: Create video container
      const containerResult = await this.createVideoContainer(
        content.videoUrl,
        content.caption,
        content.coverUrl
      );

      if (!containerResult.success || !containerResult.mediaId) {
        return { success: false, error: containerResult.error };
      }

      // Step 2: Wait for video processing
      await this.waitForVideoProcessing(containerResult.mediaId);

      // Step 3: Publish the container
      return await this.publishContainer(containerResult.mediaId);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish Reel
   */
  async publishReel(content: {
    videoUrl: string;
    caption?: string;
    coverUrl?: string;
    shareToFeed?: boolean;
  }): Promise<InstagramPublishResult> {
    try {
      const params: any = {
        media_type: "REELS",
        video_url: content.videoUrl,
        caption: content.caption,
        share_to_feed: content.shareToFeed ?? true,
      };

      if (content.coverUrl) {
        params.cover_url = content.coverUrl;
      }

      const containerResponse = await this.makeRequest(
        `/${this.config.userId}/media`,
        "POST",
        params
      );

      if (!containerResponse.id) {
        return { success: false, error: "Failed to create reel container" };
      }

      // Wait for video processing
      await this.waitForVideoProcessing(containerResponse.id);

      // Publish the reel
      return await this.publishContainer(containerResponse.id);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create image container
   */
  private async createImageContainer(
    imageUrl: string,
    caption?: string
  ): Promise<InstagramMediaResult> {
    try {
      const params: any = {
        image_url: imageUrl,
        caption: caption,
      };

      const response = await this.makeRequest(
        `/${this.config.userId}/media`,
        "POST",
        params
      );

      return { success: true, mediaId: response.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create carousel item container
   */
  private async createCarouselItemContainer(
    imageUrl: string
  ): Promise<InstagramMediaResult> {
    try {
      const params = {
        is_carousel_item: true,
        image_url: imageUrl,
      };

      const response = await this.makeRequest(
        `/${this.config.userId}/media`,
        "POST",
        params
      );

      return { success: true, mediaId: response.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create carousel container
   */
  private async createCarouselContainer(
    children: string[],
    caption?: string
  ): Promise<InstagramMediaResult> {
    try {
      const params: any = {
        media_type: "CAROUSEL",
        children: children.join(","),
      };

      if (caption) {
        params.caption = caption;
      }

      const response = await this.makeRequest(
        `/${this.config.userId}/media`,
        "POST",
        params
      );

      return { success: true, mediaId: response.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create video container
   */
  private async createVideoContainer(
    videoUrl: string,
    caption?: string,
    coverUrl?: string
  ): Promise<InstagramMediaResult> {
    try {
      const params: any = {
        media_type: "VIDEO",
        video_url: videoUrl,
      };

      if (caption) params.caption = caption;
      if (coverUrl) params.thumb_offset = coverUrl;

      const response = await this.makeRequest(
        `/${this.config.userId}/media`,
        "POST",
        params
      );

      return { success: true, mediaId: response.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Wait for video processing to complete
   */
  private async waitForVideoProcessing(
    containerId: string,
    maxAttempts = 30
  ): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.makeRequest(
        `/${containerId}?fields=status_code`,
        "GET"
      );

      if (status.status_code === "FINISHED") {
        return;
      }

      if (status.status_code === "ERROR") {
        throw new Error("Video processing failed");
      }

      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Video processing timeout");
  }

  /**
   * Publish container
   */
  private async publishContainer(
    containerId: string
  ): Promise<InstagramPublishResult> {
    try {
      const response = await this.makeRequest(
        `/${this.config.userId}/media_publish`,
        "POST",
        { creation_id: containerId }
      );

      // Get permalink
      const media = await this.makeRequest(
        `/${response.id}?fields=permalink`,
        "GET"
      );

      return {
        success: true,
        postId: response.id,
        permalink: media.permalink,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get insights for a post
   */
  async getPostInsights(mediaId: string) {
    try {
      const response = await this.makeRequest(
        `/${mediaId}/insights?metric=engagement,impressions,reach,saved`,
        "GET"
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching Instagram insights:", error);
      return null;
    }
  }

  /**
   * Make authenticated request to Instagram API
   */
  private async makeRequest(endpoint: string, method: string, body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const params = new URLSearchParams({
      access_token: this.config.accessToken,
      ...body,
    });

    const fullUrl = method === "GET" ? `${url}&${params.toString()}` : url;

    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: method === "POST" ? params.toString() : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Instagram API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Track usage for cost monitoring
   */
  async trackUsage(integrationId: string, action: string): Promise<void> {
    try {
      await prisma.integrationUsage.create({
        data: {
          integrationId,
          tokens: 0,
          cost: 0, // Instagram is free
          metadata: { action },
        },
      });
    } catch (error) {
      console.error("Error tracking Instagram usage:", error);
    }
  }
}
