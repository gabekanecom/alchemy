import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: {
        content: {
          brand: {
            userId: session.user.id,
          },
        },
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            platform: true,
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    const posts = scheduledPosts.map((post) => ({
      id: post.id,
      contentId: post.contentId,
      title: post.content.title,
      platforms: post.platforms,
      scheduledFor: post.scheduledFor,
      status: post.status,
      error: post.error,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to fetch scheduled posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled posts" },
      { status: 500 }
    );
  }
}
