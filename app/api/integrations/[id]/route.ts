// PATCH /api/integrations/[id] - Update integration
// DELETE /api/integrations/[id] - Delete integration
// GET /api/integrations/[id] - Get single integration

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/utils";
import { getProvider } from "@/lib/integrations/registry";

/**
 * GET /api/integrations/[id]
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.integration.findFirst({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}

/**
 * PATCH /api/integrations/[id]
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { config, enabled, isDefault, dailyLimit, monthlyLimit, priority } = body;

    // Verify ownership
    const existing = await prisma.integration.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // If updating config, validate it
    let validatedConfig = existing.config;
    if (config) {
      const providerDef = getProvider(existing.provider);
      if (providerDef) {
        validatedConfig = providerDef.configSchema.parse(config);
      }
    }

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await prisma.integration.updateMany({
        where: {
          userId: user.id,
          brandId: existing.brandId,
          category: existing.category,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update integration
    const integration = await prisma.integration.update({
      where: { id: id },
      data: {
        ...(config && { config: validatedConfig }),
        ...(enabled !== undefined && { enabled }),
        ...(isDefault !== undefined && { isDefault }),
        ...(dailyLimit !== undefined && { dailyLimit }),
        ...(monthlyLimit !== undefined && { monthlyLimit }),
        ...(priority !== undefined && { priority }),
      },
    });

    return NextResponse.json({ integration });
  } catch (error: any) {
    console.error("Failed to update integration:", error);

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
        error: "Failed to update integration",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/[id]
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const integration = await prisma.integration.findFirst({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  // Delete integration
  await prisma.integration.delete({
    where: { id: id },
  });

  return NextResponse.json({ success: true });
}
