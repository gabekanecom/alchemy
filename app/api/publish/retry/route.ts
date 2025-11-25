import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publishingQueue } from "@/lib/queue";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { historyId } = await request.json();

    // Get the failed publish history item
    const historyItem = await prisma.publishHistory.findUnique({
      where: { id: historyId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            body: true,
            brand: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!historyItem) {
      return NextResponse.json({ error: "History item not found" }, { status: 404 });
    }

    if (historyItem.content.brand.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (historyItem.status !== "failed") {
      return NextResponse.json(
        { error: "Can only retry failed publishes" },
        { status: 400 }
      );
    }

    // Queue a new publishing job
    await publishingQueue.add(
      "publish",
      {
        contentId: historyItem.contentId,
        platform: historyItem.platform,
        title: historyItem.content.title,
        body: historyItem.content.body,
        brandId: historyItem.content.brand.id,
        retryOf: historyId,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to retry publish:", error);
    return NextResponse.json({ error: "Failed to retry publish" }, { status: 500 });
  }
}
