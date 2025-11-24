import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const integrationId = searchParams.get("integrationId");
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Build where clause
    const whereClause: any = {
      userId: user.id,
      createdAt: {
        gte: startDate,
      },
    };

    if (integrationId) {
      whereClause.integrationId = integrationId;
    }

    // Get usage records
    const usageRecords = await prisma.integrationUsage.findMany({
      where: whereClause,
      include: {
        integration: {
          select: {
            id: true,
            displayName: true,
            provider: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate summary statistics
    const totalCost = usageRecords.reduce((sum, record) => sum + record.cost, 0);
    const totalUnits = usageRecords.reduce((sum, record) => sum + record.unitsUsed, 0);
    const totalOperations = usageRecords.length;
    const successfulOperations = usageRecords.filter((r) => r.success).length;
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;

    // Group by integration
    const byIntegration = usageRecords.reduce((acc, record) => {
      const key = record.integrationId;
      if (!acc[key]) {
        acc[key] = {
          integration: record.integration,
          totalCost: 0,
          totalUnits: 0,
          operations: 0,
          successfulOperations: 0,
        };
      }
      acc[key].totalCost += record.cost;
      acc[key].totalUnits += record.unitsUsed;
      acc[key].operations += 1;
      if (record.success) acc[key].successfulOperations += 1;
      return acc;
    }, {} as Record<string, any>);

    // Group by date for timeline
    const byDate = usageRecords.reduce((acc, record) => {
      const dateKey = record.createdAt.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          cost: 0,
          units: 0,
          operations: 0,
        };
      }
      acc[dateKey].cost += record.cost;
      acc[dateKey].units += record.unitsUsed;
      acc[dateKey].operations += 1;
      return acc;
    }, {} as Record<string, any>);

    const timeline = Object.values(byDate).sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by operation type
    const byOperation = usageRecords.reduce((acc, record) => {
      const key = record.operation;
      if (!acc[key]) {
        acc[key] = {
          operation: key,
          totalCost: 0,
          totalUnits: 0,
          count: 0,
        };
      }
      acc[key].totalCost += record.cost;
      acc[key].totalUnits += record.unitsUsed;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);

    // Get top integrations by cost
    const topIntegrations = Object.values(byIntegration)
      .sort((a: any, b: any) => b.totalCost - a.totalCost)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = usageRecords.slice(0, 20).map((record) => ({
      id: record.id,
      integration: record.integration,
      operation: record.operation,
      unitsUsed: record.unitsUsed,
      cost: record.cost,
      success: record.success,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt,
      metadata: record.metadata,
    }));

    return NextResponse.json({
      summary: {
        totalCost,
        totalUnits,
        totalOperations,
        successfulOperations,
        successRate,
        period,
        startDate,
        endDate: now,
      },
      byIntegration: Object.values(byIntegration),
      topIntegrations,
      timeline,
      byOperation: Object.values(byOperation),
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}
