import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, SubscriptionTier } from "@/types/user";
import { HEARTS_CONFIG } from "@/lib/constants";
import { getLevelFromXP } from "@/lib/utils";

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  addXp: (amount: number) => void;
  updateStreak: (streak: number) => void;
  useHeart: () => boolean;
  refillHearts: () => void;
  setSubscription: (tier: SubscriptionTier, expiresAt: string | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      addXp: (amount) => set((state) => {
        if (!state.user) return state;
        const newTotalXp = state.user.totalXp + amount;
        const newLevel = getLevelFromXP(newTotalXp);
        return { user: { ...state.user, totalXp: newTotalXp, level: newLevel } };
      }),

      updateStreak: (streak) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            currentStreak: streak,
            longestStreak: Math.max(state.user.longestStreak, streak),
          },
        };
      }),

      useHeart: () => {
        const state = get();
        if (!state.user) return false;
        if (state.user.subscriptionTier !== "free") return true;
        if (state.user.hearts <= 0) return false;
        set({ user: { ...state.user, hearts: state.user.hearts - 1 } });
        return true;
      },

      refillHearts: () => set((state) => {
        if (!state.user) return state;
        return { user: { ...state.user, hearts: HEARTS_CONFIG.MAX_HEARTS, heartsRefillAt: null } };
      }),

      setSubscription: (tier, expiresAt) => set((state) => {
        if (!state.user) return state;
        return { user: { ...state.user, subscriptionTier: tier, subscriptionExpiresAt: expiresAt } };
      }),

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "user-storage", partialize: (state) => ({ user: state.user }) }
  )
);
