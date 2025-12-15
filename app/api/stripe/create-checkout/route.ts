/**
 * @fileoverview Stripe Checkout Session Creation API
 * @description Creates Stripe checkout sessions for subscription purchases
 *
 * Security measures:
 * - Authentication required
 * - Rate limited to 3 requests per minute
 * - Price ID whitelist validation
 * - Secure redirect URL handling
 *
 * @endpoint POST /api/stripe/create-checkout
 * @access Authenticated users only
 */

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { checkoutRateLimiter, getRateLimitHeaders } from "@/lib/security/rate-limit";

// Initialize Stripe with explicit API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Allowed Stripe price IDs (whitelist approach for security)
 * @security Only allow known price IDs to prevent arbitrary charges
 */
const ALLOWED_PRICE_IDS = [
  "price_pro_monthly",
  "price_pro_yearly",
  "price_premium_monthly",
  "price_premium_yearly",
] as const;

const createCheckoutSchema = z.object({
  priceId: z.enum(ALLOWED_PRICE_IDS, {
    errorMap: () => ({ message: "Invalid price ID" }),
  }),
});

/**
 * Map price IDs to their Stripe price identifiers
 * In production, these should be actual Stripe price IDs from env
 */
const PRICE_ID_MAP: Record<string, string> = {
  price_pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
  price_pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "price_pro_yearly",
  price_premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "price_premium_monthly",
  price_premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "price_premium_yearly",
};

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
    const rateLimitResult = checkoutRateLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // 3. Validate input
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parseResult = createCheckoutSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      );
    }

    const { priceId } = parseResult.data;

    // 4. Get user profile and create/retrieve Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, error: "Failed to retrieve user profile" },
        { status: 500 }
      );
    }

    // 5. Get or create Stripe customer
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: profile?.email || user.email!,
          metadata: {
            supabase_user_id: user.id,
          },
        });
        customerId = customer.id;

        // Save customer ID to profile
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", user.id);
      } catch (customerError) {
        console.error("Stripe customer creation error:", customerError);
        return NextResponse.json(
          { success: false, error: "Failed to create customer record" },
          { status: 500 }
        );
      }
    }

    // 6. Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const stripePriceId = PRICE_ID_MAP[priceId];

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing?checkout=canceled`,
        metadata: {
          user_id: user.id,
          price_id: priceId,
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
          },
        },
        // Allow promotion codes
        allow_promotion_codes: true,
        // Collect billing address
        billing_address_collection: "required",
      });

      // 7. Return checkout URL
      return NextResponse.json(
        { success: true, data: { url: session.url } },
        {
          status: 200,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    } catch (stripeError) {
      console.error("Stripe checkout session error:", stripeError);

      if (stripeError instanceof Stripe.errors.StripeError) {
        if (stripeError.code === "resource_missing") {
          return NextResponse.json(
            { success: false, error: "Invalid price configuration. Please contact support." },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: "Failed to create checkout session" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
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
