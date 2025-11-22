import prisma from "@/lib/db/client";
import type {
  CreateContentQueueInput,
  UpdateContentQueueInput,
  ContentQueueResponse,
  CreateGeneratedContentInput,
  UpdateGeneratedContentInput,
  GeneratedContentResponse,
  ContentWithBrand,
  QueueStatus,
  ContentStatus,
} from "@/types/content";
import { Prisma } from "@prisma/client";

// ============================================
// CONTENT QUEUE OPERATIONS
// ============================================

/**
 * Create a new content queue entry
 */
export async function createContentQueue(
  userId: string,
  data: CreateContentQueueInput
): Promise<ContentQueueResponse> {
  const queue = await prisma.contentQueue.create({
    data: {
      userId,
      brandId: data.brandId,
      ideaId: data.ideaId,
      platform: data.platform,
      contentType: data.contentType,
      generationConfig: data.generationConfig as Prisma.InputJsonValue,
      brief: data.brief as Prisma.InputJsonValue,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      status: "queued",
      progress: 0,
    },
  });

  return queue as ContentQueueResponse;
}

/**
 * Get content queue entry by ID
 */
export async function getContentQueueById(
  queueId: string,
  userId?: string
): Promise<ContentQueueResponse | null> {
  const queue = await prisma.contentQueue.findFirst({
    where: {
      id: queueId,
      ...(userId && { userId }),
    },
  });

  return queue as ContentQueueResponse | null;
}

/**
 * Get all content queue entries for a user
 */
export async function getContentQueue(
  userId: string,
  options?: {
    status?: QueueStatus;
    brandId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ queue: ContentQueueResponse[]; total: number }> {
  const where: Prisma.ContentQueueWhereInput = {
    userId,
    ...(options?.status && { status: options.status }),
    ...(options?.brandId && { brandId: options.brandId }),
  };

  const [queue, total] = await Promise.all([
    prisma.contentQueue.findMany({
      where,
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentQueue.count({ where }),
  ]);

  return {
    queue: queue as ContentQueueResponse[],
    total,
  };
}

/**
 * Update content queue entry
 */
export async function updateContentQueue(
  queueId: string,
  userId: string,
  data: Partial<UpdateContentQueueInput>
): Promise<ContentQueueResponse> {
  const queue = await prisma.contentQueue.update({
    where: {
      id: queueId,
      userId,
    },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.progress !== undefined && { progress: data.progress }),
      ...(data.errorMessage !== undefined && {
        errorMessage: data.errorMessage,
      }),
      ...(data.scheduledFor && {
        scheduledFor: new Date(data.scheduledFor),
      }),
    },
  });

  return queue as ContentQueueResponse;
}

/**
 * Delete content queue entry
 */
export async function deleteContentQueue(
  queueId: string,
  userId: string
): Promise<void> {
  await prisma.contentQueue.delete({
    where: {
      id: queueId,
      userId,
    },
  });
}

/**
 * Get pending queue items (for workers)
 */
export async function getPendingQueueItems(
  limit: number = 10
): Promise<ContentQueueResponse[]> {
  const queue = await prisma.contentQueue.findMany({
    where: {
      status: "queued",
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  return queue as ContentQueueResponse[];
}

/**
 * Update queue job ID
 */
export async function updateQueueJobId(
  queueId: string,
  jobId: string
): Promise<void> {
  await prisma.contentQueue.update({
    where: { id: queueId },
    data: { jobId },
  });
}

// ============================================
// GENERATED CONTENT OPERATIONS
// ============================================

/**
 * Create generated content
 */
export async function createGeneratedContent(
  userId: string,
  brandId: string | null,
  data: CreateGeneratedContentInput
): Promise<GeneratedContentResponse> {
  const content = await prisma.generatedContent.create({
    data: {
      userId,
      brandId,
      queueId: data.queueId,
      contentType: data.contentType,
      platform: data.platform,
      title: data.title,
      body: data.body,
      excerpt: data.excerpt,
      metadata: data.metadata as Prisma.InputJsonValue,
      seoData: data.seoData as Prisma.InputJsonValue,
      mediaAssets: data.mediaAssets,
      aiMetadata: data.aiMetadata as Prisma.InputJsonValue,
      status: "draft",
      version: 1,
    },
  });

  return content as GeneratedContentResponse;
}

/**
 * Get generated content by ID
 */
export async function getGeneratedContentById(
  contentId: string,
  userId?: string
): Promise<GeneratedContentResponse | null> {
  const content = await prisma.generatedContent.findFirst({
    where: {
      id: contentId,
      ...(userId && { userId }),
    },
  });

  return content as GeneratedContentResponse | null;
}

/**
 * Get generated content with brand information
 */
export async function getContentWithBrand(
  contentId: string,
  userId?: string
): Promise<ContentWithBrand | null> {
  const content = await prisma.generatedContent.findFirst({
    where: {
      id: contentId,
      ...(userId && { userId }),
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return content as ContentWithBrand | null;
}

/**
 * Get all generated content with filtering
 */
export async function getGeneratedContent(
  userId: string,
  options?: {
    status?: ContentStatus;
    brandId?: string;
    platform?: string;
    contentType?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "updatedAt" | "qualityScore";
    sortOrder?: "asc" | "desc";
  }
): Promise<{ content: ContentWithBrand[]; total: number }> {
  const where: Prisma.GeneratedContentWhereInput = {
    userId,
    ...(options?.status && { status: options.status }),
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.platform && { platform: options.platform }),
    ...(options?.contentType && { contentType: options.contentType }),
    ...(options?.search && {
      OR: [
        { title: { contains: options.search, mode: "insensitive" } },
        { body: { contains: options.search, mode: "insensitive" } },
        { excerpt: { contains: options.search, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy: Prisma.GeneratedContentOrderByWithRelationInput = {};
  if (options?.sortBy) {
    orderBy[options.sortBy] = options.sortOrder || "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  const [content, total] = await Promise.all([
    prisma.generatedContent.findMany({
      where,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy,
    }),
    prisma.generatedContent.count({ where }),
  ]);

  return {
    content: content as ContentWithBrand[],
    total,
  };
}

/**
 * Update generated content
 */
export async function updateGeneratedContent(
  contentId: string,
  userId: string,
  data: Partial<UpdateGeneratedContentInput>
): Promise<GeneratedContentResponse> {
  const content = await prisma.generatedContent.update({
    where: {
      id: contentId,
      userId,
    },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.metadata && {
        metadata: data.metadata as Prisma.InputJsonValue,
      }),
      ...(data.seoData && { seoData: data.seoData as Prisma.InputJsonValue }),
      ...(data.mediaAssets && { mediaAssets: data.mediaAssets }),
      ...(data.aiMetadata && {
        aiMetadata: data.aiMetadata as Prisma.InputJsonValue,
      }),
      ...(data.status && { status: data.status }),
      ...(data.qualityScore !== undefined && {
        qualityScore: data.qualityScore,
      }),
      ...(data.readabilityScore !== undefined && {
        readabilityScore: data.readabilityScore,
      }),
      ...(data.seoScore !== undefined && { seoScore: data.seoScore }),
    },
  });

  return content as GeneratedContentResponse;
}

/**
 * Delete generated content
 */
export async function deleteGeneratedContent(
  contentId: string,
  userId: string
): Promise<void> {
  await prisma.generatedContent.delete({
    where: {
      id: contentId,
      userId,
    },
  });
}

/**
 * Create content version (for revision history)
 */
export async function createContentVersion(
  originalContentId: string,
  userId: string,
  updates: Partial<UpdateGeneratedContentInput>
): Promise<GeneratedContentResponse> {
  // Get original content
  const original = await prisma.generatedContent.findUnique({
    where: { id: originalContentId },
  });

  if (!original || original.userId !== userId) {
    throw new Error("Content not found");
  }

  // Create new version
  const newVersion = await prisma.generatedContent.create({
    data: {
      userId: original.userId,
      brandId: original.brandId,
      queueId: original.queueId,
      contentType: original.contentType,
      platform: original.platform,
      title: updates.title ?? original.title,
      body: updates.body ?? original.body,
      excerpt: updates.excerpt ?? original.excerpt,
      metadata: (updates.metadata ?? original.metadata) as Prisma.InputJsonValue,
      seoData: (updates.seoData ?? original.seoData) as Prisma.InputJsonValue,
      mediaAssets: updates.mediaAssets ?? original.mediaAssets,
      aiMetadata: (updates.aiMetadata ??
        original.aiMetadata) as Prisma.InputJsonValue,
      status: updates.status ?? original.status,
      version: original.version + 1,
      parentId: original.parentId ?? original.id,
    },
  });

  return newVersion as GeneratedContentResponse;
}

/**
 * Get content by queue ID
 */
export async function getContentByQueueId(
  queueId: string,
  userId?: string
): Promise<GeneratedContentResponse | null> {
  const content = await prisma.generatedContent.findFirst({
    where: {
      queueId,
      ...(userId && { userId }),
    },
    orderBy: { version: "desc" },
  });

  return content as GeneratedContentResponse | null;
}

/**
 * Get content versions
 */
export async function getContentVersions(
  contentId: string,
  userId: string
): Promise<GeneratedContentResponse[]> {
  const content = await prisma.generatedContent.findUnique({
    where: { id: contentId },
  });

  if (!content || content.userId !== userId) {
    return [];
  }

  const rootId = content.parentId ?? content.id;

  const versions = await prisma.generatedContent.findMany({
    where: {
      OR: [{ id: rootId }, { parentId: rootId }],
      userId,
    },
    orderBy: { version: "desc" },
  });

  return versions as GeneratedContentResponse[];
}

/**
 * Get recent content for a brand
 */
export async function getRecentContentByBrand(
  brandId: string,
  userId: string,
  limit: number = 10
): Promise<GeneratedContentResponse[]> {
  const content = await prisma.generatedContent.findMany({
    where: {
      brandId,
      userId,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return content as GeneratedContentResponse[];
}
