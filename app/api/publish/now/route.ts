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

    const { postId } = await request.json();

    // Verify ownership
    const post = await prisma.scheduledPost.findUnique({
      where: { id: postId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            body: true,
            platform: true,
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.content.brand.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update status to publishing
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "publishing" },
    });

    // Queue publishing job for each platform
    for (const platform of post.platforms) {
      await publishingQueue.add(
        "publish",
        {
          scheduledPostId: postId,
          contentId: post.contentId,
          platform,
          title: post.content.title,
          body: post.content.body,
          brandId: post.content.brand.id,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to publish now:", error);
    return NextResponse.json({ error: "Failed to publish content" }, { status: 500 });
  }
}
