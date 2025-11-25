import { NextRequest, NextResponse } from "next/server";
import {
  getPublicationById,
  updatePublication,
  deletePublication,
  getPublicationWithContent,
} from "@/lib/db/queries/publications";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/publications/[id]
 * Get a single publication by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get("includeContent") === "true";

    let publication;
    if (includeContent) {
      publication = await getPublicationWithContent(id, userId);
    } else {
      publication = await getPublicationById(id, userId);
    }

    if (!publication) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Publication not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse<typeof publication> = {
      success: true,
      data: publication,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`GET /api/publications/${id} error:`, error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch publication",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PATCH /api/publications/[id]
 * Update a publication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId();
    const body = await request.json();

    const publication = await updatePublication(id, userId, body);

    const response: ApiResponse<typeof publication> = {
      success: true,
      data: publication,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`PATCH /api/publications/${id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Publication not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update publication",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/publications/[id]
 * Delete a publication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId();

    await deletePublication(id, userId);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`DELETE /api/publications/${id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Publication not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete publication",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
