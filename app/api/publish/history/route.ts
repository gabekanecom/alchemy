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

    const publishHistory = await (prisma as any).publishHistory.findMany({
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
            title: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 100, // Limit to most recent 100
    });

    const history = publishHistory.map((item: any) => ({
      id: item.id,
      contentTitle: item.content.title,
      platform: item.platform,
      status: item.status,
      publishedAt: item.publishedAt,
      error: item.error,
      externalUrl: item.externalUrl,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to fetch publish history:", error);
    return NextResponse.json(
      { error: "Failed to fetch publish history" },
      { status: 500 }
    );
  }
}
