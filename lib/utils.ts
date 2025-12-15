import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(totalXp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let xpAccumulated = 0;
  while (xpAccumulated + xpNeeded <= totalXp) {
    xpAccumulated += xpNeeded;
    level++;
    xpNeeded = getXPForLevel(level);
  }
  return level;
}

export function getXPForNextLevel(totalXp: number): { current: number; needed: number; progress: number } {
  const level = getLevelFromXP(totalXp);
  let xpForCurrentLevel = 0;
  for (let i = 1; i < level; i++) {
    xpForCurrentLevel += getXPForLevel(i);
  }
  const currentLevelXP = totalXp - xpForCurrentLevel;
  const neededForNext = getXPForLevel(level);
  return {
    current: currentLevelXP,
    needed: neededForNext,
    progress: (currentLevelXP / neededForNext) * 100,
  };
}

export function getTimeUntilHeartRefill(refillAt: string): string {
  const refillTime = new Date(refillAt).getTime();
  const now = Date.now();
  const diff = refillTime - now;
  if (diff <= 0) return "Ready";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return formatDate(d);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + "s"}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function getGradeFromScore(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "A", color: "text-green-500" };
  if (score >= 80) return { grade: "B", color: "text-blue-500" };
  if (score >= 70) return { grade: "C", color: "text-yellow-500" };
  if (score >= 60) return { grade: "D", color: "text-orange-500" };
  return { grade: "F", color: "text-red-500" };
}
