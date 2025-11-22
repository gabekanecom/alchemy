import { NextRequest, NextResponse } from "next/server";
import {
  recordAnalytics,
  getAnalytics,
  getAnalyticsSummary,
  getPlatformStats,
  getTopPerformingContent,
} from "@/lib/db/queries/analytics";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/analytics
 * Get analytics data with various filters
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);

    const action = searchParams.get("action");

    // Handle different analytics actions
    if (action === "summary") {
      const brandId = searchParams.get("brandId") || undefined;
      const summary = await getAnalyticsSummary(userId, brandId);

      const response: ApiResponse<typeof summary> = {
        success: true,
        data: summary,
      };

      return NextResponse.json(response);
    }

    if (action === "platforms") {
      const brandId = searchParams.get("brandId") || undefined;
      const dateFrom = searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined;
      const dateTo = searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo")!)
        : undefined;

      const platforms = await getPlatformStats(userId, {
        brandId,
        dateFrom,
        dateTo,
      });

      const response: ApiResponse<typeof platforms> = {
        success: true,
        data: platforms,
      };

      return NextResponse.json(response);
    }

    if (action === "top-content") {
      const brandId = searchParams.get("brandId") || undefined;
      const metricType = searchParams.get("metricType") as any;
      const limit = parseInt(searchParams.get("limit") || "10");
      const dateFrom = searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined;
      const dateTo = searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo")!)
        : undefined;

      const topContent = await getTopPerformingContent(userId, {
        brandId,
        metricType,
        limit,
        dateFrom,
        dateTo,
      });

      const response: ApiResponse<typeof topContent> = {
        success: true,
        data: topContent,
      };

      return NextResponse.json(response);
    }

    // Default: Get analytics with filters
    const options = {
      brandId: searchParams.get("brandId") || undefined,
      platform: searchParams.get("platform") || undefined,
      metricType: searchParams.get("metricType") as any,
      dateFrom: searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined,
      dateTo: searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo")!)
        : undefined,
      limit: parseInt(searchParams.get("limit") || "100"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const { analytics, total } = await getAnalytics(userId, options);

    const response: ApiResponse<typeof analytics> = {
      success: true,
      data: analytics,
      meta: {
        total,
        limit: options.limit,
        offset: options.offset,
        page: Math.floor(options.offset / options.limit) + 1,
        totalPages: Math.ceil(total / options.limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/analytics error:", error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch analytics",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/analytics
 * Record analytics metrics
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Basic validation
    if (!body.platform || !body.metricType || body.value === undefined) {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing required fields: platform, metricType, value",
        },
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const analytics = await recordAnalytics(userId, body);

    const response: ApiResponse<typeof analytics> = {
      success: true,
      data: analytics,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/analytics error:", error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to record analytics",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
