"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/userStore";
import { User } from "@/types/user";

export function useUser() {
  const { user, isLoading, isAuthenticated, setUser, setLoading } = useUserStore();

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (profile) {
            const userData: User = {
              id: profile.id,
              email: profile.email,
              username: profile.username,
              displayName: profile.display_name,
              avatarUrl: profile.avatar_url,
              level: profile.level,
              totalXp: profile.total_xp,
              currentStreak: profile.current_streak,
              longestStreak: profile.longest_streak,
              lastActivityDate: profile.last_activity_date,
              subscriptionTier: profile.subscription_tier,
              subscriptionExpiresAt: profile.subscription_expires_at,
              stripeCustomerId: profile.stripe_customer_id,
              dailyGoal: profile.daily_goal,
              hearts: profile.hearts,
              heartsRefillAt: profile.hearts_refill_at,
              timezone: profile.timezone,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            };
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (session?.user) {
        getUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return { user, isLoading, isAuthenticated };
}
