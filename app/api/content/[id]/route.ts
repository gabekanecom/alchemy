import { NextRequest, NextResponse } from "next/server";
import {
  getGeneratedContentById,
  updateGeneratedContent,
  deleteGeneratedContent,
  getContentWithBrand,
  getContentVersions,
  createContentVersion,
} from "@/lib/db/queries/content";
import { UpdateGeneratedContentSchema } from "@/types/content";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/content/[id]
 * Get generated content by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);
    const includeBrand = searchParams.get("includeBrand") === "true";
    const includeVersions = searchParams.get("includeVersions") === "true";

    let content;
    if (includeBrand) {
      content = await getContentWithBrand(params.id, userId);
    } else {
      content = await getGeneratedContentById(params.id, userId);
    }

    if (!content) {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Content not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Include versions if requested
    let versions;
    if (includeVersions) {
      versions = await getContentVersions(params.id, userId);
    }

    const response: ApiResponse<typeof content> = {
      success: true,
      data: content,
      ...(versions && { meta: { versions } }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`GET /api/content/${params.id} error:`, error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch content",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PATCH /api/content/[id]
 * Update generated content
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Validate request body
    const validation = UpdateGeneratedContentSchema.safeParse(body);
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

    const content = await updateGeneratedContent(
      params.id,
      userId,
      validation.data
    );

    const response: ApiResponse<typeof content> = {
      success: true,
      data: content,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`PATCH /api/content/${params.id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Content not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update content",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/content/[id]
 * Delete generated content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();

    await deleteGeneratedContent(params.id, userId);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`DELETE /api/content/${params.id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Content not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete content",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/content/[id]/versions
 * Create a new version of content
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Validate request body
    const validation = UpdateGeneratedContentSchema.safeParse(body);
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

    const newVersion = await createContentVersion(
      params.id,
      userId,
      validation.data
    );

    const response: ApiResponse<typeof newVersion> = {
      success: true,
      data: newVersion,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error(`POST /api/content/${params.id}/versions error:`, error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create content version",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
