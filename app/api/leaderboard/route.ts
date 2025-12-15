/**
 * @fileoverview Leaderboard API Route
 * @description Handles leaderboard data with different time periods
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly"; // daily, weekly, alltime
    const limit = parseInt(searchParams.get("limit") || "50");
    const league = searchParams.get("league"); // bronze, silver, gold, diamond, master

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Build query based on period
    let query = supabase
      .from("profiles")
      .select("id, display_name, avatar_url, total_xp, current_streak, level")
      .order("total_xp", { ascending: false })
      .limit(limit);

    // Filter by league XP ranges
    if (league) {
      const leagueRanges: Record<string, { min: number; max: number }> = {
        bronze: { min: 0, max: 4999 },
        silver: { min: 5000, max: 14999 },
        gold: { min: 15000, max: 34999 },
        diamond: { min: 35000, max: 74999 },
        master: { min: 75000, max: Infinity },
      };

      const range = leagueRanges[league];
      if (range) {
        query = query.gte("total_xp", range.min);
        if (range.max !== Infinity) {
          query = query.lte("total_xp", range.max);
        }
      }
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error("Leaderboard query error:", error);
      throw error;
    }

    // For daily/weekly periods, we need activity data
    let leaderboardData = profiles || [];

    if (period === "daily" || period === "weekly") {
      const now = new Date();
      const startDate = new Date();

      if (period === "daily") {
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
      }

      // Get activity data for the period
      const { data: activity } = await supabase
        .from("user_daily_activity")
        .select("user_id, xp_earned")
        .gte("date", startDate.toISOString().split("T")[0]);

      // Aggregate XP by user
      const periodXp: Record<string, number> = {};
      (activity || []).forEach((a) => {
        periodXp[a.user_id] = (periodXp[a.user_id] || 0) + a.xp_earned;
      });

      // Merge with profile data and sort by period XP
      leaderboardData = (profiles || [])
        .map((profile) => ({
          ...profile,
          periodXp: periodXp[profile.id] || 0,
        }))
        .sort((a, b) => b.periodXp - a.periodXp);
    }

    // Add rank to each entry
    const rankedData = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      previousRank: index + 1 + Math.floor(Math.random() * 5) - 2, // Simulated previous rank
    }));

    // Get current user's position
    let userRank = null;
    if (user) {
      const userIndex = rankedData.findIndex((p) => p.id === user.id);
      if (userIndex !== -1) {
        userRank = {
          ...rankedData[userIndex],
          rank: userIndex + 1,
        };
      } else {
        // User not in top list, find their actual rank
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("id", user.id)
          .single();

        if (userProfile) {
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .gt("total_xp", userProfile.total_xp);

          userRank = {
            id: user.id,
            rank: (count || 0) + 1,
            total_xp: userProfile.total_xp,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: rankedData,
        userRank,
        period,
        total: rankedData.length,
      },
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
