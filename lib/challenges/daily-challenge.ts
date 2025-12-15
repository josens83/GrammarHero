/**
 * @fileoverview Daily Challenge System
 * @description Generates and manages daily challenges for users
 *
 * Features:
 * - Daily challenge generation
 * - Streak tracking
 * - Bonus XP rewards
 * - Challenge types variety
 */

import { ExerciseData } from "@/types/lesson";
import { SAMPLE_LESSONS } from "@/lib/lessons/sample-lessons";

export type ChallengeType =
  | "speed_round"
  | "perfect_score"
  | "category_master"
  | "variety_pack"
  | "review_rush";

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  exercises: ExerciseData[];
  timeLimit?: number; // in seconds
  xpReward: number;
  bonusXp: number; // Extra XP for perfect completion
  category?: string;
  difficulty: "easy" | "medium" | "hard";
  requirements: {
    minScore?: number;
    maxTime?: number;
    perfectRequired?: boolean;
  };
}

export interface ChallengeProgress {
  date: string; // ISO date string (YYYY-MM-DD)
  challengeId: string;
  completed: boolean;
  score?: number;
  timeSpent?: number;
  xpEarned?: number;
  isPerfect?: boolean;
}

// Challenge templates
const CHALLENGE_TEMPLATES: Omit<DailyChallenge, "id" | "exercises">[] = [
  {
    type: "speed_round",
    title: "Speed Round",
    description: "Answer 10 questions as fast as you can!",
    icon: "⚡",
    timeLimit: 120, // 2 minutes
    xpReward: 30,
    bonusXp: 15,
    difficulty: "medium",
    requirements: {
      minScore: 70,
      maxTime: 120,
    },
  },
  {
    type: "perfect_score",
    title: "Perfect Challenge",
    description: "Get 100% accuracy on these questions",
    icon: "🎯",
    xpReward: 25,
    bonusXp: 25,
    difficulty: "medium",
    requirements: {
      perfectRequired: true,
    },
  },
  {
    type: "category_master",
    title: "Category Master",
    description: "Master questions from a specific grammar category",
    icon: "📚",
    xpReward: 35,
    bonusXp: 20,
    difficulty: "hard",
    requirements: {
      minScore: 80,
    },
  },
  {
    type: "variety_pack",
    title: "Variety Pack",
    description: "A mix of different question types",
    icon: "🎲",
    xpReward: 30,
    bonusXp: 15,
    difficulty: "medium",
    requirements: {
      minScore: 70,
    },
  },
  {
    type: "review_rush",
    title: "Review Rush",
    description: "Quick review of fundamentals",
    icon: "🔄",
    xpReward: 20,
    bonusXp: 10,
    difficulty: "easy",
    requirements: {
      minScore: 60,
    },
  },
];

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Generate a seed number from a date for consistent randomization
 */
function getDateSeed(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Shuffle array with seed
 */
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const random = seededRandom(seed);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get exercises from all lessons
 */
function getAllExercises(): ExerciseData[] {
  const exercises: ExerciseData[] = [];
  Object.values(SAMPLE_LESSONS).forEach((lesson) => {
    exercises.push(...lesson.exercises);
  });
  return exercises;
}

/**
 * Get exercises by category
 */
function getExercisesByCategory(category: string): ExerciseData[] {
  const lesson = Object.values(SAMPLE_LESSONS).find(
    (l) => l.category === category
  );
  return lesson?.exercises || [];
}

/**
 * Generate today's daily challenge
 */
export function generateDailyChallenge(dateString?: string): DailyChallenge {
  const date = dateString || getTodayDateString();
  const seed = getDateSeed(date);
  const random = seededRandom(seed);

  // Select challenge type based on date
  const templateIndex = Math.floor(random() * CHALLENGE_TEMPLATES.length);
  const template = CHALLENGE_TEMPLATES[templateIndex];

  // Get exercises
  let allExercises = getAllExercises();
  allExercises = shuffleWithSeed(allExercises, seed);

  // Select number of exercises based on difficulty
  const exerciseCount =
    template.difficulty === "easy"
      ? 5
      : template.difficulty === "medium"
      ? 8
      : 10;

  const selectedExercises = allExercises.slice(0, exerciseCount);

  // If category master, filter by category
  if (template.type === "category_master") {
    const categories = ["tenses", "articles", "prepositions"];
    const categoryIndex = Math.floor(random() * categories.length);
    const category = categories[categoryIndex];
    const categoryExercises = getExercisesByCategory(category);

    if (categoryExercises.length >= exerciseCount) {
      const shuffledCategory = shuffleWithSeed(categoryExercises, seed);
      return {
        ...template,
        id: `challenge-${date}`,
        exercises: shuffledCategory.slice(0, exerciseCount),
        category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Master`,
      };
    }
  }

  return {
    ...template,
    id: `challenge-${date}`,
    exercises: selectedExercises,
  };
}

/**
 * Check if challenge requirements are met
 */
export function checkChallengeComplete(
  challenge: DailyChallenge,
  score: number,
  timeSpent: number
): {
  completed: boolean;
  isPerfect: boolean;
  xpEarned: number;
} {
  const { requirements, xpReward, bonusXp } = challenge;
  let completed = true;
  let isPerfect = score === 100;

  // Check requirements
  if (requirements.minScore && score < requirements.minScore) {
    completed = false;
  }

  if (requirements.maxTime && timeSpent > requirements.maxTime) {
    completed = false;
  }

  if (requirements.perfectRequired && !isPerfect) {
    completed = false;
  }

  // Calculate XP
  let xpEarned = 0;
  if (completed) {
    xpEarned = xpReward;
    if (isPerfect) {
      xpEarned += bonusXp;
    }
  }

  return { completed, isPerfect, xpEarned };
}

/**
 * Get challenge streak count
 */
export function getChallengeStreak(
  history: ChallengeProgress[]
): number {
  if (history.length === 0) return 0;

  // Sort by date descending
  const sorted = [...history]
    .filter((h) => h.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  // Check if today or yesterday was completed
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split("T")[0];

  const lastCompleted = sorted[0].date;
  if (lastCompleted !== today && lastCompleted !== yesterdayString) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = new Date(lastCompleted);

  for (let i = 1; i < sorted.length; i++) {
    currentDate.setDate(currentDate.getDate() - 1);
    const expectedDate = currentDate.toISOString().split("T")[0];

    if (sorted[i].date === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if today's challenge is completed
 */
export function isTodayChallengeCompleted(
  history: ChallengeProgress[]
): boolean {
  const today = getTodayDateString();
  return history.some((h) => h.date === today && h.completed);
}
