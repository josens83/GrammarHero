/**
 * @fileoverview Simple in-memory rate limiting for API routes
 * @description Provides rate limiting without external dependencies
 *
 * Limitations:
 * - Memory-based: Resets on server restart
 * - Not suitable for distributed deployments (use Redis for production)
 *
 * For production with multiple instances, use @upstash/ratelimit with Redis
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
 * const result = await limiter.check(userId);
 * if (!result.success) {
 *   return new Response("Too many requests", { status: 429 });
 * }
 * ```
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * In-memory store for rate limit entries
 * Key: identifier (userId or IP)
 * Value: RateLimitEntry
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval to prevent memory leaks
 * Removes expired entries every 5 minutes
 */
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

/**
 * Creates a rate limiter with the specified configuration
 *
 * @param config - Rate limit configuration
 * @returns Rate limiter object with check method
 *
 * @example
 * ```typescript
 * // Limit to 10 requests per minute
 * const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
 *
 * // Check if request is allowed
 * const result = await limiter.check("user-123");
 * console.log(result.success); // true or false
 * console.log(result.remaining); // remaining requests
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  startCleanup();

  return {
    /**
     * Check if a request is allowed for the given identifier
     * @param identifier - Unique identifier (userId, IP address, etc.)
     * @returns Rate limit result
     */
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = rateLimitStore.get(identifier);

      // If no entry exists or window has expired, create new entry
      if (!entry || entry.resetTime < now) {
        rateLimitStore.set(identifier, {
          count: 1,
          resetTime: now + config.windowMs,
        });

        return {
          success: true,
          remaining: config.maxRequests - 1,
          resetTime: now + config.windowMs,
        };
      }

      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetTime: entry.resetTime,
        };
      }

      // Increment counter
      entry.count += 1;
      rateLimitStore.set(identifier, entry);

      return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    },

    /**
     * Reset rate limit for an identifier (useful for testing)
     * @param identifier - Unique identifier to reset
     */
    reset(identifier: string): void {
      rateLimitStore.delete(identifier);
    },

    /**
     * Get current rate limit status without incrementing
     * @param identifier - Unique identifier to check
     * @returns Current rate limit status
     */
    getStatus(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = rateLimitStore.get(identifier);

      if (!entry || entry.resetTime < now) {
        return {
          success: true,
          remaining: config.maxRequests,
          resetTime: now + config.windowMs,
        };
      }

      return {
        success: entry.count < config.maxRequests,
        remaining: Math.max(0, config.maxRequests - entry.count),
        resetTime: entry.resetTime,
      };
    },
  };
}

// =============================================================================
// Pre-configured Rate Limiters
// =============================================================================

/**
 * Rate limiter for AI endpoints (more restrictive)
 * 10 requests per minute per user
 */
export const aiRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP (to prevent brute force)
 */
export const authRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Rate limiter for general API endpoints
 * 100 requests per minute per user
 */
export const apiRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Rate limiter for Stripe checkout
 * 3 requests per minute per user (to prevent abuse)
 */
export const checkoutRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000, // 1 minute
});

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Extract client IP from request headers
 * Handles various proxy headers
 *
 * @param request - Incoming request
 * @returns Client IP address or "unknown"
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Create rate limit response headers
 *
 * @param result - Rate limit check result
 * @returns Headers object with rate limit information
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    ...(result.success ? {} : { "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString() }),
  };
}
