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

      // Get user progress from user_progress table
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      // Get streak history for additional stats
      const { data: streakHistory } = await supabase
        .from("streak_history")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      // Get review items count
      const { count: reviewCount } = await supabase
        .from("review_items")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      const { data: existingAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      const unlockedIds = new Set(
        (existingAchievements || []).map((a) => a.achievement_id)
      );

      // Calculate completed lessons and perfect lessons
      const completedLessons = (progress || []).filter((p) => p.status === "completed").length;
      const perfectLessons = (progress || []).filter((p) => p.score === 100).length;

      // Calculate categories mastered (all lessons in a category completed with 80%+)
      const categoryProgress: Record<string, { total: number; completed: number }> = {};
      (progress || []).forEach((p) => {
        // We'd need lesson data to properly track this, simplified for now
        if (!categoryProgress["default"]) {
          categoryProgress["default"] = { total: 0, completed: 0 };
        }
        categoryProgress["default"].total++;
        if (p.status === "completed" && p.score >= 80) {
          categoryProgress["default"].completed++;
        }
      });

      // Check for consecutive perfect lessons
      let consecutivePerfect = 0;
      let maxConsecutivePerfect = 0;
      (progress || [])
        .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
        .forEach((p) => {
          if (p.score === 100) {
            consecutivePerfect++;
            maxConsecutivePerfect = Math.max(maxConsecutivePerfect, consecutivePerfect);
          } else {
            consecutivePerfect = 0;
          }
        });

      // Check weekend lessons
      const weekendLessons = (streakHistory || []).filter((h) => {
        const date = new Date(h.date);
        const day = date.getDay();
        return (day === 0 || day === 6) && h.lessons_completed > 0;
      }).length;

      // Build user stats for achievement checking
      const userStats = {
        lessonsCompleted: completedLessons,
        currentStreak: profile?.current_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        totalXp: profile?.total_xp || 0,
        perfectLessons: perfectLessons,
        consecutivePerfect: maxConsecutivePerfect,
        categoriesMastered: Object.values(categoryProgress).filter(
          (c) => c.total > 0 && c.completed === c.total
        ).length,
        totalReviews: reviewCount || 0,
        weekendLessons: weekendLessons,
        level: profile?.level || 1,
      };

      // Check each achievement
      const newlyUnlocked: string[] = [];
      for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;

        const shouldUnlock = checkAchievementUnlock(achievement.id, userStats);
        if (shouldUnlock) {
          // Unlock the achievement
          const { error: insertError } = await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
          });

          if (!insertError) {
            // Award XP bonus
            if (achievement.xpReward) {
              await supabase
                .from("profiles")
                .update({
                  total_xp: (profile?.total_xp || 0) + achievement.xpReward,
                })
                .eq("id", user.id);
            }

            // Create notification for achievement
            await supabase.from("notifications").insert({
              user_id: user.id,
              type: "achievement",
              title: "Achievement Unlocked!",
              message: `You earned "${achievement.name}" - ${achievement.description}`,
              data: { achievementId: achievement.id, xpReward: achievement.xpReward },
            });

            newlyUnlocked.push(achievement.id);
          }
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

    // Award XP
    if (achievement.xpReward) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      await supabase
        .from("profiles")
        .update({
          total_xp: (profile?.total_xp || 0) + achievement.xpReward,
        })
        .eq("id", user.id);
    }

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
