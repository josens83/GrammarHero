import { create } from "zustand";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
}

interface GamificationState {
  xpAnimations: { id: string; amount: number; x: number; y: number }[];
  currentAchievement: Achievement | null;
  soundEnabled: boolean;
  addXpAnimation: (amount: number, x: number, y: number) => void;
  removeXpAnimation: (id: string) => void;
  showAchievement: (achievement: Achievement) => void;
  dismissAchievement: () => void;
  toggleSound: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  xpAnimations: [],
  currentAchievement: null,
  soundEnabled: true,

  addXpAnimation: (amount, x, y) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ xpAnimations: [...state.xpAnimations, { id, amount, x, y }] }));
    setTimeout(() => {
      set((state) => ({ xpAnimations: state.xpAnimations.filter((a) => a.id !== id) }));
    }, 1500);
  },

  removeXpAnimation: (id) => set((state) => ({
    xpAnimations: state.xpAnimations.filter((a) => a.id !== id),
  })),

  showAchievement: (achievement) => set({ currentAchievement: achievement }),
  dismissAchievement: () => set({ currentAchievement: null }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));

export function playSound(type: "correct" | "wrong" | "levelup" | "achievement") {
  const store = useGamificationStore.getState();
  if (!store.soundEnabled) return;
  // Sound implementation would go here
}
