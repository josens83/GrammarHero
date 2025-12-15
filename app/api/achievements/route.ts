/**
 * @fileoverview Achievements API Route
 * @description Handles user achievements and unlocking
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ACHIEVEMENTS, checkAchievementUnlock } from "@/lib/achievements/achievement-manager";

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

    // Get user's unlocked achievements
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id);

    const unlockedIds = new Set((userAchievements || []).map((a) => a.achievement_id));

    // Merge with achievement definitions
    const achievementsWithStatus = ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements?.find((a) => a.achievement_id === achievement.id)
        ?.unlocked_at,
    }));

    // Group by category
    const byCategory = achievementsWithStatus.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<string, typeof achievementsWithStatus>);

    return NextResponse.json({
      success: true,
      data: {
        achievements: achievementsWithStatus,
        byCategory,
        stats: {
          total: ACHIEVEMENTS.length,
          unlocked: unlockedIds.size,
          percentage: Math.round((unlockedIds.size / ACHIEVEMENTS.length) * 100),
        },
      },
    });
  } catch (error) {
    console.error("Achievements API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch achievements" },
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
    const { checkUnlocks } = body;

    if (checkUnlocks) {
      // Check for any new achievements to unlock
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id);

      const { data: existingAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      const unlockedIds = new Set(
        (existingAchievements || []).map((a) => a.achievement_id)
      );

      // Build user stats for achievement checking
      const userStats = {
        lessonsCompleted: (progress || []).filter((p) => p.progress_percentage === 100)
          .length,
        currentStreak: profile?.current_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        totalXp: profile?.total_xp || 0,
        perfectLessons: (progress || []).filter((p) => p.best_score === 100).length,
        categoriesMastered: 0, // Would need more complex calculation
        totalReviews: 0, // Would need review tracking
        level: profile?.level || 1,
      };

      // Check each achievement
      const newlyUnlocked: string[] = [];
      for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;

        const shouldUnlock = checkAchievementUnlock(achievement.id, userStats);
        if (shouldUnlock) {
          // Unlock the achievement
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
          });

          // Award XP bonus
          if (achievement.xpReward) {
            await supabase
              .from("profiles")
              .update({
                total_xp: (profile?.total_xp || 0) + achievement.xpReward,
              })
              .eq("id", user.id);
          }

          newlyUnlocked.push(achievement.id);
        }
      }

      const newAchievements = ACHIEVEMENTS.filter((a) =>
        newlyUnlocked.includes(a.id)
      );

      return NextResponse.json({
        success: true,
        data: {
          newlyUnlocked: newAchievements,
          count: newlyUnlocked.length,
        },
      });
    }

    // Manual achievement unlock (for special cases)
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json(
        { success: false, error: "Achievement ID required" },
        { status: 400 }
      );
    }

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) {
      return NextResponse.json(
        { success: false, error: "Achievement not found" },
        { status: 404 }
      );
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", user.id)
      .eq("achievement_id", achievementId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { alreadyUnlocked: true },
      });
    }

    // Unlock achievement
    await supabase.from("user_achievements").insert({
      user_id: user.id,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        achievement,
        xpAwarded: achievement.xpReward,
      },
    });
  } catch (error) {
    console.error("Unlock achievement error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process achievement" },
      { status: 500 }
    );
  }
}
