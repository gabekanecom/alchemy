import { NextRequest, NextResponse } from "next/server";
import {
  createContentQueue,
  getContentQueue,
} from "@/lib/db/queries/content";
import { contentQueue } from "@/lib/queues/content-queue";
import { CreateContentQueueSchema } from "@/types/content";
import type { ApiResponse, ApiError } from "@/types/api";

// TODO: Replace with real auth when implemented
const getUserId = () => "temp-user-id";

/**
 * GET /api/content/queue
 * List content queue entries
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(request.url);

    const options = {
      status: searchParams.get("status") as any,
      brandId: searchParams.get("brandId") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const { queue, total } = await getContentQueue(userId, options);

    const response: ApiResponse<typeof queue> = {
      success: true,
      data: queue,
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
    console.error("GET /api/content/queue error:", error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch content queue",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/content/queue
 * Add content to generation queue
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    const body = await request.json();

    // Validate request body
    const validation = CreateContentQueueSchema.safeParse(body);
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

    // Create queue entry in database
    const queueEntry = await createContentQueue(userId, validation.data);

    // Add job to BullMQ queue
    const job = await contentQueue.add("generate-content", {
      queueId: queueEntry.id,
      userId,
      brandId: queueEntry.brandId || undefined,
      platform: queueEntry.platform,
      contentType: queueEntry.contentType,
      generationConfig: queueEntry.generationConfig as any,
    });

    const response: ApiResponse<typeof queueEntry> = {
      success: true,
      data: {
        ...queueEntry,
        jobId: job.id as string,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/content/queue error:", error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to add content to queue",
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
