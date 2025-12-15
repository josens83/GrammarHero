/**
 * @fileoverview Achievement Manager
 * @description Manages achievement unlocking logic and tracking
 *
 * Features:
 * - Achievement definitions
 * - Progress tracking
 * - Unlock conditions
 * - Reward calculations
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "mastery" | "social" | "special";
  xpReward: number;
  requirement: number;
  secret?: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

// All achievements in the system
export const ACHIEVEMENTS: Achievement[] = [
  // Learning achievements
  {
    id: "first-lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    category: "learning",
    xpReward: 10,
    requirement: 1,
  },
  {
    id: "ten-lessons",
    name: "Dedicated Learner",
    description: "Complete 10 lessons",
    icon: "📚",
    category: "learning",
    xpReward: 50,
    requirement: 10,
  },
  {
    id: "fifty-lessons",
    name: "Knowledge Seeker",
    description: "Complete 50 lessons",
    icon: "🎓",
    category: "learning",
    xpReward: 200,
    requirement: 50,
  },
  {
    id: "hundred-lessons",
    name: "Grammar Master",
    description: "Complete 100 lessons",
    icon: "👑",
    category: "learning",
    xpReward: 500,
    requirement: 100,
  },

  // Streak achievements
  {
    id: "week-streak",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "streak",
    xpReward: 50,
    requirement: 7,
  },
  {
    id: "month-streak",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "⚡",
    category: "streak",
    xpReward: 200,
    requirement: 30,
  },
  {
    id: "hundred-streak",
    name: "Unstoppable",
    description: "Maintain a 100-day streak",
    icon: "💎",
    category: "streak",
    xpReward: 1000,
    requirement: 100,
  },

  // Mastery achievements
  {
    id: "perfect-lesson",
    name: "Perfectionist",
    description: "Get 100% on a lesson",
    icon: "⭐",
    category: "mastery",
    xpReward: 20,
    requirement: 1,
  },
  {
    id: "five-perfect",
    name: "Rising Star",
    description: "Get 100% on 5 lessons",
    icon: "🌟",
    category: "mastery",
    xpReward: 100,
    requirement: 5,
  },
  {
    id: "twenty-perfect",
    name: "Grammar Guru",
    description: "Get 100% on 20 lessons",
    icon: "✨",
    category: "mastery",
    xpReward: 300,
    requirement: 20,
  },
  {
    id: "no-mistakes",
    name: "Flawless",
    description: "Complete 5 lessons in a row without mistakes",
    icon: "💯",
    category: "mastery",
    xpReward: 150,
    requirement: 5,
  },

  // XP achievements
  {
    id: "xp-100",
    name: "Getting Started",
    description: "Earn 100 XP",
    icon: "🌱",
    category: "learning",
    xpReward: 10,
    requirement: 100,
  },
  {
    id: "xp-1000",
    name: "Rising Star",
    description: "Earn 1,000 XP",
    icon: "⚡",
    category: "learning",
    xpReward: 50,
    requirement: 1000,
  },
  {
    id: "xp-10000",
    name: "XP Champion",
    description: "Earn 10,000 XP",
    icon: "🏆",
    category: "learning",
    xpReward: 200,
    requirement: 10000,
  },

  // Special achievements
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Complete a lesson between midnight and 5 AM",
    icon: "🦉",
    category: "special",
    xpReward: 30,
    requirement: 1,
    secret: true,
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Complete a lesson before 7 AM",
    icon: "🐦",
    category: "special",
    xpReward: 30,
    requirement: 1,
    secret: true,
  },
  {
    id: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Complete lessons on both Saturday and Sunday",
    icon: "🎉",
    category: "special",
    xpReward: 50,
    requirement: 1,
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Complete a lesson in under 2 minutes with 100% accuracy",
    icon: "⚡",
    category: "special",
    xpReward: 75,
    requirement: 1,
    secret: true,
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  category: Achievement["category"]
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Check if achievement should be unlocked based on user stats
 */
export interface UserStats {
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  perfectLessons: number;
  consecutivePerfect: number;
  totalXp: number;
  lastLessonTime?: Date;
  weekendLessons?: { saturday: boolean; sunday: boolean };
  fastPerfectLesson?: boolean;
}

export function checkAchievementUnlock(
  achievement: Achievement,
  stats: UserStats
): boolean {
  switch (achievement.id) {
    // Learning achievements
    case "first-lesson":
      return stats.lessonsCompleted >= 1;
    case "ten-lessons":
      return stats.lessonsCompleted >= 10;
    case "fifty-lessons":
      return stats.lessonsCompleted >= 50;
    case "hundred-lessons":
      return stats.lessonsCompleted >= 100;

    // Streak achievements
    case "week-streak":
      return stats.currentStreak >= 7 || stats.longestStreak >= 7;
    case "month-streak":
      return stats.currentStreak >= 30 || stats.longestStreak >= 30;
    case "hundred-streak":
      return stats.currentStreak >= 100 || stats.longestStreak >= 100;

    // Mastery achievements
    case "perfect-lesson":
      return stats.perfectLessons >= 1;
    case "five-perfect":
      return stats.perfectLessons >= 5;
    case "twenty-perfect":
      return stats.perfectLessons >= 20;
    case "no-mistakes":
      return stats.consecutivePerfect >= 5;

    // XP achievements
    case "xp-100":
      return stats.totalXp >= 100;
    case "xp-1000":
      return stats.totalXp >= 1000;
    case "xp-10000":
      return stats.totalXp >= 10000;

    // Special achievements
    case "night-owl":
      if (!stats.lastLessonTime) return false;
      const nightHour = stats.lastLessonTime.getHours();
      return nightHour >= 0 && nightHour < 5;

    case "early-bird":
      if (!stats.lastLessonTime) return false;
      const morningHour = stats.lastLessonTime.getHours();
      return morningHour >= 5 && morningHour < 7;

    case "weekend-warrior":
      return (
        stats.weekendLessons?.saturday === true &&
        stats.weekendLessons?.sunday === true
      );

    case "speed-demon":
      return stats.fastPerfectLesson === true;

    default:
      return false;
  }
}

/**
 * Check all achievements and return newly unlocked ones
 */
export function checkAllAchievements(
  stats: UserStats,
  currentProgress: AchievementProgress[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const unlockedIds = new Set(
    currentProgress.filter((p) => p.isUnlocked).map((p) => p.achievementId)
  );

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    if (checkAchievementUnlock(achievement, stats)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

/**
 * Calculate progress percentage for an achievement
 */
export function calculateAchievementProgress(
  achievement: Achievement,
  stats: UserStats
): number {
  let current = 0;

  switch (achievement.category) {
    case "learning":
      if (achievement.id.startsWith("xp-")) {
        current = stats.totalXp;
      } else {
        current = stats.lessonsCompleted;
      }
      break;
    case "streak":
      current = Math.max(stats.currentStreak, stats.longestStreak);
      break;
    case "mastery":
      if (achievement.id === "no-mistakes") {
        current = stats.consecutivePerfect;
      } else {
        current = stats.perfectLessons;
      }
      break;
    case "special":
      // Special achievements are binary (0 or 1)
      return checkAchievementUnlock(achievement, stats) ? 100 : 0;
    default:
      current = 0;
  }

  return Math.min(100, Math.round((current / achievement.requirement) * 100));
}

/**
 * Get total XP reward from unlocked achievements
 */
export function getTotalAchievementXp(
  unlockedAchievementIds: string[]
): number {
  return unlockedAchievementIds.reduce((total, id) => {
    const achievement = getAchievementById(id);
    return total + (achievement?.xpReward || 0);
  }, 0);
}
