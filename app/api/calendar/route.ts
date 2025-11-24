import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const brandId = searchParams.get("brandId");

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Build where clause
    const whereClause: any = {
      userId: user.id,
      OR: [
        {
          scheduledFor: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    };

    if (brandId) {
      whereClause.brandId = brandId;
    }

    // Get scheduled publications
    const publications = await prisma.publication.findMany({
      where: whereClause,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            contentType: true,
            platform: true,
          },
        },
      },
      orderBy: [
        { scheduledFor: "asc" },
        { publishedAt: "asc" },
      ],
    });

    // Get content in queue
    const queuedContent = await prisma.contentQueue.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["queued", "processing"],
        },
        ...(brandId && { brandId }),
      },
      select: {
        id: true,
        platform: true,
        contentType: true,
        status: true,
        progress: true,
        createdAt: true,
      },
      take: 20,
    });

    // Get recent generated content (not yet published)
    const generatedContent = await prisma.generatedContent.findMany({
      where: {
        userId: user.id,
        ...(brandId && { brandId }),
        publications: {
          none: {},
        },
      },
      select: {
        id: true,
        title: true,
        contentType: true,
        platform: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Group publications by date
    const eventsByDate: Record<string, any[]> = {};

    publications.forEach((pub) => {
      const date = (pub.scheduledFor || pub.publishedAt)!;
      const dateKey = date.toISOString().split("T")[0];

      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }

      eventsByDate[dateKey].push({
        id: pub.id,
        type: "publication",
        title: pub.content.title,
        contentType: pub.content.contentType,
        platform: pub.platform,
        status: pub.status,
        scheduledFor: pub.scheduledFor,
        publishedAt: pub.publishedAt,
        publishedUrl: pub.publishedUrl,
      });
    });

    return NextResponse.json({
      events: eventsByDate,
      queuedContent,
      unpublishedContent: generatedContent,
      summary: {
        totalScheduled: publications.filter((p) => p.status === "scheduled").length,
        totalPublished: publications.filter((p) => p.status === "published").length,
        totalFailed: publications.filter((p) => p.status === "failed").length,
        inQueue: queuedContent.length,
        unpublished: generatedContent.length,
      },
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}

// Update publication schedule
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publicationId, scheduledFor } = await req.json();

    // Verify ownership
    const publication = await prisma.publication.findFirst({
      where: {
        id: publicationId,
        userId: user.id,
      },
    });

    if (!publication) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }

    // Update schedule
    const updated = await prisma.publication.update({
      where: { id: publicationId },
      data: {
        scheduledFor: new Date(scheduledFor),
        status: "scheduled",
      },
    });

    return NextResponse.json({
      success: true,
      publication: updated,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
