// SEO Keyword Research Client
// Simplified implementation - can be extended with DataForSEO, SEMrush, or Ahrefs APIs

import axios from "axios";

export interface SEOConfig {
  targetKeywords: string[];
  competitorDomains?: string[];
  location?: string; // e.g., "United States"
  language?: string; // e.g., "en"
}

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number; // 0-100
  cpc: number; // Cost per click (estimated)
  competition: number; // 0-1
  trend: number[]; // Last 12 months
  relatedKeywords: string[];
  questions: string[];
  suggestions: string[];
}

export class SEODiscovery {
  private enabled: boolean;

  constructor() {
    // Check if any SEO API is configured
    this.enabled =
      !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) ||
      !!process.env.SERP_API_KEY;
  }

  async discoverKeywords(config: SEOConfig): Promise<KeywordData[]> {
    const keywordData: KeywordData[] = [];

    for (const keyword of config.targetKeywords) {
      try {
        // If DataForSEO is configured, use it
        if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
          const data = await this.getKeywordDataFromDataForSEO(keyword, config.location);
          keywordData.push(data);
        } else {
          // Otherwise, generate simulated data based on keyword analysis
          const data = await this.generateKeywordData(keyword);
          keywordData.push(data);
        }
      } catch (error) {
        console.error(`Error fetching SEO data for "${keyword}":`, error);
      }
    }

    return keywordData;
  }

  private async getKeywordDataFromDataForSEO(
    keyword: string,
    location?: string
  ): Promise<KeywordData> {
    // DataForSEO implementation (if credentials are provided)
    const baseUrl = "https://api.dataforseo.com/v3";
    const auth = {
      username: process.env.DATAFORSEO_LOGIN!,
      password: process.env.DATAFORSEO_PASSWORD!,
    };

    try {
      // Get keyword metrics
      const metricsResponse = await axios.post(
        `${baseUrl}/keywords_data/google_ads/search_volume/live`,
        [
          {
            keywords: [keyword],
            location_code: 2840, // US
            language_code: "en",
          },
        ],
        { auth }
      );

      const data = metricsResponse.data.tasks?.[0]?.result?.[0];

      return {
        keyword,
        searchVolume: data?.search_volume || 0,
        difficulty: this.estimateDifficulty(data?.competition || 0),
        cpc: data?.cpc || 0,
        competition: data?.competition || 0,
        trend: data?.monthly_searches?.map((m: any) => m.search_volume) || [],
        relatedKeywords: [],
        questions: [],
        suggestions: [],
      };
    } catch (error) {
      console.error("DataForSEO API error:", error);
      return this.generateKeywordData(keyword);
    }
  }

  private async generateKeywordData(keyword: string): Promise<KeywordData> {
    // Generate realistic simulated data based on keyword characteristics
    const wordCount = keyword.split(" ").length;
    const hasQuestionWords = /^(how|what|why|when|where|who|which)/i.test(keyword);

    // Estimate search volume (long-tail keywords have lower volume)
    let baseVolume = 10000;
    if (wordCount === 1) baseVolume = 50000;
    else if (wordCount === 2) baseVolume = 20000;
    else if (wordCount === 3) baseVolume = 8000;
    else baseVolume = 2000;

    const searchVolume = Math.floor(baseVolume * (0.5 + Math.random() * 0.5));

    // Difficulty (shorter keywords are usually harder to rank for)
    const baseDifficulty = wordCount === 1 ? 80 : wordCount === 2 ? 60 : wordCount === 3 ? 40 : 25;
    const difficulty = Math.min(100, baseDifficulty + Math.floor(Math.random() * 20));

    // Competition (inversely related to word count)
    const competition = Math.min(1, (100 - wordCount * 15 + Math.random() * 20) / 100);

    // CPC (informational keywords have lower CPC)
    const baseCPC = hasQuestionWords ? 0.5 : 2.0;
    const cpc = parseFloat((baseCPC * (0.5 + Math.random())).toFixed(2));

    // Generate trend data (simulate 12 months)
    const trend = Array.from({ length: 12 }, () =>
      Math.floor(searchVolume * (0.7 + Math.random() * 0.6))
    );

    // Generate related keywords
    const relatedKeywords = this.generateRelatedKeywords(keyword);

    // Generate question variations
    const questions = this.generateQuestions(keyword);

    // Generate suggestions
    const suggestions = this.generateSuggestions(keyword);

    return {
      keyword,
      searchVolume,
      difficulty,
      cpc,
      competition,
      trend,
      relatedKeywords,
      questions,
      suggestions,
    };
  }

  private generateRelatedKeywords(keyword: string): string[] {
    const words = keyword.split(" ");
    const related: string[] = [];

    // Add modifier variations
    const modifiers = ["best", "top", "free", "online", "guide", "tutorial", "tips"];
    for (const modifier of modifiers.slice(0, 5)) {
      related.push(`${modifier} ${keyword}`);
    }

    // Add suffix variations
    const suffixes = ["tools", "software", "app", "service", "platform"];
    if (words.length < 3) {
      for (const suffix of suffixes.slice(0, 3)) {
        related.push(`${keyword} ${suffix}`);
      }
    }

    return related.slice(0, 10);
  }

  private generateQuestions(keyword: string): string[] {
    const questions = [
      `How to ${keyword}`,
      `What is ${keyword}`,
      `Why ${keyword}`,
      `When to use ${keyword}`,
      `Where to find ${keyword}`,
    ];

    return questions.slice(0, 5);
  }

  private generateSuggestions(keyword: string): string[] {
    const words = keyword.split(" ");
    const suggestions: string[] = [];

    // Add year
    suggestions.push(`${keyword} 2024`);
    suggestions.push(`${keyword} 2025`);

    // Add comparison
    if (words.length <= 2) {
      suggestions.push(`${keyword} vs`);
      suggestions.push(`${keyword} alternative`);
    }

    // Add intent modifiers
    suggestions.push(`${keyword} for beginners`);
    suggestions.push(`${keyword} examples`);

    return suggestions.slice(0, 8);
  }

  private estimateDifficulty(competition: number): number {
    // Convert competition (0-1) to difficulty (0-100)
    return Math.round(competition * 100);
  }

  calculateCompetitionScore(data: KeywordData): number {
    // Inverse scoring: lower difficulty = higher score
    return 100 - data.difficulty;
  }

  calculateTimelinessScore(data: KeywordData): number {
    // Based on trend data
    if (!data.trend || data.trend.length < 2) return 50;

    const recent = data.trend.slice(-3);
    const older = data.trend.slice(0, 3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const growth = recentAvg / olderAvg;

    if (growth > 1.5) return 100; // Strong upward trend
    if (growth > 1.2) return 80;
    if (growth > 1.0) return 60;
    if (growth > 0.8) return 40;
    return 20; // Declining
  }

  calculateViralityScore(data: KeywordData): number {
    // SEO virality based on search volume and trend
    const volumeScore = Math.min((data.searchVolume / 10000) * 50, 50); // Max 50 points
    const trendScore = this.calculateTimelinessScore(data) * 0.5; // Max 50 points

    return Math.min(volumeScore + trendScore, 100);
  }
}
