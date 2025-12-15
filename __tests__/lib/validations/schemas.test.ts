/**
 * @fileoverview Tests for Zod validation schemas
 * @description Unit tests for input validation schemas
 */

import {
  emailSchema,
  loginSchema,
  signupSchema,
  grammarCheckSchema,
  createCheckoutSchema,
  updateProfileSchema,
  submitAnswerSchema,
  completeLessonSchema,
  validateInput,
  sanitizeString,
  ALLOWED_PRICE_IDS,
} from "@/lib/validations/schemas";

describe("emailSchema", () => {
  it("should accept valid email", () => {
    const result = emailSchema.safeParse("test@example.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("should convert email to lowercase", () => {
    const result = emailSchema.safeParse("TEST@EXAMPLE.COM");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("should trim whitespace", () => {
    const result = emailSchema.safeParse("  test@example.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("should reject invalid email", () => {
    const result = emailSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("should reject email over 255 characters", () => {
    const longEmail = "a".repeat(250) + "@test.com";
    const result = emailSchema.safeParse(longEmail);
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should accept valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject password under 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password over 128 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("should accept valid signup data", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("should require uppercase letter in password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("should require lowercase letter in password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "PASSWORD123",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("should require number in password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "PasswordABC",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty name", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("grammarCheckSchema", () => {
  it("should accept valid text", () => {
    const result = grammarCheckSchema.safeParse({
      text: "This is a test sentence.",
    });
    expect(result.success).toBe(true);
  });

  it("should trim whitespace", () => {
    const result = grammarCheckSchema.safeParse({
      text: "  This is a test sentence.  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("This is a test sentence.");
    }
  });

  it("should reject empty text", () => {
    const result = grammarCheckSchema.safeParse({
      text: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject text over 10,000 characters", () => {
    const result = grammarCheckSchema.safeParse({
      text: "a".repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it("should accept text exactly at limit", () => {
    const result = grammarCheckSchema.safeParse({
      text: "a".repeat(10000),
    });
    expect(result.success).toBe(true);
  });
});

describe("createCheckoutSchema", () => {
  it("should accept allowed price IDs", () => {
    ALLOWED_PRICE_IDS.forEach((priceId) => {
      const result = createCheckoutSchema.safeParse({ priceId });
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid price ID", () => {
    const result = createCheckoutSchema.safeParse({
      priceId: "invalid_price_id",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty price ID", () => {
    const result = createCheckoutSchema.safeParse({
      priceId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("should accept valid profile update", () => {
    const result = updateProfileSchema.safeParse({
      displayName: "Test User",
      username: "testuser",
      dailyGoal: 10,
    });
    expect(result.success).toBe(true);
  });

  it("should reject username with special characters", () => {
    const result = updateProfileSchema.safeParse({
      username: "test-user!",
    });
    expect(result.success).toBe(false);
  });

  it("should reject username under 3 characters", () => {
    const result = updateProfileSchema.safeParse({
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("should reject daily goal over 50", () => {
    const result = updateProfileSchema.safeParse({
      dailyGoal: 51,
    });
    expect(result.success).toBe(false);
  });

  it("should reject daily goal under 1", () => {
    const result = updateProfileSchema.safeParse({
      dailyGoal: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should allow partial updates", () => {
    const result = updateProfileSchema.safeParse({
      displayName: "New Name",
    });
    expect(result.success).toBe(true);
  });
});

describe("submitAnswerSchema", () => {
  it("should accept valid answer submission", () => {
    const result = submitAnswerSchema.safeParse({
      lessonId: "lesson-1",
      exerciseId: "exercise-1",
      answer: "My answer",
      timeSpent: 30,
    });
    expect(result.success).toBe(true);
  });

  it("should reject negative time spent", () => {
    const result = submitAnswerSchema.safeParse({
      lessonId: "lesson-1",
      exerciseId: "exercise-1",
      answer: "My answer",
      timeSpent: -1,
    });
    expect(result.success).toBe(false);
  });

  it("should reject time spent over 1 hour", () => {
    const result = submitAnswerSchema.safeParse({
      lessonId: "lesson-1",
      exerciseId: "exercise-1",
      answer: "My answer",
      timeSpent: 3601,
    });
    expect(result.success).toBe(false);
  });
});

describe("completeLessonSchema", () => {
  it("should accept valid lesson completion", () => {
    const result = completeLessonSchema.safeParse({
      lessonId: "lesson-1",
      score: 85,
      timeSpent: 300,
      correctAnswers: 8,
      totalQuestions: 10,
    });
    expect(result.success).toBe(true);
  });

  it("should reject score over 100", () => {
    const result = completeLessonSchema.safeParse({
      lessonId: "lesson-1",
      score: 101,
      timeSpent: 300,
      correctAnswers: 10,
      totalQuestions: 10,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative score", () => {
    const result = completeLessonSchema.safeParse({
      lessonId: "lesson-1",
      score: -1,
      timeSpent: 300,
      correctAnswers: 0,
      totalQuestions: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe("validateInput", () => {
  it("should return success with valid data", () => {
    const result = validateInput(emailSchema, "test@example.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("should return error message with invalid data", () => {
    const result = validateInput(emailSchema, "invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe("sanitizeString", () => {
  it("should escape HTML special characters", () => {
    const result = sanitizeString("<script>alert('xss')</script>");
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
  });

  it("should escape quotes", () => {
    const result = sanitizeString('"test" and \'test\'');
    expect(result).not.toContain('"');
    expect(result).not.toContain("'");
    expect(result).toContain("&quot;");
    expect(result).toContain("&#x27;");
  });

  it("should escape forward slashes", () => {
    const result = sanitizeString("test/path");
    expect(result).toContain("&#x2F;");
  });
});
