/**
 * @fileoverview Individual Lesson API Route
 * @description Handles fetching and updating specific lessons
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getLessonById } from "@/lib/lessons/sample-lessons";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    // Get lesson from sample data
    const lesson = getLessonById(lessonId);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get user session for progress
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    let userProgress = null;
    if (user) {
      const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      userProgress = progress;
    }

    return NextResponse.json({
      success: true,
      data: {
        lesson,
        userProgress,
      },
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

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

    // Check admin role
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

    const { data: lesson, error } = await supabase
      .from("lessons")
      .update(body)
      .eq("id", lessonId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error("Update lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}
