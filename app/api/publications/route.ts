import { NextRequest, NextResponse } from "next/server";
import {
  createPublication,
  getPublications,
  getScheduledPublications,
} from "@/lib/db/queries/publications";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/publications
 * List publications
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);

    const action = searchParams.get("action");

    // Handle scheduled publications
    if (action === "scheduled") {
      const dueBy = searchParams.get("dueBy")
        ? new Date(searchParams.get("dueBy")!)
        : new Date();

      const publications = await getScheduledPublications(userId, dueBy);

      const response: ApiResponse<typeof publications> = {
        success: true,
        data: publications,
      };

      return NextResponse.json(response);
    }

    // Default: List all publications with filters
    const options = {
      status: searchParams.get("status") as any,
      platform: searchParams.get("platform") as any,
      brandId: searchParams.get("brandId") || undefined,
      contentId: searchParams.get("contentId") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const { publications, total } = await getPublications(userId, options);

    const response: ApiResponse<typeof publications> = {
      success: true,
      data: publications,
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
    console.error("GET /api/publications error:", error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch publications",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/publications
 * Create a publication
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Basic validation
    if (!body.contentId || !body.platform) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing required fields: contentId, platform",
        },
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const publication = await createPublication(userId, {
      brandId: body.brandId,
      contentId: body.contentId,
      platform: body.platform,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      metadata: body.metadata,
    });

    const response: ApiResponse<typeof publication> = {
      success: true,
      data: publication,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/publications error:", error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create publication",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
