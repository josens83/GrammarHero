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
