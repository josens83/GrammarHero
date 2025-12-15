/**
 * @fileoverview Streak Freeze API Route
 * @description Handles streak freeze inventory and usage
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's streak freeze inventory
    const { data: freezes, error } = await supabase
      .from("user_streak_freezes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // Return default if no record exists
    const defaultFreezes = {
      available: 0,
      used_total: 0,
      last_used_at: null,
    };

    return NextResponse.json({
      success: true,
      data: freezes || defaultFreezes,
    });
  } catch (error) {
    console.error("Streak freeze API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch streak freezes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body; // "use" or "add"

    // Get current freeze inventory
    const { data: freezes } = await supabase
      .from("user_streak_freezes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (action === "use") {
      // Check if user has freezes available
      if (!freezes || freezes.available <= 0) {
        return NextResponse.json(
          { success: false, error: "No streak freezes available" },
          { status: 400 }
        );
      }

      // Check if already used today
      const today = new Date().toISOString().split("T")[0];
      if (freezes.last_used_at) {
        const lastUsedDate = new Date(freezes.last_used_at).toISOString().split("T")[0];
        if (lastUsedDate === today) {
          return NextResponse.json(
            { success: false, error: "Already used a streak freeze today" },
            { status: 400 }
          );
        }
      }

      // Use the freeze
      const { data: updated, error } = await supabase
        .from("user_streak_freezes")
        .update({
          available: freezes.available - 1,
          used_total: freezes.used_total + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "streak",
        title: "Streak Freeze Used",
        message: "Your streak is protected for today!",
        data: { type: "freeze_used", remaining: freezes.available - 1 },
      });

      return NextResponse.json({
        success: true,
        data: {
          used: true,
          remaining: updated.available,
        },
      });
    }

    if (action === "add") {
      const { amount } = body;
      const addAmount = amount || 1;

      // Upsert to add freezes
      const { data: updated, error } = await supabase
        .from("user_streak_freezes")
        .upsert(
          {
            user_id: user.id,
            available: (freezes?.available || 0) + addAmount,
            used_total: freezes?.used_total || 0,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: {
          added: addAmount,
          total: updated.available,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Streak freeze action error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process streak freeze" },
      { status: 500 }
    );
  }
}
