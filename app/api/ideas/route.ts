import { NextRequest, NextResponse } from "next/server";
import { createIdea, getIdeas } from "@/lib/db/queries/ideas";
import { CreateIdeaSchema, IdeaQuerySchema } from "@/types/idea";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/ideas
 * List all ideas for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryParams = {
      brandId: searchParams.get("brandId") || undefined,
      status: searchParams.get("status") || undefined,
      source: searchParams.get("source") || undefined,
      priority: searchParams.get("priority") || undefined,
      search: searchParams.get("search") || undefined,
      minScore: searchParams.get("minScore")
        ? parseFloat(searchParams.get("minScore")!)
        : undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    };

    // Validate query parameters
    const validation = IdeaQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: validation.error.errors,
        },
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { ideas, total } = await getIdeas(userId, validation.data);

    const response: ApiResponse<typeof ideas> = {
      success: true,
      data: ideas,
      meta: {
        total,
        limit: queryParams.limit,
        offset: queryParams.offset,
        page: Math.floor(queryParams.offset / queryParams.limit) + 1,
        totalPages: Math.ceil(total / queryParams.limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/ideas error:", error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch ideas",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/ideas
 * Create a new idea
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Validate request body
    const validation = CreateIdeaSchema.safeParse(body);
    if (!validation.success) {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: validation.error.errors,
        },
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const idea = await createIdea(userId, validation.data);

    const response: ApiResponse<typeof idea> = {
      success: true,
      data: idea,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/ideas error:", error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create idea",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
