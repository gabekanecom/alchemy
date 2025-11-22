import { NextRequest, NextResponse } from "next/server";
import {
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandWithStats,
} from "@/lib/db/queries/brands";
import { UpdateBrandSchema } from "@/types/brand";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/brands/[id]
 * Get a single brand by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("includeStats") === "true";

    let brand;
    if (includeStats) {
      brand = await getBrandWithStats(params.id, userId);
    } else {
      brand = await getBrandById(params.id, userId);
    }

    if (!brand) {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Brand not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse<typeof brand> = {
      success: true,
      data: brand,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`GET /api/brands/${params.id} error:`, error);

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch brand",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PATCH /api/brands/[id]
 * Update a brand
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Validate request body
    const validation = UpdateBrandSchema.safeParse(body);
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

    const brand = await updateBrand(params.id, userId, validation.data);

    const response: ApiResponse<typeof brand> = {
      success: true,
      data: brand,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`PATCH /api/brands/${params.id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Brand not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Handle unique constraint violations
    if (error.code === "P2002") {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "DUPLICATE_ENTRY",
          message: "A brand with this slug already exists",
        },
      };

      return NextResponse.json(errorResponse, { status: 409 });
    }

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update brand",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/brands/[id]
 * Delete a brand
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();

    await deleteBrand(params.id, userId);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`DELETE /api/brands/${params.id} error:`, error);

    // Handle not found
    if (error.code === "P2025") {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Brand not found",
        },
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete brand",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
