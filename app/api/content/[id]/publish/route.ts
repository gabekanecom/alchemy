import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/client";
import { integrationManager } from "@/lib/integrations/manager";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationId, scheduledFor } = await req.json();
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
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        userId: user.id,
        enabled: true,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found or disabled" }, { status: 404 });
    }

    // Check if integration has publishing capability
    if (!integration.capabilities.includes("publishing")) {
      return NextResponse.json(
        { error: "Integration does not support publishing" },
        { status: 400 }
      );
    }

    // If scheduled for future, create publication record and return
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      const publication = await prisma.publication.create({
        data: {
          userId: user.id,
          brandId: content.brandId,
          contentId: content.id,
          integrationId: integration.id,
          platform: integration.provider,
          status: "scheduled",
          scheduledFor: new Date(scheduledFor),
        },
      });

      return NextResponse.json({
        success: true,
        publication,
        message: "Content scheduled for publishing",
      });
    }

    // Publish immediately
    try {
      const client = integrationManager.getClient(integration);

      // Prepare content for publishing
      const publishData = {
        title: content.title,
        body: content.body || "",
        excerpt: content.excerpt,
        metadata: content.metadata,
        seoData: content.seoData,
      };

      // Publish based on provider
      let result: any;
      if (integration.provider === "sanity") {
        result = await client.publishPost(publishData);
      } else if (integration.provider === "wordpress") {
        result = await client.publishPost(publishData);
      } else {
        throw new Error(`Publishing not implemented for ${integration.provider}`);
      }

      // Create publication record
      const publication = await prisma.publication.create({
        data: {
          userId: user.id,
          brandId: content.brandId,
          contentId: content.id,
          integrationId: integration.id,
          platform: integration.provider,
          status: "published",
          platformPostId: result.id || result.postId,
          publishedUrl: result.url,
          publishedAt: new Date(),
        },
      });

      // Track usage
      await integrationManager.trackUsage(
        integration.id,
        "publish",
        1, // 1 publication
        {
          success: true,
          metadata: {
            contentId: content.id,
            publicationId: publication.id,
            platform: integration.provider,
          },
        }
      );

      return NextResponse.json({
        success: true,
        publication,
        platformUrl: result.url,
        message: "Content published successfully",
      });
    } catch (error: any) {
      console.error("Publishing error:", error);

      // Create failed publication record
      const publication = await prisma.publication.create({
        data: {
          userId: user.id,
          brandId: content.brandId,
          contentId: content.id,
          integrationId: integration.id,
          platform: integration.provider,
          status: "failed",
          errorMessage: error.message,
        },
      });

      // Track failed usage
      await integrationManager.trackUsage(
        integration.id,
        "publish",
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
          error: `Publishing failed: ${error.message}`,
          publication,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Publish API error:", error);
    return NextResponse.json(
      { error: "Failed to publish content" },
      { status: 500 }
    );
  }
}
