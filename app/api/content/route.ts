import { NextRequest, NextResponse } from "next/server";
import { getGeneratedContent } from "@/lib/db/queries/content";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/content
 * List generated content
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);

    const options = {
      status: searchParams.get("status") as any,
      brandId: searchParams.get("brandId") || undefined,
      platform: searchParams.get("platform") || undefined,
      contentType: searchParams.get("contentType") || undefined,
      search: searchParams.get("search") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      sortBy: searchParams.get("sortBy") as any,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    };

    const { content, total } = await getGeneratedContent(userId, options);

    const response: ApiResponse<typeof content> = {
      success: true,
      data: content,
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
    console.error("GET /api/content error:", error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch content",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
