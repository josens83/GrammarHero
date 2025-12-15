import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: data.user.user_metadata.full_name || data.user.user_metadata.name,
          avatar_url: data.user.user_metadata.avatar_url,
          level: 1,
          total_xp: 0,
          current_streak: 0,
          longest_streak: 0,
          subscription_tier: "free",
          daily_goal: 10,
          hearts: 5,
          timezone: "UTC",
        });
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
