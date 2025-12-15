export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          level: number;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          subscription_tier: "free" | "pro" | "premium";
          subscription_expires_at: string | null;
          stripe_customer_id: string | null;
          daily_goal: number;
          hearts: number;
          hearts_refill_at: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      lessons: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          description: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          order_index: number;
          xp_reward: number;
          content: Json;
          exercises: Json;
          is_premium: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: "locked" | "available" | "in_progress" | "completed";
          score: number;
          xp_earned: number;
          attempts: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_progress"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Insert"]>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["achievements"]["Row"], "id" | "unlocked_at">;
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
      };
      streak_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          xp_earned: number;
          lessons_completed: number;
        };
        Insert: Omit<Database["public"]["Tables"]["streak_history"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["streak_history"]["Insert"]>;
      };
    };
  };
}
