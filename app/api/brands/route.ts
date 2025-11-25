import { NextRequest, NextResponse } from "next/server";
import {
  createBrand,
  getBrandsByUserId,
} from "@/lib/db/queries/brands";
import { CreateBrandSchema } from "@/types/brand";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/brands
 * List all brands for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { brands, total } = await getBrandsByUserId(userId, {
      limit,
      offset,
    });

    const response: ApiResponse<typeof brands> = {
      success: true,
      data: brands,
      meta: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/brands error:", error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch brands",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/brands
 * Create a new brand
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Validate request body
    const validation = CreateBrandSchema.safeParse(body);
    if (!validation.success) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: validation.error.issues,
        },
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const brand = await createBrand(userId, validation.data);

    const response: ApiResponse<typeof brand> = {
      success: true,
      data: brand,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/brands error:", error);

    // Handle unique constraint violations (duplicate slug)
    if (error.code === "P2002") {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: "DUPLICATE_ENTRY",
          message: "A brand with this slug already exists",
        },
      };

      return NextResponse.json(errorResponse, { status: 409 });
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create brand",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
