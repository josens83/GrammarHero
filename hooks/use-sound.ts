/**
 * @fileoverview Sound Effects Hook
 * @description Provides audio feedback for user interactions
 *
 * Features:
 * - Preloaded audio for instant playback
 * - Volume control
 * - Mute toggle with persistence
 * - Different sound categories
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Sound types
export type SoundType =
  | "correct"
  | "incorrect"
  | "complete"
  | "levelUp"
  | "achievement"
  | "click"
  | "streak"
  | "xp";

// Sound store for global state
interface SoundState {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      isMuted: false,
      volume: 0.5,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    { name: "sound-settings" }
  )
);

// Sound URLs (using Web Audio API oscillator for demo, replace with actual audio files)
const SOUND_FREQUENCIES: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
  correct: { freq: 880, duration: 150, type: "sine" },
  incorrect: { freq: 220, duration: 200, type: "sawtooth" },
  complete: { freq: 523.25, duration: 300, type: "sine" },
  levelUp: { freq: 659.25, duration: 400, type: "sine" },
  achievement: { freq: 784, duration: 500, type: "sine" },
  click: { freq: 1000, duration: 50, type: "square" },
  streak: { freq: 440, duration: 200, type: "sine" },
  xp: { freq: 600, duration: 100, type: "sine" },
};

/**
 * Hook to play sound effects
 *
 * @example
 * function QuizComponent() {
 *   const { playSound } = useSound();
 *
 *   const handleCorrectAnswer = () => {
 *     playSound('correct');
 *   };
 *
 *   return <button onClick={handleCorrectAnswer}>Submit</button>;
 * }
 */
export function useSound() {
  const { isMuted, volume } = useSoundStore();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a sound effect
  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return;

      const audioContext = initAudioContext();
      if (!audioContext) return;

      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const soundConfig = SOUND_FREQUENCIES[type];
      if (!soundConfig) return;

      try {
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = soundConfig.type;
        oscillator.frequency.setValueAtTime(
          soundConfig.freq,
          audioContext.currentTime
        );

        // Set volume
        gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + soundConfig.duration / 1000
        );

        // Special handling for multi-note sounds
        if (type === "complete" || type === "levelUp") {
          // Play a chord
          const oscillator2 = audioContext.createOscillator();
          oscillator2.connect(gainNode);
          oscillator2.type = soundConfig.type;
          oscillator2.frequency.setValueAtTime(
            soundConfig.freq * 1.25, // Major third
            audioContext.currentTime
          );
          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(
            audioContext.currentTime + soundConfig.duration / 1000
          );
        }

        if (type === "achievement") {
          // Play ascending notes
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((note, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(note, audioContext.currentTime);
            gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(
              0.01,
              audioContext.currentTime + i * 0.1 + 0.2
            );
            osc.start(audioContext.currentTime + i * 0.1);
            osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
          });
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(
          audioContext.currentTime + soundConfig.duration / 1000
        );
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    },
    [isMuted, volume, initAudioContext]
  );

  // Play XP gain sound (with pitch variation based on amount)
  const playXpSound = useCallback(
    (xpAmount: number) => {
      if (isMuted) return;

      const audioContext = initAudioContext();
      if (!audioContext) return;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      try {
        // Higher pitch for more XP
        const baseFreq = 400 + Math.min(xpAmount * 10, 400);
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          baseFreq * 1.5,
          audioContext.currentTime + 0.1
        );

        gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.15
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } catch (error) {
        console.error("Error playing XP sound:", error);
      }
    },
    [isMuted, volume, initAudioContext]
  );

  // Play streak milestone sound
  const playStreakSound = useCallback(
    (streakCount: number) => {
      if (isMuted) return;

      const audioContext = initAudioContext();
      if (!audioContext) return;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      try {
        // Play ascending notes based on streak milestone
        const baseNote = 261.63; // C4
        const notes =
          streakCount >= 7
            ? [baseNote, baseNote * 1.25, baseNote * 1.5, baseNote * 2] // Week streak
            : [baseNote, baseNote * 1.25, baseNote * 1.5];

        notes.forEach((note, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(note, audioContext.currentTime);
          gain.gain.setValueAtTime(
            volume * 0.2,
            audioContext.currentTime + i * 0.08
          );
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + i * 0.08 + 0.15
          );
          osc.start(audioContext.currentTime + i * 0.08);
          osc.stop(audioContext.currentTime + i * 0.08 + 0.15);
        });
      } catch (error) {
        console.error("Error playing streak sound:", error);
      }
    },
    [isMuted, volume, initAudioContext]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    playXpSound,
    playStreakSound,
    isMuted,
    volume,
  };
}

export default useSound;
