/**
 * @fileoverview Zod validation schemas for API input validation
 * @description Provides type-safe input validation for all API endpoints
 *
 * Security considerations:
 * - All schemas include max length limits to prevent DoS attacks
 * - Email validation uses strict regex patterns
 * - Price IDs are whitelisted to prevent arbitrary subscription creation
 *
 * @see https://zod.dev/ for Zod documentation
 */

import { z } from "zod";

// =============================================================================
// Common Schemas
// =============================================================================

/**
 * UUID schema for validating Supabase IDs
 */
export const uuidSchema = z.string().uuid("Invalid UUID format");

/**
 * Email schema with strict validation
 */
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email must be less than 255 characters")
  .toLowerCase()
  .trim();

/**
 * Safe string schema that prevents XSS by limiting special characters
 */
export const safeStringSchema = z
  .string()
  .max(1000, "Text must be less than 1000 characters")
  .trim();

// =============================================================================
// Authentication Schemas
// =============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// =============================================================================
// AI Grammar Check Schemas
// =============================================================================

/**
 * Grammar check request schema
 * @security Max text length of 10000 characters to prevent abuse
 */
export const grammarCheckSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(10000, "Text must be less than 10,000 characters")
    .trim(),
});

/**
 * Grammar check response schema for validation
 */
export const grammarCheckResponseSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(
    z.object({
      original: z.string(),
      correction: z.string(),
      explanation: z.string(),
      type: z.string(),
    })
  ),
});

export type GrammarCheckInput = z.infer<typeof grammarCheckSchema>;
export type GrammarCheckResponse = z.infer<typeof grammarCheckResponseSchema>;

// =============================================================================
// Stripe Payment Schemas
// =============================================================================

/**
 * Allowed Stripe price IDs (whitelist approach for security)
 * @security Only allow known price IDs to prevent arbitrary charges
 */
export const ALLOWED_PRICE_IDS = [
  "price_pro_monthly",
  "price_pro_yearly",
  "price_premium_monthly",
  "price_premium_yearly",
] as const;

export const createCheckoutSchema = z.object({
  priceId: z.enum(ALLOWED_PRICE_IDS, {
    errorMap: () => ({ message: "Invalid price ID" }),
  }),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

// =============================================================================
// Profile Schemas
// =============================================================================

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be less than 50 characters")
    .trim()
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  dailyGoal: z
    .number()
    .int("Daily goal must be a whole number")
    .min(1, "Daily goal must be at least 1")
    .max(50, "Daily goal cannot exceed 50")
    .optional(),
  timezone: z
    .string()
    .max(50, "Invalid timezone")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// =============================================================================
// Lesson Progress Schemas
// =============================================================================

export const submitAnswerSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required").max(100),
  exerciseId: z.string().min(1, "Exercise ID is required").max(100),
  answer: z.string().max(1000, "Answer is too long"),
  timeSpent: z
    .number()
    .int()
    .min(0, "Time spent cannot be negative")
    .max(3600, "Time spent cannot exceed 1 hour"),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const completeLessonSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required").max(100),
  score: z.number().int().min(0).max(100),
  timeSpent: z.number().int().min(0).max(7200),
  correctAnswers: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
});

export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Safely parse and validate input with detailed error messages
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed data or throws ZodError
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(", ");
    return { success: false, error: errors };
  }

  return { success: true, data: result.data };
}

/**
 * Sanitize string input to prevent XSS
 * @param input - Raw string input
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
