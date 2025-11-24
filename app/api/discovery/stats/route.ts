import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const brandId = searchParams.get("brandId");

  if (!brandId) {
    return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
  }

  // Verify brand ownership
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      userId: user.id,
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Get stats
  const [totalIdeas, newIdeas, highScoreIdeas, recentRuns] = await Promise.all([
    prisma.idea.count({
      where: { brandId },
    }),
    prisma.idea.count({
      where: {
        brandId,
        status: "new",
      },
    }),
    prisma.idea.count({
      where: {
        brandId,
        overallScore: { gte: 75 },
      },
    }),
    prisma.discoveryRun.findMany({
      where: { brandId },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);

  // Calculate average score
  const avgScore = await prisma.idea.aggregate({
    where: { brandId },
    _avg: { overallScore: true },
  });

  // Ideas by source
  const bySource = await prisma.idea.groupBy({
    by: ["source"],
    where: { brandId },
    _count: true,
  });

  return NextResponse.json({
    totalIdeas,
    newIdeas,
    highScoreIdeas,
    avgScore: avgScore._avg.overallScore || 0,
    bySource: bySource.reduce(
      (acc, item) => {
        acc[item.source] = item._count;
        return acc;
      },
      {} as Record<string, number>
    ),
    recentRuns,
  });
}
