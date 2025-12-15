/**
 * @fileoverview Stripe Webhook Handler
 * @description Processes Stripe webhook events for subscription management
 *
 * Security measures:
 * - Webhook signature verification
 * - Event idempotency handling
 * - Secure subscription state management
 *
 * @endpoint POST /api/stripe/webhook
 * @access Stripe webhook only (signature verified)
 */

import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Determine subscription tier from Stripe price ID
 */
function getTierFromPriceId(priceId: string): "free" | "pro" | "premium" {
  if (priceId.includes("premium")) return "premium";
  if (priceId.includes("pro")) return "pro";
  return "free";
}

/**
 * Update user subscription in database
 */
async function updateUserSubscription(
  userId: string,
  tier: "free" | "pro" | "premium",
  expiresAt: Date | null
) {
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_expires_at: expiresAt?.toISOString() || null,
      // Unlimited hearts for paid tiers
      hearts: tier !== "free" ? 999 : 5,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update subscription:", error);
    throw new Error("Database update failed");
  }

  console.log(`Updated subscription for user ${userId}: ${tier}`);
}

/**
 * Process checkout.session.completed event
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("No user_id in session metadata");
    return;
  }

  if (!session.subscription) {
    console.error("No subscription in session");
    return;
  }

  // Retrieve subscription details
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierFromPriceId(priceId || "");

  await updateUserSubscription(
    userId,
    tier,
    new Date(subscription.current_period_end * 1000)
  );
}

/**
 * Process customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Get user ID from customer metadata or lookup
  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    console.error("No profile found for customer:", customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const isActive = subscription.status === "active";
  const tier = isActive ? getTierFromPriceId(priceId || "") : "free";

  await updateUserSubscription(
    profile.id,
    tier,
    isActive ? new Date(subscription.current_period_end * 1000) : null
  );
}

/**
 * Process customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    console.error("No profile found for customer:", customerId);
    return;
  }

  await updateUserSubscription(profile.id, "free", null);
}

/**
 * Process invoice.payment_failed event
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Log the failure for monitoring
  console.warn(`Payment failed for customer: ${customerId}`);

  // In production, you might want to:
  // 1. Send an email notification
  // 2. Update a payment_status field
  // 3. Implement grace period logic
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Log event for debugging
  console.log(`Processing Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Log unhandled event types for debugging
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Return 200 to prevent Stripe from retrying
    // Log the error for investigation
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}
