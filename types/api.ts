import { z } from "zod";

// ============================================
// GENERIC API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================
// PAGINATION
// ============================================

export const PaginationSchema = z.object({
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

// ============================================
// FILTERING
// ============================================

export const FilterSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type FilterParams = z.infer<typeof FilterSchema>;

// ============================================
// ERROR CODES
// ============================================

export enum ErrorCode {
  // Generic
  INTERNAL_ERROR = "INTERNAL_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // Brand
  BRAND_NOT_FOUND = "BRAND_NOT_FOUND",
  BRAND_SLUG_EXISTS = "BRAND_SLUG_EXISTS",
  BRAND_LIMIT_REACHED = "BRAND_LIMIT_REACHED",

  // Idea
  IDEA_NOT_FOUND = "IDEA_NOT_FOUND",

  // Content
  CONTENT_NOT_FOUND = "CONTENT_NOT_FOUND",
  CONTENT_GENERATION_FAILED = "CONTENT_GENERATION_FAILED",
  QUEUE_FULL = "QUEUE_FULL",

  // API
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  API_KEY_MISSING = "API_KEY_MISSING",
  API_KEY_INVALID = "API_KEY_INVALID",
}

// ============================================
// HTTP STATUS CODES
// ============================================

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

// ============================================
// REQUEST CONTEXT
// ============================================

export interface RequestContext {
  userId: string;
  userEmail?: string;
  requestId?: string;
}

// ============================================
// WEBHOOK PAYLOAD TYPES
// ============================================

export interface WebhookPayload<T = any> {
  event: string;
  timestamp: string;
  data: T;
  signature?: string;
}

// ============================================
// JOB RESULT TYPES
// ============================================

export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    duration: number;
    retries: number;
    [key: string]: any;
  };
}
