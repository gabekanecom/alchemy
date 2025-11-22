import prisma from "@/lib/db/client";
import { Prisma } from "@prisma/client";

// ============================================
// ANALYTICS TYPES
// ============================================

export type MetricType =
  | "views"
  | "clicks"
  | "likes"
  | "shares"
  | "comments"
  | "impressions"
  | "engagement"
  | "conversions";

export interface AnalyticsResponse {
  id: string;
  userId: string;
  brandId: string | null;
  publicationId: string | null;
  contentId: string | null;
  platform: string;
  metricType: MetricType;
  value: number;
  metadata: any;
  recordedAt: Date;
  createdAt: Date;
}

export interface CreateAnalyticsInput {
  brandId?: string;
  publicationId?: string;
  contentId?: string;
  platform: string;
  metricType: MetricType;
  value: number;
  metadata?: Record<string, any>;
  recordedAt?: Date;
}

export interface AnalyticsAggregation {
  metricType: MetricType;
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
}

export interface PlatformStats {
  platform: string;
  totalEngagement: number;
  totalViews: number;
  totalClicks: number;
  publicationCount: number;
}

// ============================================
// ANALYTICS OPERATIONS
// ============================================

/**
 * Record analytics metric
 */
export async function recordAnalytics(
  userId: string,
  data: CreateAnalyticsInput
): Promise<AnalyticsResponse> {
  const analytics = await prisma.analytics.create({
    data: {
      userId,
      brandId: data.brandId,
      publicationId: data.publicationId,
      contentId: data.contentId,
      platform: data.platform,
      metricType: data.metricType,
      value: data.value,
      metadata: data.metadata as Prisma.InputJsonValue,
      recordedAt: data.recordedAt || new Date(),
    },
  });

  return analytics as AnalyticsResponse;
}

/**
 * Batch record analytics
 */
export async function batchRecordAnalytics(
  userId: string,
  records: CreateAnalyticsInput[]
): Promise<number> {
  const result = await prisma.analytics.createMany({
    data: records.map((record) => ({
      userId,
      brandId: record.brandId,
      publicationId: record.publicationId,
      contentId: record.contentId,
      platform: record.platform,
      metricType: record.metricType,
      value: record.value,
      metadata: record.metadata as Prisma.InputJsonValue,
      recordedAt: record.recordedAt || new Date(),
    })),
  });

  return result.count;
}

/**
 * Get analytics by publication
 */
export async function getAnalyticsByPublication(
  publicationId: string,
  userId?: string
): Promise<AnalyticsResponse[]> {
  const analytics = await prisma.analytics.findMany({
    where: {
      publicationId,
      ...(userId && { userId }),
    },
    orderBy: { recordedAt: "desc" },
  });

  return analytics as AnalyticsResponse[];
}

/**
 * Get analytics by content
 */
export async function getAnalyticsByContent(
  contentId: string,
  userId?: string
): Promise<AnalyticsResponse[]> {
  const analytics = await prisma.analytics.findMany({
    where: {
      contentId,
      ...(userId && { userId }),
    },
    orderBy: { recordedAt: "desc" },
  });

  return analytics as AnalyticsResponse[];
}

/**
 * Get analytics with filtering
 */
export async function getAnalytics(
  userId: string,
  options?: {
    brandId?: string;
    platform?: string;
    metricType?: MetricType;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<{ analytics: AnalyticsResponse[]; total: number }> {
  const where: Prisma.AnalyticsWhereInput = {
    userId,
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.platform && { platform: options.platform }),
    ...(options?.metricType && { metricType: options.metricType }),
    ...(options?.dateFrom &&
      options?.dateTo && {
        recordedAt: {
          gte: options.dateFrom,
          lte: options.dateTo,
        },
      }),
  };

  const [analytics, total] = await Promise.all([
    prisma.analytics.findMany({
      where,
      take: options?.limit || 100,
      skip: options?.offset || 0,
      orderBy: { recordedAt: "desc" },
    }),
    prisma.analytics.count({ where }),
  ]);

  return {
    analytics: analytics as AnalyticsResponse[],
    total,
  };
}

/**
 * Aggregate analytics by metric type
 */
export async function aggregateAnalyticsByMetric(
  userId: string,
  metricType: MetricType,
  options?: {
    brandId?: string;
    platform?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<AnalyticsAggregation | null> {
  const where: Prisma.AnalyticsWhereInput = {
    userId,
    metricType,
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.platform && { platform: options.platform }),
    ...(options?.dateFrom &&
      options?.dateTo && {
        recordedAt: {
          gte: options.dateFrom,
          lte: options.dateTo,
        },
      }),
  };

  const result = await prisma.analytics.aggregate({
    where,
    _sum: { value: true },
    _avg: { value: true },
    _min: { value: true },
    _max: { value: true },
    _count: true,
  });

  if (result._count === 0) {
    return null;
  }

  return {
    metricType,
    total: result._sum.value || 0,
    average: result._avg.value || 0,
    min: result._min.value || 0,
    max: result._max.value || 0,
    count: result._count,
  };
}

/**
 * Get platform performance stats
 */
export async function getPlatformStats(
  userId: string,
  options?: {
    brandId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<PlatformStats[]> {
  const where: Prisma.AnalyticsWhereInput = {
    userId,
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.dateFrom &&
      options?.dateTo && {
        recordedAt: {
          gte: options.dateFrom,
          lte: options.dateTo,
        },
      }),
  };

  // Get engagement metrics by platform
  const engagementStats = await prisma.analytics.groupBy({
    by: ["platform"],
    where: {
      ...where,
      metricType: { in: ["likes", "shares", "comments", "engagement"] },
    },
    _sum: { value: true },
  });

  // Get view metrics by platform
  const viewStats = await prisma.analytics.groupBy({
    by: ["platform"],
    where: {
      ...where,
      metricType: "views",
    },
    _sum: { value: true },
  });

  // Get click metrics by platform
  const clickStats = await prisma.analytics.groupBy({
    by: ["platform"],
    where: {
      ...where,
      metricType: "clicks",
    },
    _sum: { value: true },
  });

  // Get publication counts by platform
  const publicationCounts = await prisma.publication.groupBy({
    by: ["platform"],
    where: {
      userId,
      ...(options?.brandId && { brandId: options.brandId }),
      status: "published",
    },
    _count: true,
  });

  // Combine all stats
  const platforms = new Set([
    ...engagementStats.map((s) => s.platform),
    ...viewStats.map((s) => s.platform),
    ...clickStats.map((s) => s.platform),
  ]);

  return Array.from(platforms).map((platform) => ({
    platform,
    totalEngagement:
      engagementStats.find((s) => s.platform === platform)?._sum.value || 0,
    totalViews: viewStats.find((s) => s.platform === platform)?._sum.value || 0,
    totalClicks: clickStats.find((s) => s.platform === platform)?._sum.value || 0,
    publicationCount:
      publicationCounts.find((s) => s.platform === platform)?._count || 0,
  }));
}

/**
 * Get brand performance overview
 */
export async function getBrandPerformanceOverview(
  brandId: string,
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  totalPublications: number;
  totalViews: number;
  totalEngagement: number;
  totalClicks: number;
  averageEngagementRate: number;
}> {
  const where: Prisma.AnalyticsWhereInput = {
    userId,
    brandId,
    ...(dateFrom &&
      dateTo && {
        recordedAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      }),
  };

  const [views, engagement, clicks, publications] = await Promise.all([
    prisma.analytics.aggregate({
      where: { ...where, metricType: "views" },
      _sum: { value: true },
    }),
    prisma.analytics.aggregate({
      where: {
        ...where,
        metricType: { in: ["likes", "shares", "comments", "engagement"] },
      },
      _sum: { value: true },
    }),
    prisma.analytics.aggregate({
      where: { ...where, metricType: "clicks" },
      _sum: { value: true },
    }),
    prisma.publication.count({
      where: {
        userId,
        brandId,
        status: "published",
      },
    }),
  ]);

  const totalViews = views._sum.value || 0;
  const totalEngagement = engagement._sum.value || 0;

  return {
    totalPublications: publications,
    totalViews,
    totalEngagement,
    totalClicks: clicks._sum.value || 0,
    averageEngagementRate: totalViews > 0 ? totalEngagement / totalViews : 0,
  };
}

/**
 * Get top performing content
 */
export async function getTopPerformingContent(
  userId: string,
  options?: {
    brandId?: string;
    metricType?: MetricType;
    limit?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<
  Array<{
    contentId: string;
    title: string | null;
    platform: string;
    totalValue: number;
  }>
> {
  const where: Prisma.AnalyticsWhereInput = {
    userId,
    contentId: { not: null },
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.metricType && { metricType: options.metricType }),
    ...(options?.dateFrom &&
      options?.dateTo && {
        recordedAt: {
          gte: options.dateFrom,
          lte: options.dateTo,
        },
      }),
  };

  const topContent = await prisma.analytics.groupBy({
    by: ["contentId"],
    where,
    _sum: { value: true },
    orderBy: { _sum: { value: "desc" } },
    take: options?.limit || 10,
  });

  // Fetch content details
  const contentIds = topContent
    .map((c) => c.contentId)
    .filter((id): id is string => id !== null);

  const contents = await prisma.generatedContent.findMany({
    where: { id: { in: contentIds } },
    select: { id: true, title: true },
  });

  const publications = await prisma.publication.findMany({
    where: { contentId: { in: contentIds } },
    select: { contentId: true, platform: true },
  });

  return topContent.map((item) => {
    const content = contents.find((c) => c.id === item.contentId);
    const publication = publications.find((p) => p.contentId === item.contentId);

    return {
      contentId: item.contentId!,
      title: content?.title || null,
      platform: publication?.platform || "unknown",
      totalValue: item._sum.value || 0,
    };
  });
}

/**
 * Get analytics summary for dashboard
 */
export async function getAnalyticsSummary(
  userId: string,
  brandId?: string
): Promise<{
  last30Days: {
    views: number;
    engagement: number;
    clicks: number;
    publications: number;
  };
  allTime: {
    views: number;
    engagement: number;
    clicks: number;
    publications: number;
  };
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const baseWhere = {
    userId,
    ...(brandId && { brandId }),
  };

  const [
    last30Views,
    last30Engagement,
    last30Clicks,
    last30Pubs,
    allViews,
    allEngagement,
    allClicks,
    allPubs,
  ] = await Promise.all([
    prisma.analytics.aggregate({
      where: { ...baseWhere, metricType: "views", recordedAt: { gte: thirtyDaysAgo } },
      _sum: { value: true },
    }),
    prisma.analytics.aggregate({
      where: {
        ...baseWhere,
        metricType: { in: ["likes", "shares", "comments", "engagement"] },
        recordedAt: { gte: thirtyDaysAgo },
      },
      _sum: { value: true },
    }),
    prisma.analytics.aggregate({
      where: { ...baseWhere, metricType: "clicks", recordedAt: { gte: thirtyDaysAgo } },
      _sum: { value: true },
    }),
    prisma.publication.count({
      where: { ...baseWhere, status: "published", publishedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.analytics.aggregate({
      where: { ...baseWhere, metricType: "views" },
      _sum: { value: true },
    }),
    prisma.analytics.aggregate({
      where: {
        ...baseWhere,
        metricType: { in: ["likes", "shares", "comments", "engagement"] },
      },
      _sum: { value: true },
    }),
    prisma.analytics.aggregate({
      where: { ...baseWhere, metricType: "clicks" },
      _sum: { value: true },
    }),
    prisma.publication.count({
      where: { ...baseWhere, status: "published" },
    }),
  ]);

  return {
    last30Days: {
      views: last30Views._sum.value || 0,
      engagement: last30Engagement._sum.value || 0,
      clicks: last30Clicks._sum.value || 0,
      publications: last30Pubs,
    },
    allTime: {
      views: allViews._sum.value || 0,
      engagement: allEngagement._sum.value || 0,
      clicks: allClicks._sum.value || 0,
      publications: allPubs,
    },
  };
}
