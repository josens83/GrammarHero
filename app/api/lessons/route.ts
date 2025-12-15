/**
 * @fileoverview Lessons API Route
 * @description Handles lesson listing, creation, and management
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sampleLessons } from "@/lib/lessons/sample-lessons";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user session for personalized content
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Filter lessons based on query params
    let filteredLessons = [...sampleLessons];

    if (category) {
      filteredLessons = filteredLessons.filter(
        (lesson) => lesson.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (difficulty) {
      filteredLessons = filteredLessons.filter(
        (lesson) => lesson.difficulty === difficulty
      );
    }

    // Apply pagination
    const paginatedLessons = filteredLessons.slice(offset, offset + limit);

    // If user is authenticated, fetch their progress
    let userProgress: Record<string, { score: number; status: string }> = {};
    if (user) {
      const { data: progress } = await supabase
        .from("user_progress")
        .select("lesson_id, score, status")
        .eq("user_id", user.id);

      if (progress) {
        userProgress = progress.reduce((acc, p) => {
          acc[p.lesson_id] = { score: p.score || 0, status: p.status };
          return acc;
        }, {} as Record<string, { score: number; status: string }>);
      }
    }

    // Attach progress to lessons
    const lessonsWithProgress = paginatedLessons.map((lesson) => ({
      ...lesson,
      userProgress: userProgress[lesson.id]?.score || 0,
      status: userProgress[lesson.id]?.status || "available",
      isCompleted: userProgress[lesson.id]?.status === "completed",
    }));

    return NextResponse.json({
      success: true,
      data: {
        lessons: lessonsWithProgress,
        total: filteredLessons.length,
        hasMore: offset + limit < filteredLessons.length,
      },
    });
  } catch (error) {
    console.error("Lessons API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin-only endpoint for creating lessons
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { title, description, category, difficulty, content, exercises } = body;

    if (!title || !description || !category || !difficulty) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert lesson into database
    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        title,
        description,
        category,
        difficulty,
        content,
        exercises,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
