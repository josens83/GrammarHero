import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-11-20.acacia" });

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0].price.id;

      const tier = priceId.includes("premium") ? "premium" : "pro";

      if (userId) {
        await supabase.from("profiles").update({
          subscription_tier: tier,
          subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          hearts: tier !== "free" ? 999 : 5,
        }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase.from("profiles").select("id").eq("stripe_customer_id", customerId).single();

      if (profile) {
        const priceId = subscription.items.data[0].price.id;
        const tier = subscription.status === "active" ? (priceId.includes("premium") ? "premium" : "pro") : "free";

        await supabase.from("profiles").update({
          subscription_tier: tier,
          subscription_expires_at: subscription.status === "active" ? new Date(subscription.current_period_end * 1000).toISOString() : null,
        }).eq("id", profile.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase.from("profiles").select("id").eq("stripe_customer_id", customerId).single();

      if (profile) {
        await supabase.from("profiles").update({
          subscription_tier: "free",
          subscription_expires_at: null,
          hearts: 5,
        }).eq("id", profile.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
