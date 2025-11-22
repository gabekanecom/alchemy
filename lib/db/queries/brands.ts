import prisma from "@/lib/db/client";
import type {
  CreateBrandInput,
  UpdateBrandInput,
  BrandQuery,
  BrandResponse,
  BrandWithStats,
} from "@/types/brand";
import { Prisma } from "@prisma/client";

// ============================================
// BRAND CRUD OPERATIONS
// ============================================

/**
 * Create a new brand
 */
export async function createBrand(
  userId: string,
  data: CreateBrandInput
): Promise<BrandResponse> {
  const brand = await prisma.brand.create({
    data: {
      userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      logoUrl: data.logoUrl,
      websiteUrl: data.websiteUrl,
      brandVoice: data.brandVoice as Prisma.InputJsonValue,
      targetAudience: data.targetAudience as Prisma.InputJsonValue,
      contentPreferences: data.contentPreferences as Prisma.InputJsonValue,
      isDefault: data.isDefault,
      isActive: data.isActive,
    },
  });

  return brand as BrandResponse;
}

/**
 * Get brand by ID
 */
export async function getBrandById(
  brandId: string,
  userId?: string
): Promise<BrandResponse | null> {
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      ...(userId && { userId }),
    },
  });

  return brand as BrandResponse | null;
}

/**
 * Get brand by slug
 */
export async function getBrandBySlug(
  slug: string,
  userId?: string
): Promise<BrandResponse | null> {
  const brand = await prisma.brand.findFirst({
    where: {
      slug,
      ...(userId && { userId }),
    },
  });

  return brand as BrandResponse | null;
}

/**
 * Get all brands for a user
 */
export async function getBrandsByUserId(
  userId: string,
  query?: BrandQuery
): Promise<{ brands: BrandResponse[]; total: number }> {
  const where: Prisma.BrandWhereInput = {
    userId,
    ...(query?.isActive !== undefined && { isActive: query.isActive }),
    ...(query?.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ],
    }),
  };

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      take: query?.limit || 50,
      skip: query?.offset || 0,
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.count({ where }),
  ]);

  return {
    brands: brands as BrandResponse[],
    total,
  };
}

/**
 * Get brand with statistics
 */
export async function getBrandWithStats(
  brandId: string,
  userId?: string
): Promise<BrandWithStats | null> {
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      ...(userId && { userId }),
    },
    include: {
      _count: {
        select: {
          ideas: true,
          contentQueue: true,
          publications: true,
        },
      },
    },
  });

  if (!brand) return null;

  const { _count, ...brandData } = brand;

  return {
    ...brandData,
    stats: {
      totalIdeas: _count.ideas,
      totalContent: _count.contentQueue,
      totalPublications: _count.publications,
    },
  } as BrandWithStats;
}

/**
 * Update brand
 */
export async function updateBrand(
  brandId: string,
  userId: string,
  data: Partial<UpdateBrandInput>
): Promise<BrandResponse> {
  const brand = await prisma.brand.update({
    where: {
      id: brandId,
      userId,
    },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
      ...(data.brandVoice && {
        brandVoice: data.brandVoice as Prisma.InputJsonValue,
      }),
      ...(data.targetAudience && {
        targetAudience: data.targetAudience as Prisma.InputJsonValue,
      }),
      ...(data.contentPreferences && {
        contentPreferences: data.contentPreferences as Prisma.InputJsonValue,
      }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return brand as BrandResponse;
}

/**
 * Delete brand
 */
export async function deleteBrand(
  brandId: string,
  userId: string
): Promise<void> {
  await prisma.brand.delete({
    where: {
      id: brandId,
      userId,
    },
  });
}

/**
 * Set brand as default
 */
export async function setDefaultBrand(
  brandId: string,
  userId: string
): Promise<BrandResponse> {
  // First, unset any existing default
  await prisma.brand.updateMany({
    where: {
      userId,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  // Then set the new default
  const brand = await prisma.brand.update({
    where: {
      id: brandId,
      userId,
    },
    data: {
      isDefault: true,
    },
  });

  return brand as BrandResponse;
}

/**
 * Get default brand for user
 */
export async function getDefaultBrand(
  userId: string
): Promise<BrandResponse | null> {
  const brand = await prisma.brand.findFirst({
    where: {
      userId,
      isDefault: true,
      isActive: true,
    },
  });

  return brand as BrandResponse | null;
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(
  slug: string,
  userId: string,
  excludeBrandId?: string
): Promise<boolean> {
  const existing = await prisma.brand.findFirst({
    where: {
      slug,
      userId,
      ...(excludeBrandId && { id: { not: excludeBrandId } }),
    },
  });

  return !existing;
}
