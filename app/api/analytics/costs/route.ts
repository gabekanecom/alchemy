import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data for cost tracking
    const data = {
      totalCost: 142.35,
      trend: 15.2,
      budgetUsage: 71,
      byProvider: [
        { name: "Anthropic", value: 85.20 },
        { name: "OpenAI", value: 42.15 },
        { name: "Grok", value: 12.00 },
        { name: "Banana", value: 3.00 },
      ],
      byBrand: [
        { name: "TechBrand", cost: 78.50, pieces: 145 },
        { name: "LifestyleCo", cost: 42.35, pieces: 98 },
        { name: "FitnessPro", cost: 21.50, pieces: 67 },
      ],
      trend: [],
    };

    // Generate cost trend data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.trend.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cost: Math.random() * 30 + 10,
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch cost data:", error);
    return NextResponse.json({ error: "Failed to fetch cost data" }, { status: 500 });
  }
}
