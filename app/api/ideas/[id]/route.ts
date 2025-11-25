import { NextRequest, NextResponse } from "next/server";
import {
  getIdeaById,
  updateIdea,
  deleteIdea,
  getIdeaWithBrand,
} from "@/lib/db/queries/ideas";
import { UpdateIdeaSchema } from "@/types/idea";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/ideas/[id]
 * Get a single idea by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);
    const includeBrand = searchParams.get("includeBrand") === "true";

    let idea;
    if (includeBrand) {
      idea = await getIdeaWithBrand(id, userId);
    } else {
      idea = await getIdeaById(id, userId);
    }

    if (!idea) {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Idea not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse<typeof idea> = {
      success: true,
      data: idea,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`GET /api/ideas/${id} error:`, error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch idea",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PATCH /api/ideas/[id]
 * Update an idea
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId();
    const body = await request.json();

    // Validate request body
    const validation = UpdateIdeaSchema.safeParse(body);
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

    const idea = await updateIdea(id, userId, validation.data);

    const response: ApiResponse<typeof idea> = {
      success: true,
      data: idea,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`PATCH /api/ideas/${id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Idea not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update idea",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/ideas/[id]
 * Delete an idea
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId();

    await deleteIdea(id, userId);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`DELETE /api/ideas/${id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Idea not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete idea",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
