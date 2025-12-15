/**
 * @fileoverview Spaced Repetition System
 * @description Implementation of SM-2 algorithm for optimized learning
 *
 * The SM-2 algorithm calculates optimal review intervals based on:
 * - Ease Factor (EF): How easily the item was recalled
 * - Interval: Days until next review
 * - Repetition: Number of successful reviews
 */

export interface ReviewItem {
  id: string;
  lessonId: string;
  exerciseId: string;
  question: string;
  correctAnswer: string;
  category: string;
  easeFactor: number; // Default 2.5, ranges from 1.3 to 2.5+
  interval: number; // Days until next review
  repetition: number; // Number of successful reviews
  nextReviewDate: Date;
  lastReviewDate: Date | null;
  createdAt: Date;
}

export interface ReviewSession {
  items: ReviewItem[];
  currentIndex: number;
  results: ReviewResult[];
  startTime: Date;
}

export interface ReviewResult {
  itemId: string;
  quality: ReviewQuality;
  correct: boolean;
  responseTime: number; // milliseconds
}

// Quality ratings for SM-2
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Complete blackout
// 1: Incorrect but recognized correct answer
// 2: Incorrect but seems easy to remember
// 3: Correct with serious difficulty
// 4: Correct with some hesitation
// 5: Perfect recall

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Calculate new parameters using SM-2 algorithm
 */
export function calculateSM2(
  item: ReviewItem,
  quality: ReviewQuality
): { easeFactor: number; interval: number; repetition: number } {
  let { easeFactor, interval, repetition } = item;

  // Update ease factor based on quality
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // If quality < 3, restart from beginning
  if (quality < 3) {
    return {
      easeFactor: newEaseFactor,
      interval: 1,
      repetition: 0,
    };
  }

  // Calculate new interval
  let newInterval: number;
  const newRepetition = repetition + 1;

  if (newRepetition === 1) {
    newInterval = 1;
  } else if (newRepetition === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetition: newRepetition,
  };
}

/**
 * Update review item after a review
 */
export function updateReviewItem(
  item: ReviewItem,
  quality: ReviewQuality
): ReviewItem {
  const { easeFactor, interval, repetition } = calculateSM2(item, quality);

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...item,
    easeFactor,
    interval,
    repetition,
    nextReviewDate,
    lastReviewDate: new Date(),
  };
}

/**
 * Create a new review item from an exercise
 */
export function createReviewItem(
  lessonId: string,
  exerciseId: string,
  question: string,
  correctAnswer: string,
  category: string
): ReviewItem {
  const now = new Date();
  return {
    id: `${lessonId}-${exerciseId}-${Date.now()}`,
    lessonId,
    exerciseId,
    question,
    correctAnswer,
    category,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 1,
    repetition: 0,
    nextReviewDate: now, // Due immediately
    lastReviewDate: null,
    createdAt: now,
  };
}

/**
 * Get items due for review
 */
export function getDueItems(
  items: ReviewItem[],
  limit: number = 20
): ReviewItem[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today

  return items
    .filter((item) => item.nextReviewDate <= now)
    .sort((a, b) => {
      // Prioritize overdue items
      const aOverdue = now.getTime() - a.nextReviewDate.getTime();
      const bOverdue = now.getTime() - b.nextReviewDate.getTime();
      return bOverdue - aOverdue;
    })
    .slice(0, limit);
}

/**
 * Get items that are new (never reviewed)
 */
export function getNewItems(
  items: ReviewItem[],
  limit: number = 10
): ReviewItem[] {
  return items
    .filter((item) => item.lastReviewDate === null)
    .slice(0, limit);
}

/**
 * Calculate review statistics
 */
export function getReviewStats(items: ReviewItem[]): {
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  learned: number;
  mastered: number;
  averageEaseFactor: number;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const dueToday = items.filter((item) => item.nextReviewDate <= today).length;
  const dueTomorrow = items.filter(
    (item) => item.nextReviewDate > today && item.nextReviewDate <= tomorrow
  ).length;
  const dueThisWeek = items.filter(
    (item) => item.nextReviewDate > today && item.nextReviewDate <= nextWeek
  ).length;

  // Learned: reviewed at least once
  const learned = items.filter((item) => item.lastReviewDate !== null).length;

  // Mastered: ease factor >= 2.5 and interval >= 21 days
  const mastered = items.filter(
    (item) => item.easeFactor >= 2.5 && item.interval >= 21
  ).length;

  const averageEaseFactor =
    items.length > 0
      ? items.reduce((sum, item) => sum + item.easeFactor, 0) / items.length
      : DEFAULT_EASE_FACTOR;

  return {
    dueToday,
    dueTomorrow,
    dueThisWeek,
    learned,
    mastered,
    averageEaseFactor,
  };
}

/**
 * Convert performance to quality rating
 */
export function performanceToQuality(
  correct: boolean,
  responseTimeMs: number,
  hintsUsed: boolean
): ReviewQuality {
  if (!correct) {
    return hintsUsed ? 1 : 0;
  }

  // Fast response (< 5 seconds) = perfect
  if (responseTimeMs < 5000 && !hintsUsed) {
    return 5;
  }

  // Medium response (< 15 seconds) = good
  if (responseTimeMs < 15000) {
    return hintsUsed ? 3 : 4;
  }

  // Slow response = correct with difficulty
  return hintsUsed ? 2 : 3;
}

/**
 * Get recommended daily review count based on workload
 */
export function getRecommendedDailyReviews(
  totalItems: number,
  targetDays: number = 30
): number {
  // Aim to review all items within target days
  // With SM-2, items are reviewed less frequently over time
  return Math.max(10, Math.ceil(totalItems / targetDays));
}

/**
 * Predict retention rate based on interval and ease factor
 */
export function predictRetention(
  daysSinceLastReview: number,
  interval: number,
  easeFactor: number
): number {
  // Using a simple exponential decay model
  // Retention = e^(-t / (interval * stability))
  const stability = easeFactor / DEFAULT_EASE_FACTOR;
  const retention = Math.exp(-daysSinceLastReview / (interval * stability));
  return Math.max(0, Math.min(1, retention));
}

/**
 * Get strength indicator for an item
 */
export function getItemStrength(item: ReviewItem): "weak" | "learning" | "strong" | "mastered" {
  if (item.lastReviewDate === null) {
    return "weak";
  }

  if (item.interval < 7) {
    return "learning";
  }

  if (item.interval >= 21 && item.easeFactor >= 2.5) {
    return "mastered";
  }

  return "strong";
}

/**
 * Group items by category for review session planning
 */
export function groupByCategory(items: ReviewItem[]): Map<string, ReviewItem[]> {
  const groups = new Map<string, ReviewItem[]>();

  items.forEach((item) => {
    const existing = groups.get(item.category) || [];
    existing.push(item);
    groups.set(item.category, existing);
  });

  return groups;
}
