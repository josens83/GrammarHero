/**
 * @fileoverview Gamification Store
 * @description Zustand store for managing gamification state including XP animations,
 * achievements, sound effects, and user engagement features
 */

import { create } from "zustand";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
}

interface XpAnimation {
  id: string;
  amount: number;
  x: number;
  y: number;
}

interface XpGainNotification {
  id: string;
  amount: number;
  source: string;
  timestamp: number;
}

interface LevelUpNotification {
  newLevel: number;
  xpRequired: number;
  rewards?: string[];
}

interface GamificationState {
  // XP Animations
  xpAnimations: XpAnimation[];
  xpGainQueue: XpGainNotification[];

  // Achievements
  currentAchievement: Achievement | null;
  recentAchievements: Achievement[];

  // Level Up
  levelUpNotification: LevelUpNotification | null;

  // Settings
  soundEnabled: boolean;
  animationsEnabled: boolean;

  // Streak
  streakCelebration: number | null;

  // Actions
  addXpAnimation: (amount: number, x: number, y: number) => void;
  removeXpAnimation: (id: string) => void;
  showXpGain: (amount: number, source?: string) => void;
  clearXpGainQueue: () => void;
  showAchievement: (achievement: Achievement) => void;
  dismissAchievement: () => void;
  showLevelUp: (newLevel: number, xpRequired: number, rewards?: string[]) => void;
  dismissLevelUp: () => void;
  celebrateStreak: (streakCount: number) => void;
  dismissStreakCelebration: () => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  // Initial State
  xpAnimations: [],
  xpGainQueue: [],
  currentAchievement: null,
  recentAchievements: [],
  levelUpNotification: null,
  soundEnabled: true,
  animationsEnabled: true,
  streakCelebration: null,

  // XP Animation - floating numbers
  addXpAnimation: (amount, x, y) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      xpAnimations: [...state.xpAnimations, { id, amount, x, y }],
    }));
    // Auto-remove after animation completes
    setTimeout(() => {
      set((state) => ({
        xpAnimations: state.xpAnimations.filter((a) => a.id !== id),
      }));
    }, 1500);
  },

  removeXpAnimation: (id) =>
    set((state) => ({
      xpAnimations: state.xpAnimations.filter((a) => a.id !== id),
    })),

  // Show XP gain notification
  showXpGain: (amount, source = "lesson") => {
    const id = Math.random().toString(36).slice(2);
    const notification: XpGainNotification = {
      id,
      amount,
      source,
      timestamp: Date.now(),
    };

    set((state) => ({
      xpGainQueue: [...state.xpGainQueue, notification],
    }));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        xpGainQueue: state.xpGainQueue.filter((n) => n.id !== id),
      }));
    }, 3000);

    // Also add floating animation at center of screen
    if (get().animationsEnabled) {
      get().addXpAnimation(amount, window.innerWidth / 2, window.innerHeight / 2);
    }
  },

  clearXpGainQueue: () => set({ xpGainQueue: [] }),

  // Achievement notifications
  showAchievement: (achievement) => {
    set((state) => ({
      currentAchievement: achievement,
      recentAchievements: [achievement, ...state.recentAchievements.slice(0, 4)],
    }));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      set((state) => {
        if (state.currentAchievement?.id === achievement.id) {
          return { currentAchievement: null };
        }
        return state;
      });
    }, 5000);
  },

  dismissAchievement: () => set({ currentAchievement: null }),

  // Level up notifications
  showLevelUp: (newLevel, xpRequired, rewards) => {
    set({
      levelUpNotification: { newLevel, xpRequired, rewards },
    });
  },

  dismissLevelUp: () => set({ levelUpNotification: null }),

  // Streak celebrations
  celebrateStreak: (streakCount) => {
    set({ streakCelebration: streakCount });

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => {
        if (state.streakCelebration === streakCount) {
          return { streakCelebration: null };
        }
        return state;
      });
    }, 4000);
  },

  dismissStreakCelebration: () => set({ streakCelebration: null }),

  // Settings toggles
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
}));

/**
 * Play sound effect based on type
 */
export function playSound(type: "correct" | "wrong" | "levelup" | "achievement" | "xp" | "streak") {
  const store = useGamificationStore.getState();
  if (!store.soundEnabled) return;

  // Sound frequencies for Web Audio API
  const sounds: Record<string, { freq: number; duration: number }> = {
    correct: { freq: 880, duration: 150 },
    wrong: { freq: 220, duration: 200 },
    levelup: { freq: 659.25, duration: 400 },
    achievement: { freq: 784, duration: 500 },
    xp: { freq: 600, duration: 100 },
    streak: { freq: 440, duration: 200 },
  };

  const config = sounds[type];
  if (!config) return;

  try {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(config.freq, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration / 1000);
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

export default useGamificationStore;
