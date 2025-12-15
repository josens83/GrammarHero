/**
 * @fileoverview Streak Manager
 * @description Handles streak calculation, protection, and freeze functionality
 */

import { differenceInDays, startOfDay, isToday, isYesterday } from "date-fns";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  streakFreezes: number;
  usedFreezeToday: boolean;
}

export interface StreakUpdateResult {
  newStreak: number;
  streakBroken: boolean;
  streakExtended: boolean;
  freezeUsed: boolean;
  isNewRecord: boolean;
  milestoneReached: number | null;
}

// Streak milestones for achievements
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

// Default max freezes
const MAX_STREAK_FREEZES = 2;

/**
 * Calculate streak based on activity dates
 */
export function calculateStreak(
  activityDates: Date[],
  today: Date = new Date()
): number {
  if (activityDates.length === 0) return 0;

  // Sort dates in descending order (most recent first)
  const sortedDates = activityDates
    .map((d) => startOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Check if most recent activity was today or yesterday
  const mostRecent = sortedDates[0];
  const todayStart = startOfDay(today);
  const daysDiff = differenceInDays(todayStart, mostRecent);

  // If last activity was more than 1 day ago, streak is broken
  if (daysDiff > 1) return 0;

  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i - 1];
    const prevDate = sortedDates[i];
    const diff = differenceInDays(currentDate, prevDate);

    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
    // diff === 0 means same day, continue checking
  }

  return streak;
}

/**
 * Update streak based on new activity
 */
export function updateStreak(
  currentData: StreakData,
  activityDate: Date = new Date()
): StreakUpdateResult {
  const today = startOfDay(activityDate);
  const lastActivity = currentData.lastActivityDate
    ? startOfDay(currentData.lastActivityDate)
    : null;

  let newStreak = currentData.currentStreak;
  let streakBroken = false;
  let streakExtended = false;
  let freezeUsed = false;

  if (!lastActivity) {
    // First activity ever
    newStreak = 1;
    streakExtended = true;
  } else {
    const daysSinceLastActivity = differenceInDays(today, lastActivity);

    if (daysSinceLastActivity === 0) {
      // Already active today, no change
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day - extend streak
      newStreak = currentData.currentStreak + 1;
      streakExtended = true;
    } else if (daysSinceLastActivity === 2 && currentData.streakFreezes > 0) {
      // Missed one day but have freeze available
      newStreak = currentData.currentStreak + 1;
      streakExtended = true;
      freezeUsed = true;
    } else {
      // Streak broken
      newStreak = 1;
      streakBroken = true;
      streakExtended = true;
    }
  }

  // Check if new record
  const isNewRecord = newStreak > currentData.longestStreak;

  // Check for milestone
  const milestoneReached = STREAK_MILESTONES.find(
    (m) => newStreak === m && currentData.currentStreak < m
  ) || null;

  return {
    newStreak,
    streakBroken,
    streakExtended,
    freezeUsed,
    isNewRecord,
    milestoneReached,
  };
}

/**
 * Check if streak is at risk (user hasn't been active today)
 */
export function isStreakAtRisk(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) return false;
  return !isToday(lastActivityDate);
}

/**
 * Get hours until streak expires
 */
export function getHoursUntilStreakExpires(lastActivityDate: Date | null): number {
  if (!lastActivityDate) return 0;

  const now = new Date();
  const lastActivity = startOfDay(lastActivityDate);
  const expiryDate = new Date(lastActivity);
  expiryDate.setDate(expiryDate.getDate() + 2); // Expires after 2 days of inactivity
  expiryDate.setHours(0, 0, 0, 0);

  const hoursRemaining = Math.max(
    0,
    Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60))
  );

  return hoursRemaining;
}

/**
 * Apply streak freeze to protect streak
 */
export function useStreakFreeze(
  currentData: StreakData
): { success: boolean; remainingFreezes: number } {
  if (currentData.streakFreezes <= 0) {
    return { success: false, remainingFreezes: 0 };
  }

  if (currentData.usedFreezeToday) {
    return { success: false, remainingFreezes: currentData.streakFreezes };
  }

  return {
    success: true,
    remainingFreezes: currentData.streakFreezes - 1,
  };
}

/**
 * Replenish streak freeze (e.g., from achievement or purchase)
 */
export function addStreakFreeze(
  currentFreezes: number,
  amount: number = 1
): number {
  return Math.min(currentFreezes + amount, MAX_STREAK_FREEZES);
}

/**
 * Get streak status message
 */
export function getStreakStatusMessage(
  currentStreak: number,
  isAtRisk: boolean,
  hoursRemaining: number
): string {
  if (currentStreak === 0) {
    return "Start your streak by completing a lesson today!";
  }

  if (isAtRisk) {
    if (hoursRemaining <= 2) {
      return `Your ${currentStreak}-day streak expires in ${hoursRemaining} hours!`;
    }
    return `Complete a lesson today to keep your ${currentStreak}-day streak!`;
  }

  if (currentStreak >= 365) {
    return `Incredible! You've maintained a ${currentStreak}-day streak!`;
  } else if (currentStreak >= 30) {
    return `Amazing! ${currentStreak} days and counting!`;
  } else if (currentStreak >= 7) {
    return `Great work! ${currentStreak}-day streak!`;
  }

  return `${currentStreak}-day streak! Keep it going!`;
}

/**
 * Get next milestone
 */
export function getNextMilestone(currentStreak: number): number | null {
  return STREAK_MILESTONES.find((m) => m > currentStreak) || null;
}

/**
 * Get days until next milestone
 */
export function getDaysUntilMilestone(currentStreak: number): number | null {
  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return null;
  return nextMilestone - currentStreak;
}

/**
 * Calculate streak recovery cost (if implementing streak repair)
 */
export function getStreakRecoveryCost(
  brokenStreak: number,
  daysMissed: number
): { gems: number; canRecover: boolean } {
  // Can only recover within 48 hours
  if (daysMissed > 2) {
    return { gems: 0, canRecover: false };
  }

  // Base cost increases with streak length
  const baseCost = Math.min(50, Math.max(10, brokenStreak));
  const totalCost = baseCost * daysMissed;

  return { gems: totalCost, canRecover: true };
}
