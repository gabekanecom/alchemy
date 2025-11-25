import { IntegrationClient } from "../types";
import { prisma } from "@/lib/db";

interface MediumConfig {
  accessToken: string;
}

interface MediumPost {
  title: string;
  content: string;
  contentFormat: "html" | "markdown";
  publishStatus: "public" | "draft" | "unlisted";
  tags?: string[];
  canonicalUrl?: string;
  notifyFollowers?: boolean;
}

interface MediumPublishResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

interface MediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export class MediumClient implements IntegrationClient {
  private config: MediumConfig;
  private baseUrl = "https://api.medium.com/v1";

  constructor(config: MediumConfig) {
    this.config = config;
  }

  /**
   * Test connection to Medium API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.getCurrentUser();

      if (user && user.id) {
        return { success: true };
      }

      return { success: false, error: "Failed to fetch user data" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<MediumUser | null> {
    try {
      const response = await this.makeRequest("/me", "GET");
      return response.data;
    } catch (error) {
      console.error("Error fetching Medium user:", error);
      return null;
    }
  }

  /**
   * Publish content to Medium
   */
  async publishContent(content: {
    title: string;
    body: string;
    tags?: string[];
    canonicalUrl?: string;
    publishStatus?: "public" | "draft" | "unlisted";
    notifyFollowers?: boolean;
    contentFormat?: "html" | "markdown";
  }): Promise<MediumPublishResult> {
    try {
      // Get user ID first
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, error: "Failed to get user information" };
      }

      const post: MediumPost = {
        title: content.title,
        content: content.body,
        contentFormat: content.contentFormat || "html",
        publishStatus: content.publishStatus || "public",
        tags: content.tags?.slice(0, 5), // Medium allows max 5 tags
        canonicalUrl: content.canonicalUrl,
        notifyFollowers: content.notifyFollowers ?? true,
      };

      const response = await this.makeRequest(
        `/users/${user.id}/posts`,
        "POST",
        post
      );

      if (response.data) {
        return {
          success: true,
          postId: response.data.id,
          url: response.data.url,
        };
      }

      return { success: false, error: "Failed to create post" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's publications
   */
  async getPublications(): Promise<any[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return [];
      }

      const response = await this.makeRequest(
        `/users/${user.id}/publications`,
        "GET"
      );

      return response.data || [];
    } catch (error) {
      console.error("Error fetching Medium publications:", error);
      return [];
    }
  }

  /**
   * Publish to a specific publication
   */
  async publishToPublication(
    publicationId: string,
    content: {
      title: string;
      body: string;
      tags?: string[];
      canonicalUrl?: string;
      publishStatus?: "public" | "draft" | "unlisted";
      contentFormat?: "html" | "markdown";
    }
  ): Promise<MediumPublishResult> {
    try {
      const post: MediumPost = {
        title: content.title,
        content: content.body,
        contentFormat: content.contentFormat || "html",
        publishStatus: content.publishStatus || "public",
        tags: content.tags?.slice(0, 5),
        canonicalUrl: content.canonicalUrl,
      };

      const response = await this.makeRequest(
        `/publications/${publicationId}/posts`,
        "POST",
        post
      );

      if (response.data) {
        return {
          success: true,
          postId: response.data.id,
          url: response.data.url,
        };
      }

      return { success: false, error: "Failed to create post" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert HTML to Medium-friendly format
   */
  private cleanHtmlForMedium(html: string): string {
    // Medium supports basic HTML tags
    // Remove any unsupported tags or attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/style="[^"]*"/gi, "")
      .replace(/class="[^"]*"/gi, "");
  }

  /**
   * Make authenticated request to Medium API
   */
  private async makeRequest(endpoint: string, method: string, body?: any) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Medium API error: ${error}`);
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
          cost: 0, // Medium is free
          metadata: { action },
        },
      });
    } catch (error) {
      console.error("Error tracking Medium usage:", error);
    }
  }
}
