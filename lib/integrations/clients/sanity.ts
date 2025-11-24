// Sanity CMS Publishing Client

import { createClient } from "@sanity/client";
import { PublishingClient, PublishContent, PublishResponse, PublishStatus } from "./base";

export class SanityClient implements PublishingClient {
  private client: any;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.client = createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      token: config.token,
      apiVersion: config.apiVersion || "2023-05-03",
      useCdn: false,
    });
  }

  async publish(content: PublishContent): Promise<PublishResponse> {
    const doc = {
      _type: "post",
      title: content.title,
      body: content.body,
      excerpt: content.excerpt,
      categories: content.categories?.map((cat) => ({ _type: "reference", _ref: cat })),
      tags: content.tags,
      publishedAt: content.status === "publish" ? new Date().toISOString() : undefined,
      ...content.metadata,
    };

    const result = await this.client.create(doc);

    return {
      postId: result._id,
      url: `https://${this.config.projectId}.sanity.studio/desk/post;${result._id}`,
      status: content.status || "draft",
    };
  }

  async update(postId: string, content: Partial<PublishContent>): Promise<PublishResponse> {
    const result = await this.client
      .patch(postId)
      .set({
        title: content.title,
        body: content.body,
        excerpt: content.excerpt,
        ...(content.metadata || {}),
      })
      .commit();

    return {
      postId: result._id,
      url: `https://${this.config.projectId}.sanity.studio/desk/post;${result._id}`,
      status: "updated",
    };
  }

  async delete(postId: string): Promise<void> {
    await this.client.delete(postId);
  }

  async getStatus(postId: string): Promise<PublishStatus> {
    const doc = await this.client.getDocument(postId);

    return {
      postId: doc._id,
      status: doc.publishedAt ? "published" : "draft",
      url: `https://${this.config.projectId}.sanity.studio/desk/post;${doc._id}`,
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
    };
  }

  // Simplified publishPost method for direct publishing
  async publishPost(data: { title: string; body: string; excerpt?: string | null; metadata?: any; seoData?: any }): Promise<{ id: string; url: string }> {
    const doc = {
      _type: "post",
      title: data.title,
      body: data.body,
      excerpt: data.excerpt || "",
      slug: {
        _type: "slug",
        current: data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      },
      publishedAt: new Date().toISOString(),
      ...(data.metadata || {}),
    };

    const result = await this.client.create(doc);

    return {
      id: result._id,
      url: `https://${this.config.projectId}.sanity.studio/desk/post;${result._id}`,
    };
  }
}
