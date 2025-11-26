import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db";
import { contentQueue } from "@/lib/queue";

interface PlatformRequest {
  platform: string;
  contentType: string;
  generationConfig?: {
    aiModel?: string;
    customPrompt?: string;
  };
}

interface GenerateRequest {
  ideaId: string;
  brandId: string;
  platforms: PlatformRequest[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { ideaId, brandId, platforms } = body;

    // Validate input
    if (!ideaId || !brandId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: ideaId, brandId, platforms" },
        { status: 400 }
      );
    }

    // Verify brand belongs to user
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        userId: user.id,
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify idea belongs to user (optional - can be null)
    if (ideaId) {
      const idea = await prisma.idea.findFirst({
        where: {
          id: ideaId,
          userId: user.id,
        },
      });

      if (!idea) {
        return NextResponse.json(
          { error: "Idea not found or unauthorized" },
          { status: 404 }
        );
      }
    }

    // Create content queue entries for each platform
    const queueEntries = await Promise.all(
      platforms.map(async (platformRequest) => {
        const { platform, contentType, generationConfig } = platformRequest;

        // Create queue entry in database
        const queueEntry = await prisma.contentQueue.create({
          data: {
            userId: user.id,
            brandId,
            ideaId: ideaId || null,
            platform,
            contentType,
            status: "queued",
            progress: 0,
            generationConfig: (generationConfig
              ? {
                  aiModel: generationConfig.aiModel || "claude-sonnet-4.5",
                  temperature: 0.7,
                  maxTokens: 4000,
                  customPrompt: generationConfig.customPrompt || null,
                }
              : null) as any,
          },
        });

        // Add job to queue
        const job = await contentQueue.add(
          "generate-content",
          {
            queueId: queueEntry.id,
            userId: user.id,
            brandId,
            ideaId,
            platform,
            contentType,
            generationConfig: queueEntry.generationConfig,
          }
        );

        // Update queue entry with job ID
        await prisma.contentQueue.update({
          where: { id: queueEntry.id },
          data: { jobId: job },
        });

        return {
          queueId: queueEntry.id,
          jobId: job,
          platform,
          contentType,
        };
      })
    );

    // Update idea status to "in_production" if applicable
    if (ideaId) {
      await prisma.idea.update({
        where: { id: ideaId },
        data: { status: "in_production" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${queueEntries.length} content generation job(s) queued`,
      queueEntries,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to queue content generation" },
      { status: 500 }
    );
  }
}
