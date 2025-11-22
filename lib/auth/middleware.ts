import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "./utils";
import type { ApiError } from "@/types/api";

/**
 * Middleware to require authentication for API routes
 * Usage: export const GET = withAuth(async (request, userId) => { ... })
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, userId: string, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T) => {
    const userId = await getCurrentUserId();

    if (!userId) {
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      };

      return NextResponse.json(errorResponse, { status: 401 });
    }

    return handler(request, userId, ...args);
  };
}

/**
 * Optional auth - provides userId if authenticated, null otherwise
 */
export function withOptionalAuth<T extends any[]>(
  handler: (request: NextRequest, userId: string | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T) => {
    const userId = await getCurrentUserId();
    return handler(request, userId, ...args);
  };
}
