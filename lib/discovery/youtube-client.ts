// YouTube Discovery Client
// Uses Google APIs for YouTube Data API v3

import { google } from "googleapis";

export interface YouTubeConfig {
  channels?: string[]; // Channel IDs
  keywords: string[];
  maxResults: number;
  publishedAfter?: Date; // Only videos after this date
  minViews?: number;
  minEngagementRate?: number; // (likes + comments) / views
  videoDuration?: "short" | "medium" | "long" | "any";
}

export interface YouTubeIdeaData {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  tags: string[];
  categoryId: string;
  url: string;
}

export class YouTubeDiscovery {
  private youtube;
  private enabled: boolean;

  constructor() {
    // Only initialize if API key is provided
    this.enabled = !!process.env.YOUTUBE_API_KEY;

    if (this.enabled) {
      this.youtube = google.youtube({
        version: "v3",
        auth: process.env.YOUTUBE_API_KEY,
      });
    }
  }

  async discoverIdeas(config: YouTubeConfig): Promise<YouTubeIdeaData[]> {
    if (!this.enabled || !this.youtube) {
      console.warn("YouTube client not configured");
      return [];
    }

    const ideas: YouTubeIdeaData[] = [];

    // Search by keywords
    for (const keyword of config.keywords) {
      try {
        const searchResponse = await this.youtube.search.list({
          part: ["snippet"],
          q: keyword,
          type: ["video"],
          maxResults: config.maxResults,
          order: "viewCount", // or 'date', 'rating', 'relevance'
          publishedAfter: config.publishedAfter?.toISOString(),
          videoDuration: config.videoDuration,
        });

        const videoIds =
          searchResponse.data.items?.map((item) => item.id?.videoId).filter(Boolean) || [];

        if (videoIds.length === 0) continue;

        // Get detailed statistics
        const videosResponse = await this.youtube.videos.list({
          part: ["snippet", "statistics", "contentDetails"],
          id: videoIds,
        });

        for (const video of videosResponse.data.items || []) {
          const stats = video.statistics;
          const snippet = video.snippet;

          if (!stats || !snippet) continue;

          const views = parseInt(stats.viewCount || "0");
          const likes = parseInt(stats.likeCount || "0");
          const comments = parseInt(stats.commentCount || "0");

          // Filter by minimum thresholds
          if (config.minViews && views < config.minViews) continue;

          const engagementRate = views > 0 ? (likes + comments) / views : 0;
          if (config.minEngagementRate && engagementRate < config.minEngagementRate) continue;

          ideas.push({
            videoId: video.id!,
            title: snippet.title!,
            description: snippet.description!,
            channelTitle: snippet.channelTitle!,
            channelId: snippet.channelId!,
            thumbnailUrl: snippet.thumbnails?.high?.url || "",
            publishedAt: snippet.publishedAt!,
            views,
            likes,
            comments,
            duration: video.contentDetails?.duration || "",
            tags: snippet.tags || [],
            categoryId: snippet.categoryId || "",
            url: `https://www.youtube.com/watch?v=${video.id}`,
          });
        }
      } catch (error) {
        console.error(`Error fetching YouTube data for keyword "${keyword}":`, error);
      }
    }

    // If specific channels provided, get their recent uploads
    if (config.channels && config.channels.length > 0) {
      for (const channelId of config.channels) {
        try {
          const channelVideos = await this.getChannelRecentVideos(channelId, config.maxResults);
          ideas.push(...channelVideos);
        } catch (error) {
          console.error(`Error fetching channel ${channelId}:`, error);
        }
      }
    }

    return ideas;
  }

  private async getChannelRecentVideos(
    channelId: string,
    maxResults: number
  ): Promise<YouTubeIdeaData[]> {
    if (!this.youtube) return [];

    // Get channel's uploads playlist
    const channelResponse = await this.youtube.channels.list({
      part: ["contentDetails"],
      id: [channelId],
    });

    const uploadsPlaylistId =
      channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return [];

    // Get videos from uploads playlist
    const playlistResponse = await this.youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: uploadsPlaylistId,
      maxResults,
    });

    const videoIds =
      playlistResponse.data.items
        ?.map((item) => item.snippet?.resourceId?.videoId)
        .filter(Boolean) || [];

    if (videoIds.length === 0) return [];

    // Get detailed video data
    const videosResponse = await this.youtube.videos.list({
      part: ["snippet", "statistics", "contentDetails"],
      id: videoIds,
    });

    return (videosResponse.data.items || []).map((video) => ({
      videoId: video.id!,
      title: video.snippet!.title!,
      description: video.snippet!.description!,
      channelTitle: video.snippet!.channelTitle!,
      channelId: video.snippet!.channelId!,
      thumbnailUrl: video.snippet!.thumbnails?.high?.url || "",
      publishedAt: video.snippet!.publishedAt!,
      views: parseInt(video.statistics?.viewCount || "0"),
      likes: parseInt(video.statistics?.likeCount || "0"),
      comments: parseInt(video.statistics?.commentCount || "0"),
      duration: video.contentDetails?.duration || "",
      tags: video.snippet!.tags || [],
      categoryId: video.snippet!.categoryId || "",
      url: `https://www.youtube.com/watch?v=${video.id}`,
    }));
  }

  calculateViralityScore(data: YouTubeIdeaData): number {
    // View-based scoring
    const viewScore = Math.min((data.views / 100000) * 30, 30); // Max 30 points

    // Engagement rate: (likes + comments) / views
    const engagementRate = data.views > 0 ? (data.likes + data.comments) / data.views : 0;
    const engagementScore = Math.min(engagementRate * 10000, 40); // Max 40 points

    // Recency bonus
    const daysAgo =
      (Date.now() - new Date(data.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBonus = daysAgo < 7 ? 30 - (daysAgo / 7) * 30 : 0; // Max 30 points

    return Math.min(viewScore + engagementScore + recencyBonus, 100);
  }
}
