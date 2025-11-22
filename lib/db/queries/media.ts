import prisma from "@/lib/db/client";
import { Prisma } from "@prisma/client";

// ============================================
// MEDIA TYPES
// ============================================

export type MediaType = "image" | "video" | "audio" | "document";
export type MediaStatus = "uploading" | "processing" | "ready" | "failed";

export interface MediaResponse {
  id: string;
  userId: string;
  brandId: string | null;
  contentId: string | null;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  altText: string | null;
  metadata: any;
  status: MediaStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaInput {
  brandId?: string;
  contentId?: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
  metadata?: Record<string, any>;
}

// ============================================
// MEDIA OPERATIONS
// ============================================

/**
 * Create media record
 */
export async function createMedia(
  userId: string,
  data: CreateMediaInput
): Promise<MediaResponse> {
  const media = await prisma.media.create({
    data: {
      userId,
      brandId: data.brandId,
      contentId: data.contentId,
      type: data.type,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      filename: data.filename,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      width: data.width,
      height: data.height,
      duration: data.duration,
      altText: data.altText,
      metadata: data.metadata as Prisma.InputJsonValue,
      status: "ready",
    },
  });

  return media as MediaResponse;
}

/**
 * Get media by ID
 */
export async function getMediaById(
  mediaId: string,
  userId?: string
): Promise<MediaResponse | null> {
  const media = await prisma.media.findFirst({
    where: {
      id: mediaId,
      ...(userId && { userId }),
    },
  });

  return media as MediaResponse | null;
}

/**
 * Get all media for a user
 */
export async function getMedia(
  userId: string,
  options?: {
    type?: MediaType;
    brandId?: string;
    contentId?: string;
    status?: MediaStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ media: MediaResponse[]; total: number }> {
  const where: Prisma.MediaWhereInput = {
    userId,
    ...(options?.type && { type: options.type }),
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.contentId && { contentId: options.contentId }),
    ...(options?.status && { status: options.status }),
  };

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: "desc" },
    }),
    prisma.media.count({ where }),
  ]);

  return {
    media: media as MediaResponse[],
    total,
  };
}

/**
 * Update media
 */
export async function updateMedia(
  mediaId: string,
  userId: string,
  data: Partial<CreateMediaInput>
): Promise<MediaResponse> {
  const media = await prisma.media.update({
    where: {
      id: mediaId,
      userId,
    },
    data: {
      ...(data.url && { url: data.url }),
      ...(data.thumbnailUrl !== undefined && {
        thumbnailUrl: data.thumbnailUrl,
      }),
      ...(data.altText !== undefined && { altText: data.altText }),
      ...(data.metadata && {
        metadata: data.metadata as Prisma.InputJsonValue,
      }),
    },
  });

  return media as MediaResponse;
}

/**
 * Update media status
 */
export async function updateMediaStatus(
  mediaId: string,
  status: MediaStatus
): Promise<void> {
  await prisma.media.update({
    where: { id: mediaId },
    data: { status },
  });
}

/**
 * Delete media
 */
export async function deleteMedia(mediaId: string, userId: string): Promise<void> {
  await prisma.media.delete({
    where: {
      id: mediaId,
      userId,
    },
  });
}

/**
 * Get media by content ID
 */
export async function getMediaByContentId(
  contentId: string,
  userId?: string
): Promise<MediaResponse[]> {
  const media = await prisma.media.findMany({
    where: {
      contentId,
      ...(userId && { userId }),
    },
    orderBy: { createdAt: "asc" },
  });

  return media as MediaResponse[];
}

/**
 * Get media by brand ID
 */
export async function getMediaByBrandId(
  brandId: string,
  userId: string,
  limit?: number
): Promise<MediaResponse[]> {
  const media = await prisma.media.findMany({
    where: {
      brandId,
      userId,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return media as MediaResponse[];
}

/**
 * Get total storage used by user
 */
export async function getTotalStorageUsed(userId: string): Promise<number> {
  const result = await prisma.media.aggregate({
    where: { userId },
    _sum: {
      fileSize: true,
    },
  });

  return result._sum.fileSize || 0;
}

/**
 * Get storage used by brand
 */
export async function getStorageUsedByBrand(
  brandId: string,
  userId: string
): Promise<number> {
  const result = await prisma.media.aggregate({
    where: {
      brandId,
      userId,
    },
    _sum: {
      fileSize: true,
    },
  });

  return result._sum.fileSize || 0;
}
