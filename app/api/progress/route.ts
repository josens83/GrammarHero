/**
 * @fileoverview Progress API Route
 * @description Handles user learning progress tracking
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

    // Get user's lesson progress
    const { data: lessonProgress } = await supabase
      .from("user_lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    // Get user's daily activity
    const { data: dailyActivity } = await supabase
      .from("user_daily_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    // Calculate statistics
    const completedLessons = (lessonProgress || []).filter(
      (p) => p.progress_percentage === 100
    ).length;
    const totalLessons = lessonProgress?.length || 0;
    const averageScore =
      lessonProgress && lessonProgress.length > 0
        ? Math.round(
            lessonProgress.reduce((acc, p) => acc + (p.best_score || 0), 0) /
              lessonProgress.length
          )
        : 0;

    // Get weekly XP
    const weeklyXp = (dailyActivity || [])
      .slice(0, 7)
      .reduce((acc, d) => acc + (d.xp_earned || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        lessonProgress: lessonProgress || [],
        dailyActivity: dailyActivity || [],
        stats: {
          completedLessons,
          totalLessons,
          averageScore,
          weeklyXp,
        },
      },
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
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
    const { lessonId, progressPercentage, score, xpEarned, timeSpentSeconds } = body;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: "Lesson ID required" },
        { status: 400 }
      );
    }

    // Upsert lesson progress
    const { data: progress, error: progressError } = await supabase
      .from("user_lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          progress_percentage: progressPercentage,
          best_score: score,
          time_spent_seconds: timeSpentSeconds,
          last_attempted_at: new Date().toISOString(),
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
        },
        {
          onConflict: "user_id,lesson_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (progressError) {
      console.error("Progress upsert error:", progressError);
    }

    // Update daily activity
    const today = new Date().toISOString().split("T")[0];
    const { data: existingActivity } = await supabase
      .from("user_daily_activity")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (existingActivity) {
      await supabase
        .from("user_daily_activity")
        .update({
          lessons_completed: existingActivity.lessons_completed + (progressPercentage === 100 ? 1 : 0),
          xp_earned: existingActivity.xp_earned + (xpEarned || 0),
          time_spent_seconds: existingActivity.time_spent_seconds + (timeSpentSeconds || 0),
        })
        .eq("id", existingActivity.id);
    } else {
      await supabase.from("user_daily_activity").insert({
        user_id: user.id,
        date: today,
        lessons_completed: progressPercentage === 100 ? 1 : 0,
        xp_earned: xpEarned || 0,
        time_spent_seconds: timeSpentSeconds || 0,
      });
    }

    // Update user XP and streak
    if (xpEarned) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, current_streak, last_activity_date")
        .eq("id", user.id)
        .single();

      if (profile) {
        const lastActivity = profile.last_activity_date
          ? new Date(profile.last_activity_date)
          : null;
        const now = new Date();
        const isConsecutiveDay =
          lastActivity &&
          now.getTime() - lastActivity.getTime() < 48 * 60 * 60 * 1000 &&
          now.toDateString() !== lastActivity.toDateString();

        await supabase
          .from("profiles")
          .update({
            total_xp: profile.total_xp + xpEarned,
            current_streak: isConsecutiveDay ? profile.current_streak + 1 : 1,
            last_activity_date: now.toISOString(),
          })
          .eq("id", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      data: { progress },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
