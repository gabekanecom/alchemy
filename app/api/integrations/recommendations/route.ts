import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import {
  getCostOptimizationRecommendations,
  calculateMonthlyProjection,
  getUsageTrends,
} from "@/lib/integrations/analytics";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all analytics data
    const [recommendations, projection, trends] = await Promise.all([
      getCostOptimizationRecommendations(user.id),
      calculateMonthlyProjection(user.id),
      getUsageTrends(user.id, 30),
    ]);

    return NextResponse.json({
      recommendations,
      projection,
      trends,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
