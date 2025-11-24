import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { integrationManager } from "@/lib/integrations/manager";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, provider, size, quality } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get image generation integration
    const integration = await integrationManager.getIntegrationFor(
      user.id,
      "image_generation",
      { preferredProvider: provider }
    );

    if (!integration) {
      return NextResponse.json(
        { error: "No image generation provider configured" },
        { status: 400 }
      );
    }

    // Generate image
    const client = integrationManager.getClient(integration);
    const response = await client.generateImage(prompt, {
      size,
      quality,
      n: 1,
    });

    // Track usage
    await integrationManager.trackUsage(
      integration.id,
      "image_generation",
      1, // 1 image generated
      {
        success: true,
        metadata: {
          prompt,
          size,
          quality,
        },
      }
    );

    // Save to media library (optional - you may want to store in Supabase Storage)
    // For now, we'll just return the URLs
    // TODO: Save to database media table

    return NextResponse.json({
      success: true,
      images: response.images,
      metadata: response.metadata,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
