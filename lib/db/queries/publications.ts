import prisma from "@/lib/db/client";
import { Prisma } from "@prisma/client";

// ============================================
// PUBLICATION TYPES
// ============================================

export type PublicationStatus = "scheduled" | "published" | "failed";
export type PublicationPlatform =
  | "blog"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "instagram"
  | "youtube"
  | "email";

export interface PublicationResponse {
  id: string;
  userId: string;
  brandId: string | null;
  contentId: string;
  platform: PublicationPlatform;
  externalId: string | null;
  externalUrl: string | null;
  status: PublicationStatus;
  scheduledFor: Date | null;
  publishedAt: Date | null;
  errorMessage: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePublicationInput {
  brandId?: string;
  contentId: string;
  platform: PublicationPlatform;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export interface UpdatePublicationInput {
  status?: PublicationStatus;
  externalId?: string;
  externalUrl?: string;
  publishedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface PublicationWithContent extends PublicationResponse {
  content: {
    id: string;
    title: string | null;
    contentType: string;
  };
}

// ============================================
// PUBLICATION OPERATIONS
// ============================================

/**
 * Create publication
 */
export async function createPublication(
  userId: string,
  data: CreatePublicationInput
): Promise<PublicationResponse> {
  const publication = await prisma.publication.create({
    data: {
      userId,
      brandId: data.brandId,
      contentId: data.contentId,
      platform: data.platform,
      status: data.scheduledFor ? "scheduled" : "published",
      scheduledFor: data.scheduledFor,
      metadata: data.metadata as Prisma.InputJsonValue,
    },
  });

  return publication as PublicationResponse;
}

/**
 * Get publication by ID
 */
export async function getPublicationById(
  publicationId: string,
  userId?: string
): Promise<PublicationResponse | null> {
  const publication = await prisma.publication.findFirst({
    where: {
      id: publicationId,
      ...(userId && { userId }),
    },
  });

  return publication as PublicationResponse | null;
}

/**
 * Get publication with content
 */
export async function getPublicationWithContent(
  publicationId: string,
  userId?: string
): Promise<PublicationWithContent | null> {
  const publication = await prisma.publication.findFirst({
    where: {
      id: publicationId,
      ...(userId && { userId }),
    },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          contentType: true,
        },
      },
    },
  });

  return publication as PublicationWithContent | null;
}

/**
 * Get all publications
 */
export async function getPublications(
  userId: string,
  options?: {
    status?: PublicationStatus;
    platform?: PublicationPlatform;
    brandId?: string;
    contentId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ publications: PublicationWithContent[]; total: number }> {
  const where: Prisma.PublicationWhereInput = {
    userId,
    ...(options?.status && { status: options.status }),
    ...(options?.platform && { platform: options.platform }),
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.contentId && { contentId: options.contentId }),
  };

  const [publications, total] = await Promise.all([
    prisma.publication.findMany({
      where,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            contentType: true,
          },
        },
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: "desc" },
    }),
    prisma.publication.count({ where }),
  ]);

  return {
    publications: publications as PublicationWithContent[],
    total,
  };
}

/**
 * Update publication
 */
export async function updatePublication(
  publicationId: string,
  userId: string,
  data: UpdatePublicationInput
): Promise<PublicationResponse> {
  const publication = await prisma.publication.update({
    where: {
      id: publicationId,
      userId,
    },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.externalId !== undefined && { externalId: data.externalId }),
      ...(data.externalUrl !== undefined && { externalUrl: data.externalUrl }),
      ...(data.publishedAt && { publishedAt: data.publishedAt }),
      ...(data.errorMessage !== undefined && {
        errorMessage: data.errorMessage,
      }),
      ...(data.metadata && {
        metadata: data.metadata as Prisma.InputJsonValue,
      }),
    },
  });

  return publication as PublicationResponse;
}

/**
 * Delete publication
 */
export async function deletePublication(
  publicationId: string,
  userId: string
): Promise<void> {
  await prisma.publication.delete({
    where: {
      id: publicationId,
      userId,
    },
  });
}

/**
 * Get scheduled publications
 */
export async function getScheduledPublications(
  userId?: string,
  dueBy?: Date
): Promise<PublicationWithContent[]> {
  const publications = await prisma.publication.findMany({
    where: {
      ...(userId && { userId }),
      status: "scheduled",
      scheduledFor: {
        lte: dueBy || new Date(),
      },
    },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          contentType: true,
        },
      },
    },
    orderBy: { scheduledFor: "asc" },
  });

  return publications as PublicationWithContent[];
}

/**
 * Get publications by content ID
 */
export async function getPublicationsByContentId(
  contentId: string,
  userId?: string
): Promise<PublicationResponse[]> {
  const publications = await prisma.publication.findMany({
    where: {
      contentId,
      ...(userId && { userId }),
    },
    orderBy: { createdAt: "desc" },
  });

  return publications as PublicationResponse[];
}

/**
 * Get publications by brand
 */
export async function getPublicationsByBrand(
  brandId: string,
  userId: string,
  limit?: number
): Promise<PublicationResponse[]> {
  const publications = await prisma.publication.findMany({
    where: {
      brandId,
      userId,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return publications as PublicationResponse[];
}

/**
 * Mark publication as published
 */
export async function markPublicationAsPublished(
  publicationId: string,
  externalId?: string,
  externalUrl?: string
): Promise<void> {
  await prisma.publication.update({
    where: { id: publicationId },
    data: {
      status: "published",
      publishedAt: new Date(),
      ...(externalId && { externalId }),
      ...(externalUrl && { externalUrl }),
    },
  });
}

/**
 * Mark publication as failed
 */
export async function markPublicationAsFailed(
  publicationId: string,
  errorMessage: string
): Promise<void> {
  await prisma.publication.update({
    where: { id: publicationId },
    data: {
      status: "failed",
      errorMessage,
    },
  });
}
