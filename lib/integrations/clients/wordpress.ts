// WordPress Publishing Client

import axios from "axios";
import { PublishingClient, PublishContent, PublishResponse, PublishStatus } from "./base";

export class WordPressClient implements PublishingClient {
  private config: any;
  private auth: string;

  constructor(config: any) {
    this.config = config;
    // WordPress Application Password is sent as Basic Auth
    this.auth = Buffer.from(`${config.username}:${config.applicationPassword}`).toString("base64");
  }

  private get baseUrl() {
    return `${this.config.siteUrl}/wp-json/wp/v2`;
  }

  async publish(content: PublishContent): Promise<PublishResponse> {
    const response = await axios.post(
      `${this.baseUrl}/posts`,
      {
        title: content.title,
        content: content.body,
        excerpt: content.excerpt,
        status: content.status || this.config.defaultSettings?.status || "draft",
        categories: content.categories,
        tags: content.tags,
        date: content.scheduledFor?.toISOString(),
        featured_media: content.featuredImage,
      },
      {
        headers: {
          Authorization: `Basic ${this.auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      postId: response.data.id.toString(),
      url: response.data.link,
      status: response.data.status,
    };
  }

  async update(postId: string, content: Partial<PublishContent>): Promise<PublishResponse> {
    const response = await axios.post(
      `${this.baseUrl}/posts/${postId}`,
      {
        title: content.title,
        content: content.body,
        excerpt: content.excerpt,
        status: content.status,
      },
      {
        headers: {
          Authorization: `Basic ${this.auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      postId: response.data.id.toString(),
      url: response.data.link,
      status: response.data.status,
    };
  }

  async delete(postId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/posts/${postId}`, {
      headers: {
        Authorization: `Basic ${this.auth}`,
      },
    });
  }

  async getStatus(postId: string): Promise<PublishStatus> {
    const response = await axios.get(`${this.baseUrl}/posts/${postId}`, {
      headers: {
        Authorization: `Basic ${this.auth}`,
      },
    });

    return {
      postId: response.data.id.toString(),
      status: response.data.status,
      url: response.data.link,
      publishedAt: response.data.date ? new Date(response.data.date) : undefined,
    };
  }

  // Simplified publishPost method for direct publishing
  async publishPost(data: { title: string; body: string; excerpt?: string | null; metadata?: any; seoData?: any }): Promise<{ id: string; postId?: string; url: string }> {
    const response = await axios.post(
      `${this.baseUrl}/posts`,
      {
        title: data.title,
        content: data.body,
        excerpt: data.excerpt || "",
        status: "publish",
        ...(data.metadata || {}),
      },
      {
        headers: {
          Authorization: `Basic ${this.auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      id: response.data.id.toString(),
      postId: response.data.id.toString(),
      url: response.data.link,
    };
  }
}
