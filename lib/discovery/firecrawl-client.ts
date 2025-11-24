// Firecrawl Web Scraping Client
// Scrapes competitor blogs, news sites, and industry publications

import FirecrawlApp from "@mendable/firecrawl-js";

export interface FirecrawlConfig {
  urls: string[]; // URLs to scrape
  maxResults: number;
  includeSubpages?: boolean; // Crawl subpages
  extractKeywords?: boolean;
}

export interface FirecrawlIdeaData {
  url: string;
  title: string;
  description: string;
  content: string;
  author?: string;
  publishedDate?: string;
  keywords: string[];
  wordCount: number;
  images: string[];
  links: string[];
}

export class FirecrawlDiscovery {
  private firecrawl: FirecrawlApp | null = null;
  private enabled: boolean;

  constructor() {
    // Only initialize if API key is provided
    this.enabled = !!process.env.FIRECRAWL_API_KEY;

    if (this.enabled) {
      this.firecrawl = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY!,
      });
    }
  }

  async discoverIdeas(config: FirecrawlConfig): Promise<FirecrawlIdeaData[]> {
    if (!this.enabled || !this.firecrawl) {
      console.warn("Firecrawl client not configured");
      // Return simulated data for demo
      return this.generateSimulatedData(config);
    }

    const ideas: FirecrawlIdeaData[] = [];

    for (const url of config.urls) {
      try {
        if (config.includeSubpages) {
          // Crawl the website
          const crawlResult = await this.firecrawl.crawlUrl(url, {
            limit: config.maxResults,
            scrapeOptions: {
              formats: ["markdown", "html"],
            },
          });

          if (crawlResult.success && crawlResult.data) {
            for (const page of crawlResult.data) {
              const ideaData = this.extractIdeaFromPage(page);
              if (ideaData) ideas.push(ideaData);
            }
          }
        } else {
          // Single page scrape
          const scrapeResult = await this.firecrawl.scrapeUrl(url, {
            formats: ["markdown", "html"],
          });

          if (scrapeResult.success && scrapeResult.data) {
            const ideaData = this.extractIdeaFromPage(scrapeResult.data);
            if (ideaData) ideas.push(ideaData);
          }
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    return ideas;
  }

  private extractIdeaFromPage(page: any): FirecrawlIdeaData | null {
    try {
      const markdown = page.markdown || "";
      const html = page.html || "";
      const metadata = page.metadata || {};

      // Extract title
      const title = metadata.title || metadata.ogTitle || this.extractTitleFromContent(markdown);

      // Extract description
      const description =
        metadata.description || metadata.ogDescription || this.extractDescriptionFromContent(markdown);

      // Extract keywords
      const keywords = this.extractKeywords(markdown, title);

      // Count words
      const wordCount = markdown.split(/\s+/).length;

      // Extract images
      const images = metadata.ogImage ? [metadata.ogImage] : [];

      // Extract links (simplified)
      const links: string[] = [];

      if (!title) return null;

      return {
        url: metadata.sourceURL || page.url || "",
        title,
        description,
        content: markdown,
        author: metadata.author,
        publishedDate: metadata.publishedTime,
        keywords,
        wordCount,
        images,
        links,
      };
    } catch (error) {
      console.error("Error extracting idea from page:", error);
      return null;
    }
  }

  private extractTitleFromContent(content: string): string {
    // Extract first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    return headingMatch ? headingMatch[1] : "Untitled";
  }

  private extractDescriptionFromContent(content: string): string {
    // Extract first paragraph
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    for (const line of lines) {
      if (!line.startsWith("#") && line.length > 50) {
        return line.slice(0, 200);
      }
    }
    return "";
  }

  private extractKeywords(content: string, title: string): string[] {
    // Simple keyword extraction (in production, use NLP library)
    const text = `${title} ${content}`.toLowerCase();
    const words = text.match(/\b[a-z]{4,}\b/g) || [];

    // Count word frequency
    const frequency: Record<string, number> = {};
    for (const word of words) {
      if (this.isStopWord(word)) continue;
      frequency[word] = (frequency[word] || 0) + 1;
    }

    // Get top keywords
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
    ]);
    return stopWords.has(word);
  }

  private generateSimulatedData(config: FirecrawlConfig): FirecrawlIdeaData[] {
    // Generate realistic simulated content ideas
    const topics = [
      "AI and Machine Learning",
      "Content Marketing Strategy",
      "Social Media Growth",
      "SEO Best Practices",
      "Email Marketing",
      "Video Content Creation",
      "Influencer Marketing",
      "Brand Storytelling",
    ];

    const ideas: FirecrawlIdeaData[] = [];

    for (let i = 0; i < Math.min(config.maxResults, config.urls.length * 3); i++) {
      const topic = topics[i % topics.length];
      const url = config.urls[i % config.urls.length];

      ideas.push({
        url: `${url}/blog/article-${i + 1}`,
        title: `The Ultimate Guide to ${topic} in 2024`,
        description: `Learn how to master ${topic.toLowerCase()} with proven strategies and actionable tips from industry experts.`,
        content: `# The Ultimate Guide to ${topic} in 2024\n\nIn this comprehensive guide, we'll explore the latest trends and best practices for ${topic.toLowerCase()}...`,
        author: "Industry Expert",
        publishedDate: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        keywords: [
          topic.toLowerCase().split(" ")[0],
          "marketing",
          "strategy",
          "growth",
          "2024",
        ],
        wordCount: 1500 + Math.floor(Math.random() * 1000),
        images: [`${url}/images/hero-${i + 1}.jpg`],
        links: [],
      });
    }

    return ideas;
  }

  calculateViralityScore(data: FirecrawlIdeaData): number {
    // Content quality-based scoring
    const wordCountScore = Math.min((data.wordCount / 2000) * 30, 30); // Max 30 points

    // Keyword density (more keywords = better SEO potential)
    const keywordScore = Math.min((data.keywords.length / 10) * 20, 20); // Max 20 points

    // Recency bonus
    const daysAgo = data.publishedDate
      ? (Date.now() - new Date(data.publishedDate).getTime()) / (1000 * 60 * 60 * 24)
      : 365;
    const recencyBonus = daysAgo < 30 ? 30 - daysAgo : 0; // Max 30 points

    // Image bonus (visual content performs better)
    const imageBonus = Math.min(data.images.length * 5, 20); // Max 20 points

    return Math.min(wordCountScore + keywordScore + recencyBonus + imageBonus, 100);
  }
}
