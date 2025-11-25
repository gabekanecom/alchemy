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

    const drafts = await prisma.content.findMany({
      where: {
        brand: {
          userId: session.user.id,
        },
        status: "draft",
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const draftsWithWordCount = drafts.map((draft) => ({
      id: draft.id,
      title: draft.title,
      excerpt: draft.body?.substring(0, 200),
      platform: draft.platform,
      wordCount: draft.body?.split(/\s+/).filter(Boolean).length || 0,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      brand: draft.brand,
    }));

    return NextResponse.json({ drafts: draftsWithWordCount });
  } catch (error) {
    console.error("Failed to fetch drafts:", error);
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 });
  }
}
