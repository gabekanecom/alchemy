import { IntegrationClient } from "../types";
import { prisma } from "@/lib/db";

interface GhostConfig {
  siteUrl: string;
  adminApiKey: string;
}

interface GhostPost {
  title: string;
  html?: string;
  markdown?: string;
  status: "published" | "draft" | "scheduled";
  published_at?: string;
  feature_image?: string;
  excerpt?: string;
  tags?: string[];
  authors?: string[];
  meta_title?: string;
  meta_description?: string;
}

interface GhostPublishResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export class GhostClient implements IntegrationClient {
  private config: GhostConfig;
  private apiVersion = "v5.0";

  constructor(config: GhostConfig) {
    this.config = config;
  }

  /**
   * Test connection to Ghost CMS
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest("/site/", "GET");

      if (response.site) {
        return { success: true };
      }

      return { success: false, error: "Invalid response from Ghost API" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish content to Ghost CMS
   */
  async publishContent(content: {
    title: string;
    body: string;
    excerpt?: string;
    featuredImage?: string;
    tags?: string[];
    publishAt?: Date;
    status?: "published" | "draft";
    seoTitle?: string;
    seoDescription?: string;
  }): Promise<GhostPublishResult> {
    try {
      const post: GhostPost = {
        title: content.title,
        html: content.body,
        status: content.status || "published",
        excerpt: content.excerpt,
        feature_image: content.featuredImage,
        tags: content.tags,
        meta_title: content.seoTitle,
        meta_description: content.seoDescription,
      };

      // Set publish time if scheduled
      if (content.publishAt) {
        post.status = "scheduled";
        post.published_at = content.publishAt.toISOString();
      }

      const response = await this.makeRequest("/posts/", "POST", {
        posts: [post],
      });

      if (response.posts && response.posts[0]) {
        const publishedPost = response.posts[0];
        return {
          success: true,
          postId: publishedPost.id,
          url: publishedPost.url,
        };
      }

      return { success: false, error: "Failed to create post" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update existing post
   */
  async updatePost(
    postId: string,
    updates: Partial<GhostPost>
  ): Promise<GhostPublishResult> {
    try {
      const response = await this.makeRequest(`/posts/${postId}/`, "PUT", {
        posts: [updates],
      });

      if (response.posts && response.posts[0]) {
        return {
          success: true,
          postId: response.posts[0].id,
          url: response.posts[0].url,
        };
      }

      return { success: false, error: "Failed to update post" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest(`/posts/${postId}/`, "DELETE");
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get post by ID
   */
  async getPost(postId: string) {
    try {
      const response = await this.makeRequest(`/posts/${postId}/`, "GET");
      return response.posts?.[0];
    } catch (error) {
      console.error("Error fetching Ghost post:", error);
      return null;
    }
  }

  /**
   * Upload image to Ghost
   */
  async uploadImage(imageUrl: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Download image
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();

      // Upload to Ghost
      const formData = new FormData();
      formData.append("file", imageBlob);

      const token = this.generateJWT();
      const uploadUrl = `${this.config.siteUrl}/ghost/api/${this.apiVersion}/admin/images/upload/`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Ghost ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, url: data.images?.[0]?.url };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Make authenticated request to Ghost Admin API
   */
  private async makeRequest(endpoint: string, method: string, body?: any) {
    const token = this.generateJWT();
    const url = `${this.config.siteUrl}/ghost/api/${this.apiVersion}/admin${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Ghost ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ghost API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Generate JWT token for Ghost Admin API
   */
  private generateJWT(): string {
    // Ghost Admin API Key format: id:secret
    const [id, secret] = this.config.adminApiKey.split(":");

    if (!id || !secret) {
      throw new Error("Invalid Ghost Admin API key format");
    }

    // Create JWT header and payload
    const header = {
      alg: "HS256",
      typ: "JWT",
      kid: id,
    };

    const payload = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
      aud: "/admin/",
    };

    // Base64 encode
    const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");

    // Create signature
    const crypto = require("crypto");
    const signature = crypto
      .createHmac("sha256", Buffer.from(secret, "hex"))
      .update(`${base64Header}.${base64Payload}`)
      .digest("base64url");

    return `${base64Header}.${base64Payload}.${signature}`;
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
          cost: 0, // Ghost is free
          metadata: { action },
        },
      });
    } catch (error) {
      console.error("Error tracking Ghost usage:", error);
    }
  }
}
