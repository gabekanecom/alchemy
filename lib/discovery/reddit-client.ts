// Reddit Discovery Client - Simplified Implementation
// Uses Snoowrap for Reddit API access

import Snoowrap from "snoowrap";

export interface RedditConfig {
  subreddits: string[];
  sortBy: "hot" | "new" | "top" | "rising";
  timeRange?: "hour" | "day" | "week" | "month" | "year" | "all";
  limit: number;
  minUpvotes?: number;
  minComments?: number;
  keywords?: string[];
}

export interface RedditIdeaData {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author: string;
  url: string;
  permalink: string;
  upvotes: number;
  upvoteRatio: number;
  numComments: number;
  createdUtc: number;
  flair?: string;
}

export class RedditDiscovery {
  private reddit: Snoowrap | null = null;

  constructor() {
    // Only initialize if credentials are provided
    if (
      process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SECRET &&
      process.env.REDDIT_USER_AGENT
    ) {
      this.reddit = new Snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT,
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME || "",
        password: process.env.REDDIT_PASSWORD || "",
      });
    }
  }

  async discoverIdeas(config: RedditConfig): Promise<RedditIdeaData[]> {
    if (!this.reddit) {
      console.warn("Reddit client not configured");
      return [];
    }

    const ideas: RedditIdeaData[] = [];

    for (const subreddit of config.subreddits) {
      try {
        let submissions: any[];

        switch (config.sortBy) {
          case "hot":
            submissions = await this.reddit.getSubreddit(subreddit).getHot({ limit: config.limit });
            break;
          case "new":
            submissions = await this.reddit.getSubreddit(subreddit).getNew({ limit: config.limit });
            break;
          case "rising":
            submissions = await this.reddit
              .getSubreddit(subreddit)
              .getRising({ limit: config.limit });
            break;
          case "top":
            submissions = await this.reddit.getSubreddit(subreddit).getTop({
              time: config.timeRange || "week",
              limit: config.limit,
            });
            break;
          default:
            submissions = [];
        }

        for (const post of submissions) {
          // Filter by minimum thresholds
          if (config.minUpvotes && post.ups < config.minUpvotes) continue;
          if (config.minComments && post.num_comments < config.minComments) continue;

          // Filter by keywords if provided
          if (config.keywords && config.keywords.length > 0) {
            const text = `${post.title} ${post.selftext}`.toLowerCase();
            const hasKeyword = config.keywords.some((keyword) =>
              text.includes(keyword.toLowerCase())
            );
            if (!hasKeyword) continue;
          }

          ideas.push({
            id: post.id,
            title: post.title,
            selftext: post.selftext,
            subreddit: post.subreddit.display_name,
            author: post.author.name,
            url: post.url,
            permalink: `https://reddit.com${post.permalink}`,
            upvotes: post.ups,
            upvoteRatio: post.upvote_ratio,
            numComments: post.num_comments,
            createdUtc: post.created_utc,
            flair: post.link_flair_text,
          });
        }
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error);
      }
    }

    return ideas;
  }

  calculateViralityScore(data: RedditIdeaData): number {
    // Weighted scoring based on engagement
    const upvoteScore = Math.min((data.upvotes / 1000) * 30, 30); // Max 30 points
    const ratioScore = data.upvoteRatio * 20; // Max 20 points
    const commentScore = Math.min((data.numComments / 100) * 20, 20); // Max 20 points

    // Recency bonus (posts < 24 hours old)
    const hoursAgo = (Date.now() / 1000 - data.createdUtc) / 3600;
    const recencyBonus = hoursAgo < 24 ? 30 - (hoursAgo / 24) * 30 : 0; // Max 30 points

    return Math.min(upvoteScore + ratioScore + commentScore + recencyBonus, 100);
  }
}
