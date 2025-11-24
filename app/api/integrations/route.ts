// GET /api/integrations - List all integrations for user
// POST /api/integrations - Create new integration

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/utils";
import { getProvider } from "@/lib/integrations/registry";

/**
 * GET /api/integrations
 * List all integrations for the current user
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const brandId = searchParams.get("brandId");
  const category = searchParams.get("category");

  const integrations = await prisma.integration.findMany({
    where: {
      userId: user.id,
      ...(brandId && { brandId }),
      ...(category && { category }),
    },
    orderBy: [{ isDefault: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ integrations });
}

/**
 * POST /api/integrations
 * Create a new integration
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { provider, brandId, config, enabled, isDefault, dailyLimit, monthlyLimit } = body;

    // Get provider definition
    const providerDef = getProvider(provider);
    if (!providerDef) {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    // Validate config against provider schema
    const validatedConfig = providerDef.configSchema.parse(config);

    // If setting as default, unset other defaults in same category
    if (isDefault) {
      await prisma.integration.updateMany({
        where: {
          userId: user.id,
          brandId: brandId || null,
          category: providerDef.category,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create integration
    const integration = await prisma.integration.create({
      data: {
        userId: user.id,
        brandId: brandId || null,
        category: providerDef.category,
        provider,
        displayName: providerDef.name,
        description: providerDef.description,
        iconUrl: providerDef.icon,
        config: validatedConfig,
        capabilities: providerDef.capabilities,
        enabled: enabled ?? true,
        isDefault: isDefault ?? false,
        dailyLimit,
        monthlyLimit,
      },
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create integration:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid configuration",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create integration",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
