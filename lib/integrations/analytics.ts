/**
 * Integration Usage Analytics
 * Helper functions for calculating costs and analyzing usage patterns
 */

import { prisma } from "@/lib/db/client";

export interface CostEstimate {
  estimatedCost: number;
  provider: string;
  model?: string;
  breakdown: {
    inputCost: number;
    outputCost: number;
    fixedCost?: number;
  };
}

/**
 * Estimate cost for text generation based on token count
 */
export function estimateTextGenerationCost(
  provider: string,
  inputTokens: number,
  outputTokens: number,
  model?: string
): CostEstimate {
  const pricing: Record<string, any> = {
    anthropic: {
      "claude-sonnet-4-20250514": { input: 3, output: 15 }, // per million tokens
      "claude-opus-4-20250514": { input: 15, output: 75 },
      "claude-sonnet-3.5-20241022": { input: 3, output: 15 },
    },
    openai: {
      "gpt-4o": { input: 2.5, output: 10 },
      "gpt-4o-mini": { input: 0.15, output: 0.6 },
      "gpt-4-turbo": { input: 10, output: 30 },
    },
    google: {
      "gemini-2.0-flash-exp": { input: 0, output: 0 }, // Free during preview
      "gemini-1.5-pro": { input: 1.25, output: 5 },
      "gemini-1.5-flash": { input: 0.075, output: 0.3 },
    },
  };

  const providerPricing = pricing[provider];
  if (!providerPricing) {
    return {
      estimatedCost: 0,
      provider,
      model,
      breakdown: { inputCost: 0, outputCost: 0 },
    };
  }

  // Use specific model pricing or default to first model
  const modelPricing = model ? providerPricing[model] : Object.values(providerPricing)[0];

  const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

  return {
    estimatedCost: inputCost + outputCost,
    provider,
    model,
    breakdown: {
      inputCost,
      outputCost,
    },
  };
}

/**
 * Estimate cost for image generation
 */
export function estimateImageGenerationCost(
  provider: string,
  resolution: string,
  quality?: string
): CostEstimate {
  const pricing: Record<string, any> = {
    dalle: {
      "1024x1024": { standard: 0.04, hd: 0.08 },
      "1792x1024": { standard: 0.08, hd: 0.12 },
      "1024x1792": { standard: 0.08, hd: 0.12 },
    },
  };

  const providerPricing = pricing[provider];
  if (!providerPricing || !providerPricing[resolution]) {
    return {
      estimatedCost: 0,
      provider,
      breakdown: { inputCost: 0, outputCost: 0, fixedCost: 0 },
    };
  }

  const cost = providerPricing[resolution][quality || "standard"] || 0;

  return {
    estimatedCost: cost,
    provider,
    breakdown: {
      inputCost: 0,
      outputCost: 0,
      fixedCost: cost,
    },
  };
}

/**
 * Calculate projected monthly cost based on usage patterns
 */
export async function calculateMonthlyProjection(userId: string): Promise<{
  currentMonthCost: number;
  projectedMonthlyCost: number;
  averageDailyCost: number;
  daysInMonth: number;
  daysElapsed: number;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();

  const monthUsage = await prisma.integrationUsage.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
    select: {
      cost: true,
    },
  });

  const currentMonthCost = monthUsage.reduce((sum, record) => sum + record.cost, 0);
  const averageDailyCost = currentMonthCost / daysElapsed;
  const projectedMonthlyCost = averageDailyCost * daysInMonth;

  return {
    currentMonthCost,
    projectedMonthlyCost,
    averageDailyCost,
    daysInMonth,
    daysElapsed,
  };
}

/**
 * Get cost optimization recommendations
 */
export async function getCostOptimizationRecommendations(
  userId: string
): Promise<Array<{ type: string; message: string; potentialSavings?: number }>> {
  const recommendations: Array<{ type: string; message: string; potentialSavings?: number }> = [];

  // Get usage data for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usageRecords = await prisma.integrationUsage.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      integration: true,
    },
  });

  // Check for high-cost, low-success operations
  const byIntegration = usageRecords.reduce((acc, record) => {
    const key = record.integrationId;
    if (!acc[key]) {
      acc[key] = {
        integration: record.integration,
        totalCost: 0,
        failures: 0,
        total: 0,
      };
    }
    acc[key].totalCost += record.cost;
    acc[key].total += 1;
    if (!record.success) acc[key].failures += 1;
    return acc;
  }, {} as Record<string, any>);

  // Recommendation: High failure rate
  Object.values(byIntegration).forEach((data: any) => {
    const failureRate = data.total > 0 ? (data.failures / data.total) * 100 : 0;
    if (failureRate > 20 && data.total > 10) {
      recommendations.push({
        type: "high_failure_rate",
        message: `${data.integration.displayName} has a ${failureRate.toFixed(1)}% failure rate. Check your API key and configuration.`,
        potentialSavings: data.totalCost * (failureRate / 100),
      });
    }
  });

  // Recommendation: Consider cheaper alternatives
  const anthropicUsage = usageRecords.filter(
    (r) => r.integration.provider === "anthropic" && r.operation === "text_generation"
  );
  if (anthropicUsage.length > 100) {
    const anthropicCost = anthropicUsage.reduce((sum, r) => sum + r.cost, 0);
    const potentialSavings = anthropicCost * 0.4; // Roughly 40% cheaper with Gemini Flash

    recommendations.push({
      type: "cheaper_alternative",
      message: `You're using Claude heavily for text generation. Consider Google Gemini Flash for non-critical tasks to save ~40%.`,
      potentialSavings,
    });
  }

  // Recommendation: Set rate limits
  const highVolumeIntegrations = Object.values(byIntegration).filter(
    (data: any) => data.total > 1000
  );
  if (highVolumeIntegrations.length > 0) {
    highVolumeIntegrations.forEach((data: any) => {
      if (!data.integration.dailyLimit) {
        recommendations.push({
          type: "set_rate_limits",
          message: `${data.integration.displayName} has high usage (${data.total} calls). Set daily/monthly limits to prevent unexpected costs.`,
        });
      }
    });
  }

  return recommendations;
}

/**
 * Calculate cost per content piece
 */
export async function calculateContentGenerationCosts(
  userId: string,
  contentId?: string
): Promise<{
  totalCost: number;
  breakdown: {
    research: number;
    generation: number;
    images: number;
    publishing: number;
  };
}> {
  const whereClause: any = {
    userId,
  };

  if (contentId) {
    whereClause.metadata = {
      path: ["contentId"],
      equals: contentId,
    };
  }

  const usageRecords = await prisma.integrationUsage.findMany({
    where: whereClause,
  });

  const breakdown = {
    research: 0,
    generation: 0,
    images: 0,
    publishing: 0,
  };

  usageRecords.forEach((record) => {
    const operation = record.operation;
    if (operation.includes("research") || operation.includes("analysis")) {
      breakdown.research += record.cost;
    } else if (operation.includes("generation") || operation.includes("text")) {
      breakdown.generation += record.cost;
    } else if (operation.includes("image")) {
      breakdown.images += record.cost;
    } else if (operation.includes("publish")) {
      breakdown.publishing += record.cost;
    }
  });

  const totalCost = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);

  return {
    totalCost,
    breakdown,
  };
}

/**
 * Get usage trends (comparing periods)
 */
export async function getUsageTrends(
  userId: string,
  days: number = 30
): Promise<{
  currentPeriod: { cost: number; operations: number };
  previousPeriod: { cost: number; operations: number };
  percentageChange: { cost: number; operations: number };
}> {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(now.getDate() - days);

  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setDate(periodStart.getDate() - days);

  // Current period
  const currentUsage = await prisma.integrationUsage.findMany({
    where: {
      userId,
      createdAt: {
        gte: periodStart,
        lte: now,
      },
    },
  });

  // Previous period
  const previousUsage = await prisma.integrationUsage.findMany({
    where: {
      userId,
      createdAt: {
        gte: previousPeriodStart,
        lt: periodStart,
      },
    },
  });

  const currentPeriod = {
    cost: currentUsage.reduce((sum, r) => sum + r.cost, 0),
    operations: currentUsage.length,
  };

  const previousPeriod = {
    cost: previousUsage.reduce((sum, r) => sum + r.cost, 0),
    operations: previousUsage.length,
  };

  const percentageChange = {
    cost:
      previousPeriod.cost > 0
        ? ((currentPeriod.cost - previousPeriod.cost) / previousPeriod.cost) * 100
        : 0,
    operations:
      previousPeriod.operations > 0
        ? ((currentPeriod.operations - previousPeriod.operations) / previousPeriod.operations) * 100
        : 0,
  };

  return {
    currentPeriod,
    previousPeriod,
    percentageChange,
  };
}
