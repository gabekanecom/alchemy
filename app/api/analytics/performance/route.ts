import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data - generate 7 days of performance data
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views: Math.floor(Math.random() * 10000) + 5000,
        engagement: Math.floor(Math.random() * 2000) + 1000,
        conversionRate: Math.random() * 5 + 2,
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch performance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}
