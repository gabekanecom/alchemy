// Twitter/X Discovery Client
// Uses Twitter API v2

import { TwitterApi } from "twitter-api-v2";

export interface TwitterConfig {
  keywords: string[];
  hashtags?: string[];
  accounts?: string[]; // Username or user IDs to monitor
  maxResults: number;
  minLikes?: number;
  minRetweets?: number;
  includeReplies?: boolean;
}

export interface TwitterIdeaData {
  tweetId: string;
  text: string;
  authorUsername: string;
  authorName: string;
  authorFollowers: number;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  views?: number;
  hashtags: string[];
  mentions: string[];
  url: string;
  isThread: boolean;
  threadTweets?: string[];
}

export class TwitterDiscovery {
  private client: TwitterApi | null = null;
  private enabled: boolean;

  constructor() {
    // Only initialize if bearer token is provided
    this.enabled = !!process.env.TWITTER_BEARER_TOKEN;

    if (this.enabled) {
      this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
    }
  }

  async discoverIdeas(config: TwitterConfig): Promise<TwitterIdeaData[]> {
    if (!this.enabled || !this.client) {
      console.warn("Twitter client not configured");
      return [];
    }

    const ideas: TwitterIdeaData[] = [];

    // Build search query
    const queries: string[] = [];

    // Keywords
    if (config.keywords.length > 0) {
      queries.push(...config.keywords.map((kw) => `"${kw}"`));
    }

    // Hashtags
    if (config.hashtags && config.hashtags.length > 0) {
      queries.push(...config.hashtags.map((tag) => `#${tag.replace("#", "")}`));
    }

    // Search tweets
    for (const query of queries) {
      try {
        const tweets = await this.client.v2.search(query, {
          max_results: config.maxResults,
          "tweet.fields": ["created_at", "public_metrics", "entities", "conversation_id"],
          "user.fields": ["username", "name", "public_metrics"],
          expansions: ["author_id"],
        });

        for await (const tweet of tweets) {
          const metrics = tweet.public_metrics;

          if (!metrics) continue;

          // Filter by thresholds
          if (config.minLikes && metrics.like_count < config.minLikes) continue;
          if (config.minRetweets && metrics.retweet_count < config.minRetweets) continue;

          const author = tweets.includes.users?.find((u) => u.id === tweet.author_id);
          if (!author) continue;

          const hashtags = tweet.entities?.hashtags?.map((h) => h.tag) || [];
          const mentions = tweet.entities?.mentions?.map((m) => m.username) || [];

          ideas.push({
            tweetId: tweet.id,
            text: tweet.text,
            authorUsername: author.username,
            authorName: author.name,
            authorFollowers: author.public_metrics?.followers_count || 0,
            createdAt: tweet.created_at!,
            likes: metrics.like_count,
            retweets: metrics.retweet_count,
            replies: metrics.reply_count,
            views: metrics.impression_count,
            hashtags,
            mentions,
            url: `https://twitter.com/${author.username}/status/${tweet.id}`,
            isThread: false,
          });
        }
      } catch (error) {
        console.error(`Error fetching tweets for query "${query}":`, error);
      }
    }

    // Monitor specific accounts
    if (config.accounts && config.accounts.length > 0) {
      for (const username of config.accounts) {
        try {
          const user = await this.client.v2.userByUsername(username);
          if (!user.data) continue;

          const timeline = await this.client.v2.userTimeline(user.data.id, {
            max_results: config.maxResults,
            "tweet.fields": ["created_at", "public_metrics", "entities"],
          });

          for await (const tweet of timeline) {
            const metrics = tweet.public_metrics;
            if (!metrics) continue;

            ideas.push({
              tweetId: tweet.id,
              text: tweet.text,
              authorUsername: username,
              authorName: user.data.name,
              authorFollowers: user.data.public_metrics?.followers_count || 0,
              createdAt: tweet.created_at!,
              likes: metrics.like_count,
              retweets: metrics.retweet_count,
              replies: metrics.reply_count,
              hashtags: tweet.entities?.hashtags?.map((h) => h.tag) || [],
              mentions: tweet.entities?.mentions?.map((m) => m.username) || [],
              url: `https://twitter.com/${username}/status/${tweet.id}`,
              isThread: false,
            });
          }
        } catch (error) {
          console.error(`Error fetching timeline for @${username}:`, error);
        }
      }
    }

    return ideas;
  }

  calculateViralityScore(data: TwitterIdeaData): number {
    // Engagement scoring
    const likeScore = Math.min((data.likes / 1000) * 25, 25); // Max 25 points
    const retweetScore = Math.min((data.retweets / 500) * 25, 25); // Max 25 points
    const replyScore = Math.min((data.replies / 100) * 20, 20); // Max 20 points

    // Author influence bonus
    const influenceBonus = Math.min((data.authorFollowers / 100000) * 10, 10); // Max 10 points

    // Recency bonus
    const hoursAgo = (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60);
    const recencyBonus = hoursAgo < 24 ? 20 - (hoursAgo / 24) * 20 : 0; // Max 20 points

    return Math.min(
      likeScore + retweetScore + replyScore + influenceBonus + recencyBonus,
      100
    );
  }
}
