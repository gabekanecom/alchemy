// Idea Discovery Scoring System

export interface ScoringWeights {
  virality: number; // 0-1
  relevance: number; // 0-1
  competition: number; // 0-1
  timeliness: number; // 0-1
}

export interface IdeaScores {
  viralityScore: number;
  relevanceScore: number;
  competitionScore: number;
  timelinessScore: number;
  overallScore: number;
}

export function calculateOverallScore(
  scores: Omit<IdeaScores, "overallScore">,
  weights: ScoringWeights
): number {
  // Ensure weights sum to 1
  const totalWeight =
    weights.virality + weights.relevance + weights.competition + weights.timeliness;
  const normalizedWeights = {
    virality: weights.virality / totalWeight,
    relevance: weights.relevance / totalWeight,
    competition: weights.competition / totalWeight,
    timeliness: weights.timeliness / totalWeight,
  };

  const overall =
    scores.viralityScore * normalizedWeights.virality +
    scores.relevanceScore * normalizedWeights.relevance +
    scores.competitionScore * normalizedWeights.competition +
    scores.timelinessScore * normalizedWeights.timeliness;

  return Math.round(overall * 100) / 100; // Round to 2 decimals
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  virality: 0.3,
  relevance: 0.3,
  competition: 0.2,
  timeliness: 0.2,
};

export function categorizePriority(overallScore: number): string {
  if (overallScore >= 80) return "urgent";
  if (overallScore >= 65) return "high";
  if (overallScore >= 50) return "medium";
  return "low";
}

export function determineTrendDirection(trendData?: number[]): string {
  if (!trendData || trendData.length < 2) return "stable";

  const recent = trendData.slice(-3);
  const older = trendData.slice(0, 3);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const change = (recentAvg - olderAvg) / olderAvg;

  if (change > 0.2) return "rising";
  if (change < -0.2) return "declining";
  return "stable";
}
