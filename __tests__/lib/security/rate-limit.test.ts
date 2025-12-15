/**
 * @fileoverview Tests for rate limiting utility
 * @description Unit tests for rate limiter functionality
 */

import {
  createRateLimiter,
  aiRateLimiter,
  authRateLimiter,
  checkoutRateLimiter,
  apiRateLimiter,
} from "@/lib/security/rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    // Clear any existing rate limit state
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should allow requests within limit", () => {
    const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });

    for (let i = 0; i < 5; i++) {
      const result = limiter.check("user-1");
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it("should block requests over limit", () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });

    // Use up all requests
    for (let i = 0; i < 3; i++) {
      limiter.check("user-1");
    }

    // Next request should be blocked
    const result = limiter.check("user-1");
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should track users independently", () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });

    // User 1 uses their limit
    limiter.check("user-1");
    limiter.check("user-1");

    // User 2 should still have their full limit
    const result = limiter.check("user-2");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should reset after window expires", () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });

    // Use up all requests
    limiter.check("user-1");
    limiter.check("user-1");

    // Should be blocked
    expect(limiter.check("user-1").success).toBe(false);

    // Advance time past window
    jest.advanceTimersByTime(60001);

    // Should be allowed again
    const result = limiter.check("user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should provide correct reset time", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });

    const firstCheck = limiter.check("user-1");
    expect(firstCheck.success).toBe(true);
    expect(firstCheck.resetTime).toBeGreaterThan(Date.now());

    const secondCheck = limiter.check("user-1");
    expect(secondCheck.success).toBe(false);
    expect(secondCheck.resetTime).toBeGreaterThan(Date.now());
  });

  it("should handle reset functionality", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });

    // Use up the limit
    limiter.check("user-1");
    expect(limiter.check("user-1").success).toBe(false);

    // Reset the user
    limiter.reset("user-1");

    // Should be allowed again
    expect(limiter.check("user-1").success).toBe(true);
  });
});

describe("Pre-configured rate limiters", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("aiRateLimiter", () => {
    it("should allow 10 requests per minute", () => {
      const testUser = "ai-test-user";

      // Should allow 10 requests
      for (let i = 0; i < 10; i++) {
        const result = aiRateLimiter.check(testUser);
        expect(result.success).toBe(true);
      }

      // 11th should be blocked
      expect(aiRateLimiter.check(testUser).success).toBe(false);

      // Clean up
      aiRateLimiter.reset(testUser);
    });
  });

  describe("authRateLimiter", () => {
    it("should allow 5 requests per minute", () => {
      const testUser = "auth-test-user";

      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        const result = authRateLimiter.check(testUser);
        expect(result.success).toBe(true);
      }

      // 6th should be blocked
      expect(authRateLimiter.check(testUser).success).toBe(false);

      // Clean up
      authRateLimiter.reset(testUser);
    });
  });

  describe("checkoutRateLimiter", () => {
    it("should allow 3 requests per minute", () => {
      const testUser = "checkout-test-user";

      // Should allow 3 requests
      for (let i = 0; i < 3; i++) {
        const result = checkoutRateLimiter.check(testUser);
        expect(result.success).toBe(true);
      }

      // 4th should be blocked
      expect(checkoutRateLimiter.check(testUser).success).toBe(false);

      // Clean up
      checkoutRateLimiter.reset(testUser);
    });
  });

  describe("apiRateLimiter", () => {
    it("should allow 100 requests per minute", () => {
      const testUser = "api-test-user";

      // Should allow 100 requests
      for (let i = 0; i < 100; i++) {
        const result = apiRateLimiter.check(testUser);
        expect(result.success).toBe(true);
      }

      // 101st should be blocked
      expect(apiRateLimiter.check(testUser).success).toBe(false);

      // Clean up
      apiRateLimiter.reset(testUser);
    });
  });
});
