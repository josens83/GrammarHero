/**
 * @fileoverview Review Items API Route
 * @description Handles spaced repetition review items
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// SM-2 Algorithm for calculating next review date
function calculateNextReview(
  quality: number, // 0-5, where 5 is perfect
  easeFactor: number,
  interval: number,
  repetitions: number
): { easeFactor: number; interval: number; repetitions: number } {
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const dueOnly = searchParams.get("due") !== "false";

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

    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("review_items")
      .select("*")
      .eq("user_id", user.id)
      .order("next_review_date", { ascending: true })
      .limit(limit);

    if (dueOnly) {
      query = query.lte("next_review_date", today);
    }

    const { data: reviewItems, error } = await query;

    if (error) throw error;

    // Get count of due items
    const { count: dueCount } = await supabase
      .from("review_items")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .lte("next_review_date", today);

    return NextResponse.json({
      success: true,
      data: {
        items: reviewItems || [],
        dueCount: dueCount || 0,
        totalCount: (reviewItems || []).length,
      },
    });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review items" },
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
    const { action } = body;

    if (action === "add") {
      // Add new review item
      const { lessonId, exerciseId, question, correctAnswer, category, difficulty } = body;

      if (!question || !correctAnswer) {
        return NextResponse.json(
          { success: false, error: "Question and answer required" },
          { status: 400 }
        );
      }

      // Check if item already exists
      const { data: existing } = await supabase
        .from("review_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId || question)
        .single();

      if (existing) {
        return NextResponse.json({
          success: true,
          data: { alreadyExists: true, id: existing.id },
        });
      }

      const { data: item, error } = await supabase
        .from("review_items")
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          exercise_id: exerciseId || `ex-${Date.now()}`,
          question,
          correct_answer: correctAnswer,
          category,
          difficulty: difficulty || "medium",
          next_review_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: { item },
      });
    }

    if (action === "review") {
      // Process review result
      const { itemId, quality } = body; // quality: 0-5

      if (!itemId || quality === undefined) {
        return NextResponse.json(
          { success: false, error: "Item ID and quality required" },
          { status: 400 }
        );
      }

      // Get current item
      const { data: item, error: fetchError } = await supabase
        .from("review_items")
        .select("*")
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !item) {
        return NextResponse.json(
          { success: false, error: "Review item not found" },
          { status: 404 }
        );
      }

      // Calculate new values using SM-2
      const { easeFactor, interval, repetitions } = calculateNextReview(
        quality,
        item.ease_factor,
        item.interval_days,
        item.repetitions
      );

      // Calculate next review date
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      // Update item
      const { data: updated, error: updateError } = await supabase
        .from("review_items")
        .update({
          ease_factor: easeFactor,
          interval_days: interval,
          repetitions,
          next_review_date: nextReviewDate.toISOString().split("T")[0],
          last_reviewed_at: new Date().toISOString(),
          last_quality: quality,
        })
        .eq("id", itemId)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: {
          item: updated,
          nextReviewIn: interval,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Review action error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");

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

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("review_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Delete review item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review item" },
      { status: 500 }
    );
  }
}
