import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data for now - replace with real database queries later
    const stats = {
      totalViews: 45230,
      totalEngagement: 8945,
      totalCost: 142.35,
      avgViralityScore: 73.8,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
