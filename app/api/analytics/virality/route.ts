import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock virality data
    const topContent = [];
    for (let i = 0; i < 15; i++) {
      const predictedScore = Math.floor(Math.random() * 40) + 60;
      const actualScore = predictedScore + (Math.random() * 20 - 10);
      topContent.push({
        id: `content-${i}`,
        title: `${["How to", "10 Ways to", "The Ultimate Guide to", "Why"][Math.floor(Math.random() * 4)]} ${["Build", "Create", "Master", "Understand"][Math.floor(Math.random() * 4)]} ${["Content Marketing", "Social Media", "SEO", "Email Campaigns"][Math.floor(Math.random() * 4)]}`,
        platform: ["blog", "linkedin", "twitter"][Math.floor(Math.random() * 3)],
        predictedScore,
        actualScore: Math.max(0, Math.min(100, actualScore)),
        views: Math.floor(Math.random() * 50000) + 10000,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    topContent.sort((a, b) => b.predictedScore - a.predictedScore);

    const scoreAccuracy = topContent.map((content) => ({
      predicted: content.predictedScore,
      actual: content.actualScore,
    }));

    const data = {
      avgScore: topContent.reduce((sum, c) => sum + c.predictedScore, 0) / topContent.length,
      topContent,
      scoreAccuracy: [
        ...scoreAccuracy,
        { predicted: 0, actual: 0, accuracy: 85 },
      ],
      scoreTrend: [] as any,
    };

    // Generate score trend
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.scoreTrend.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        avgScore: Math.random() * 20 + 65,
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch virality data:", error);
    return NextResponse.json(
      { error: "Failed to fetch virality data" },
      { status: 500 }
    );
  }
}
