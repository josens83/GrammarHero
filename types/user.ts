export type SubscriptionTier = "free" | "pro" | "premium";

export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  stripeCustomerId: string | null;
  dailyGoal: number;
  hearts: number;
  heartsRefillAt: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
  isActive: boolean;
  lastActivity: string | null;
  freezesAvailable: number;
  freezesUsed: number;
}

export interface DailyStats {
  date: string;
  xpEarned: number;
  lessonsCompleted: number;
  timeSpent: number;
}
