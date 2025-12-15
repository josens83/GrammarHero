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
      .from("user_progress")
      .select("*, lessons(title, category_id, difficulty)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    // Get user's daily activity (streak history)
    const { data: dailyActivity } = await supabase
      .from("streak_history")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    // Calculate statistics
    const completedLessons = (lessonProgress || []).filter(
      (p) => p.status === "completed"
    ).length;
    const totalLessons = lessonProgress?.length || 0;
    const averageScore =
      lessonProgress && lessonProgress.length > 0
        ? Math.round(
            lessonProgress.reduce((acc, p) => acc + (p.score || 0), 0) /
              lessonProgress.length
          )
        : 0;

    // Get weekly XP
    const weeklyXp = (dailyActivity || [])
      .slice(0, 7)
      .reduce((acc, d) => acc + (d.xp_earned || 0), 0);

    // Calculate total time spent (convert minutes to seconds for compatibility)
    const totalTimeMinutes = (dailyActivity || [])
      .reduce((acc, d) => acc + (d.time_spent_minutes || 0), 0);

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
          totalTimeMinutes,
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
    const { lessonId, status, score, xpEarned, timeSpentMinutes, isPerfect } = body;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: "Lesson ID required" },
        { status: 400 }
      );
    }

    // Check if progress exists
    const { data: existingProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .single();

    const isCompleted = status === "completed";
    const progressData = {
      user_id: user.id,
      lesson_id: lessonId,
      status: status || "in_progress",
      score: existingProgress
        ? Math.max(existingProgress.score || 0, score || 0)
        : (score || 0),
      xp_earned: (existingProgress?.xp_earned || 0) + (xpEarned || 0),
      attempts: (existingProgress?.attempts || 0) + 1,
      completed_at: isCompleted ? new Date().toISOString() : existingProgress?.completed_at,
    };

    // Upsert lesson progress
    const { data: progress, error: progressError } = await supabase
      .from("user_progress")
      .upsert(progressData, {
        onConflict: "user_id,lesson_id",
      })
      .select()
      .single();

    if (progressError) {
      console.error("Progress upsert error:", progressError);
      throw progressError;
    }

    // Update daily activity (streak_history)
    const today = new Date().toISOString().split("T")[0];
    const { data: existingActivity } = await supabase
      .from("streak_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (existingActivity) {
      await supabase
        .from("streak_history")
        .update({
          lessons_completed: existingActivity.lessons_completed + (isCompleted ? 1 : 0),
          xp_earned: existingActivity.xp_earned + (xpEarned || 0),
          time_spent_minutes: existingActivity.time_spent_minutes + (timeSpentMinutes || 0),
          exercises_completed: existingActivity.exercises_completed + 1,
          perfect_lessons: existingActivity.perfect_lessons + (isPerfect ? 1 : 0),
        })
        .eq("id", existingActivity.id);
    } else {
      await supabase.from("streak_history").insert({
        user_id: user.id,
        date: today,
        lessons_completed: isCompleted ? 1 : 0,
        xp_earned: xpEarned || 0,
        time_spent_minutes: timeSpentMinutes || 0,
        exercises_completed: 1,
        perfect_lessons: isPerfect ? 1 : 0,
      });
    }

    // Update user XP and streak
    if (xpEarned) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, current_streak, longest_streak, last_activity_date, level")
        .eq("id", user.id)
        .single();

      if (profile) {
        const lastActivity = profile.last_activity_date
          ? new Date(profile.last_activity_date)
          : null;
        const now = new Date();
        const todayDate = now.toDateString();
        const lastActivityDate = lastActivity?.toDateString();

        // Check if this is a new day of activity
        let newStreak = profile.current_streak;
        if (lastActivityDate !== todayDate) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const isConsecutiveDay = lastActivityDate === yesterday.toDateString();
          newStreak = isConsecutiveDay ? profile.current_streak + 1 : 1;
        }

        const newTotalXp = profile.total_xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 1000) + 1;

        await supabase
          .from("profiles")
          .update({
            total_xp: newTotalXp,
            current_streak: newStreak,
            longest_streak: Math.max(profile.longest_streak, newStreak),
            last_activity_date: now.toISOString(),
            level: newLevel,
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
