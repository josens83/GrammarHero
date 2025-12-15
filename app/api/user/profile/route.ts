/**
 * @fileoverview User Profile API Route
 * @description Handles user profile retrieval and updates
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

    // Get full profile with all related data
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    // Get achievements
    const { data: achievements } = await supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", user.id);

    // Get lesson progress stats
    const { data: progress } = await supabase
      .from("user_lesson_progress")
      .select("id, progress_percentage, best_score")
      .eq("user_id", user.id);

    const completedLessons = (progress || []).filter(
      (p) => p.progress_percentage === 100
    ).length;
    const perfectLessons = (progress || []).filter(
      (p) => p.best_score === 100
    ).length;
    const averageScore =
      progress && progress.length > 0
        ? Math.round(
            progress.reduce((acc, p) => acc + (p.best_score || 0), 0) /
              progress.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...profile,
          email: user.email,
        },
        achievements: achievements || [],
        stats: {
          completedLessons,
          perfectLessons,
          averageScore,
          totalAchievements: achievements?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Allowed fields to update
    const allowedFields = [
      "display_name",
      "avatar_url",
      "daily_goal",
      "preferred_difficulty",
      "notification_preferences",
      "theme_preference",
      "language_preference",
    ];

    // Filter to only allowed fields
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Delete user data in order (respecting foreign keys)
    await supabase.from("user_achievements").delete().eq("user_id", user.id);
    await supabase.from("user_lesson_progress").delete().eq("user_id", user.id);
    await supabase.from("user_daily_activity").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);

    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      // If admin delete fails, sign out user at least
      await supabase.auth.signOut();
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
