/**
 * @fileoverview API utility functions
 * @description Provides common utilities for API route handlers
 *
 * Features:
 * - Standardized error responses
 * - Request validation
 * - Authentication helpers
 * - Response formatting
 */

import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiSecurityHeaders, getRateLimitHeaders } from "@/lib/security/headers";
import type { RateLimitResult } from "@/lib/security/rate-limit";

// =============================================================================
// Types
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export type RateLimitResultType = {
  success: boolean;
  remaining: number;
  resetTime: number;
};

// =============================================================================
// Error Codes
// =============================================================================

export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
} as const;

// =============================================================================
// Response Helpers
// =============================================================================

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  status = 200,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { success: true, data } as ApiResponse<T>,
    {
      status,
      headers: { ...apiSecurityHeaders, ...headers },
    }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  message: string,
  status: number,
  code?: string,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { success: false, error: message, code } as ApiResponse,
    {
      status,
      headers: { ...apiSecurityHeaders, ...headers },
    }
  );
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(result: RateLimitResultType): NextResponse {
  return errorResponse(
    "Too many requests. Please try again later.",
    429,
    ErrorCodes.RATE_LIMITED,
    getRateLimitHeaders(result as RateLimitResult)
  );
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = "Authentication required"): NextResponse {
  return errorResponse(message, 401, ErrorCodes.UNAUTHORIZED);
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message = "Access denied"): NextResponse {
  return errorResponse(message, 403, ErrorCodes.FORBIDDEN);
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(message: string): NextResponse {
  return errorResponse(message, 400, ErrorCodes.VALIDATION_ERROR);
}

// =============================================================================
// Request Helpers
// =============================================================================

/**
 * Parse and validate JSON body from request
 */
export async function parseAndValidate<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        response: validationErrorResponse(errors),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: validationErrorResponse("Invalid JSON body"),
      };
    }
    return {
      success: false,
      response: errorResponse("Failed to parse request body", 400, ErrorCodes.BAD_REQUEST),
    };
  }
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
    };
  } catch {
    return null;
  }
}

/**
 * Require authenticated user, returns error response if not authenticated
 */
export async function requireAuth(): Promise<
  { success: true; user: AuthenticatedUser } | { success: false; response: NextResponse }
> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      response: unauthorizedResponse(),
    };
  }

  return { success: true, user };
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(
  userId: string
): Promise<"free" | "pro" | "premium"> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", userId)
      .single();

    return (data?.subscription_tier as "free" | "pro" | "premium") || "free";
  } catch {
    return "free";
  }
}

/**
 * Check if user has required subscription tier
 */
export async function requireSubscription(
  userId: string,
  requiredTiers: ("pro" | "premium")[]
): Promise<{ success: true; tier: string } | { success: false; response: NextResponse }> {
  const tier = await getUserSubscriptionTier(userId);

  if (!requiredTiers.includes(tier as "pro" | "premium")) {
    return {
      success: false,
      response: forbiddenResponse(
        `This feature requires ${requiredTiers.join(" or ")} subscription`
      ),
    };
  }

  return { success: true, tier };
}

// =============================================================================
// Error Handler
// =============================================================================

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch((error) => {
    console.error("API Error:", error);

    if (error instanceof ZodError) {
      const message = error.errors.map((e) => e.message).join(", ");
      return validationErrorResponse(message);
    }

    return errorResponse(
      "An unexpected error occurred",
      500,
      ErrorCodes.INTERNAL_ERROR
    );
  });
}

// =============================================================================
// Logging
// =============================================================================

/**
 * Log API request for debugging and monitoring
 */
export function logApiRequest(
  method: string,
  path: string,
  userId?: string,
  metadata?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method,
        path,
        userId,
        ...metadata,
      })
    );
  }
}
