import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock usage data
    const data = {
      totalTokens: 2450000,
      totalRequests: 1243,
      byProvider: [
        { name: "Anthropic Claude", requests: 685, tokens: 1420000, cost: 85.20 },
        { name: "OpenAI GPT-4", requests: 412, tokens: 890000, cost: 42.15 },
        { name: "Grok Imagine", requests: 120, tokens: 120000, cost: 12.00 },
        { name: "Banana Nano", requests: 26, tokens: 20000, cost: 3.00 },
      ],
      byCategory: [
        {
          id: "text_generation",
          name: "Text Generation",
          requests: 985,
          tokens: 2180000,
          avgCost: 0.12,
        },
        {
          id: "image_generation",
          name: "Image Generation",
          requests: 146,
          tokens: 140000,
          avgCost: 0.08,
        },
        {
          id: "research",
          name: "Research",
          requests: 85,
          tokens: 95000,
          avgCost: 0.05,
        },
        {
          id: "other",
          name: "Other",
          requests: 27,
          tokens: 35000,
          avgCost: 0.03,
        },
      ],
      trend: [] as Array<{ date: string; requests: number; tokens: number }>,
    };

    // Generate trend data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.trend.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        requests: Math.floor(Math.random() * 200) + 100,
        tokens: Math.floor(Math.random() * 400000) + 200000,
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch usage data:", error);
    return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 });
  }
}
