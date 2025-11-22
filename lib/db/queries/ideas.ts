import prisma from "@/lib/db/client";
import type {
  CreateIdeaInput,
  UpdateIdeaInput,
  IdeaQuery,
  IdeaResponse,
  IdeaWithBrand,
} from "@/types/idea";
import { Prisma } from "@prisma/client";

// ============================================
// IDEA CRUD OPERATIONS
// ============================================

/**
 * Create a new idea
 */
export async function createIdea(
  userId: string,
  data: CreateIdeaInput
): Promise<IdeaResponse> {
  const idea = await prisma.idea.create({
    data: {
      userId,
      brandId: data.brandId,
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      source: data.source,
      sourceUrl: data.sourceUrl,
      sourceData: data.sourceData as Prisma.InputJsonValue,
      targetPlatforms: data.targetPlatforms,
      contentType: data.contentType,
      targetAudience: data.targetAudience,
      priority: data.priority,
      notes: data.notes,
    },
  });

  return idea as IdeaResponse;
}

/**
 * Get idea by ID
 */
export async function getIdeaById(
  ideaId: string,
  userId?: string
): Promise<IdeaResponse | null> {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      ...(userId && { userId }),
    },
  });

  return idea as IdeaResponse | null;
}

/**
 * Get idea with brand information
 */
export async function getIdeaWithBrand(
  ideaId: string,
  userId?: string
): Promise<IdeaWithBrand | null> {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
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

  return idea as IdeaWithBrand | null;
}

/**
 * Get ideas with filtering and pagination
 */
export async function getIdeas(
  userId: string,
  query?: IdeaQuery
): Promise<{ ideas: IdeaWithBrand[]; total: number }> {
  const where: Prisma.IdeaWhereInput = {
    userId,
    ...(query?.brandId && { brandId: query.brandId }),
    ...(query?.status && { status: query.status }),
    ...(query?.priority && { priority: query.priority }),
    ...(query?.source && { source: query.source }),
    ...(query?.minScore && {
      overallScore: { gte: query.minScore },
    }),
    ...(query?.search && {
      OR: [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { keywords: { hasSome: [query.search] } },
      ],
    }),
  };

  const orderBy: Prisma.IdeaOrderByWithRelationInput = {};
  if (query?.sortBy) {
    orderBy[query.sortBy] = query.sortOrder || "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
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
      take: query?.limit || 50,
      skip: query?.offset || 0,
      orderBy,
    }),
    prisma.idea.count({ where }),
  ]);

  return {
    ideas: ideas as IdeaWithBrand[],
    total,
  };
}

/**
 * Update idea
 */
export async function updateIdea(
  ideaId: string,
  userId: string,
  data: Partial<UpdateIdeaInput>
): Promise<IdeaResponse> {
  const idea = await prisma.idea.update({
    where: {
      id: ideaId,
      userId,
    },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.keywords && { keywords: data.keywords }),
      ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
      ...(data.sourceData && {
        sourceData: data.sourceData as Prisma.InputJsonValue,
      }),
      ...(data.targetPlatforms && { targetPlatforms: data.targetPlatforms }),
      ...(data.contentType && { contentType: data.contentType }),
      ...(data.targetAudience !== undefined && {
        targetAudience: data.targetAudience,
      }),
      ...(data.priority && { priority: data.priority }),
      ...(data.status && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.viralityScore !== undefined && {
        viralityScore: data.viralityScore,
      }),
      ...(data.relevanceScore !== undefined && {
        relevanceScore: data.relevanceScore,
      }),
      ...(data.competitionScore !== undefined && {
        competitionScore: data.competitionScore,
      }),
      ...(data.overallScore !== undefined && {
        overallScore: data.overallScore,
      }),
      ...(data.seoData && {
        seoData: data.seoData as Prisma.InputJsonValue,
      }),
      ...(data.brandId !== undefined && { brandId: data.brandId }),
    },
  });

  return idea as IdeaResponse;
}

/**
 * Delete idea
 */
export async function deleteIdea(ideaId: string, userId: string): Promise<void> {
  await prisma.idea.delete({
    where: {
      id: ideaId,
      userId,
    },
  });
}

/**
 * Get trending ideas (high scores)
 */
export async function getTrendingIdeas(
  userId: string,
  limit: number = 10
): Promise<IdeaWithBrand[]> {
  const ideas = await prisma.idea.findMany({
    where: {
      userId,
      status: { not: "archived" },
      overallScore: { not: null },
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
    orderBy: { overallScore: "desc" },
    take: limit,
  });

  return ideas as IdeaWithBrand[];
}

/**
 * Get ideas by brand
 */
export async function getIdeasByBrand(
  brandId: string,
  userId: string,
  limit?: number
): Promise<IdeaResponse[]> {
  const ideas = await prisma.idea.findMany({
    where: {
      brandId,
      userId,
    },
    orderBy: { createdAt: "desc" },
    ...(limit && { take: limit }),
  });

  return ideas as IdeaResponse[];
}

/**
 * Update idea scores
 */
export async function updateIdeaScores(
  ideaId: string,
  scores: {
    viralityScore?: number;
    relevanceScore?: number;
    competitionScore?: number;
  }
): Promise<IdeaResponse> {
  // Calculate overall score as weighted average
  let overallScore: number | undefined;
  if (
    scores.viralityScore !== undefined ||
    scores.relevanceScore !== undefined ||
    scores.competitionScore !== undefined
  ) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        viralityScore: true,
        relevanceScore: true,
        competitionScore: true,
      },
    });

    const virality = scores.viralityScore ?? idea?.viralityScore ?? 50;
    const relevance = scores.relevanceScore ?? idea?.relevanceScore ?? 50;
    const competition = scores.competitionScore ?? idea?.competitionScore ?? 50;

    // Weighted: 40% virality, 40% relevance, 20% competition
    overallScore = virality * 0.4 + relevance * 0.4 + competition * 0.2;
  }

  const idea = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      ...scores,
      ...(overallScore !== undefined && { overallScore }),
    },
  });

  return idea as IdeaResponse;
}
