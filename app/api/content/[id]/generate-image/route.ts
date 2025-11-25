import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/client";
import { integrationManager } from "@/lib/integrations/manager";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, integrationId, size, quality, style } = await req.json();
    const contentId = id;

    // Get content
    const content = await prisma.generatedContent.findFirst({
      where: {
        id: contentId,
        userId: user.id,
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Get integration
    let integration;
    if (integrationId) {
      integration = await prisma.integration.findFirst({
        where: {
          id: integrationId,
          userId: user.id,
          enabled: true,
        },
      });
    } else {
      // Auto-select image generation integration
      integration = await integrationManager.getIntegrationFor(
        user.id,
        "image_generation"
      );
    }

    if (!integration) {
      return NextResponse.json(
        { error: "No image generation integration found. Please configure one in Settings." },
        { status: 404 }
      );
    }

    // Generate image
    try {
      const client = integrationManager.getClient(integration);

      // Build prompt if not provided
      const imagePrompt = prompt || `Create a professional, eye-catching featured image for: ${content.title}`;

      const result = await client.generateImage(imagePrompt, {
        size: size || "1792x1024",
        quality: quality || "hd",
        style: style || "vivid",
      });

      // Track usage
      await integrationManager.trackUsage(
        integration.id,
        "image_generation",
        1, // 1 image
        {
          success: true,
          metadata: {
            contentId: content.id,
            size: size || "1792x1024",
            quality: quality || "hd",
            prompt: imagePrompt,
          },
        }
      );

      // Update content with generated image
      const mediaAssets = (content.mediaAssets as any[]) || [];
      mediaAssets.push({
        type: "image",
        url: result.url,
        prompt: imagePrompt,
        revisedPrompt: result.revisedPrompt,
        size: result.size,
        generatedAt: new Date().toISOString(),
        provider: integration.provider,
      });

      await prisma.generatedContent.update({
        where: { id: content.id },
        data: {
          mediaAssets,
        },
      });

      return NextResponse.json({
        success: true,
        image: {
          url: result.url,
          prompt: imagePrompt,
          revisedPrompt: result.revisedPrompt,
          size: result.size,
        },
        message: "Image generated successfully",
      });
    } catch (error: any) {
      console.error("Image generation error:", error);

      // Track failed usage
      await integrationManager.trackUsage(
        integration.id,
        "image_generation",
        1,
        {
          success: false,
          metadata: {
            contentId: content.id,
            error: error.message,
          },
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: `Image generation failed: ${error.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate image API error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
