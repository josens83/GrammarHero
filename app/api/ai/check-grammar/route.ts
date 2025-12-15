/**
 * @fileoverview AI Grammar Check API Route
 * @description Analyzes text for grammar errors using Claude AI
 *
 * Security measures:
 * - Authentication required
 * - Pro/Premium subscription required
 * - Rate limited to 10 requests per minute
 * - Input validation with max length (10,000 chars)
 * - Response validation
 *
 * @endpoint POST /api/ai/check-grammar
 * @access Pro/Premium subscribers only
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { aiRateLimiter, getRateLimitHeaders } from "@/lib/security/rate-limit";

// Initialize Anthropic client
const anthropic = new Anthropic();

// Validation schemas
const grammarCheckSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(10000, "Text must be less than 10,000 characters")
    .trim(),
});

const grammarCheckResponseSchema = z.object({
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

/**
 * Grammar check prompt template
 */
const GRAMMAR_CHECK_PROMPT = `You are a professional English grammar checker. Analyze the following text for grammar errors.

For each error found, provide:
1. The original text containing the error
2. The corrected version
3. A brief, clear explanation of the grammar rule
4. The type of error (e.g., "Subject-Verb Agreement", "Tense", "Article", "Punctuation")

Also provide an overall grammar score from 0-100 based on:
- 100: No errors
- 80-99: Minor errors (punctuation, minor style issues)
- 60-79: Some errors (a few grammar mistakes)
- 40-59: Multiple errors
- 0-39: Many significant errors

IMPORTANT: You MUST respond with valid JSON only, no other text. Use this exact format:
{
  "score": <number>,
  "issues": [
    {
      "original": "<text with error>",
      "correction": "<corrected text>",
      "explanation": "<brief explanation>",
      "type": "<error type>"
    }
  ]
}

If there are no errors, respond with: {"score": 100, "issues": []}

Text to analyze:
`;

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check rate limit
    const rateLimitResult = aiRateLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // 3. Check subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_tier === "free") {
      return NextResponse.json(
        { success: false, error: "Pro subscription required for AI grammar check" },
        { status: 403 }
      );
    }

    // 4. Validate input
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parseResult = grammarCheckSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      );
    }

    const { text } = parseResult.data;

    // 5. Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `${GRAMMAR_CHECK_PROMPT}${text}`,
        },
      ],
    });

    // 6. Parse and validate response
    const content = response.content[0];
    if (content.type !== "text") {
      console.error("Unexpected Claude response type:", content.type);
      return NextResponse.json(
        { success: false, error: "Unexpected AI response format" },
        { status: 500 }
      );
    }

    // Try to parse JSON response
    let result;
    try {
      // Remove any potential markdown code blocks
      const cleanedText = content.text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", content.text);
      return NextResponse.json(
        { success: false, error: "Failed to parse grammar check results" },
        { status: 500 }
      );
    }

    // Validate response structure
    const validationResult = grammarCheckResponseSchema.safeParse(result);
    if (!validationResult.success) {
      console.error("Invalid response structure:", validationResult.error);
      return NextResponse.json(
        { success: false, error: "Invalid grammar check results format" },
        { status: 500 }
      );
    }

    // 7. Return success response
    return NextResponse.json(
      { success: true, data: validationResult.data },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error("Grammar check error:", error);

    // Check for specific Anthropic errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          { success: false, error: "AI service is temporarily busy. Please try again later." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to analyze grammar. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
