import { create } from "zustand";
import { ExerciseData, LessonProgress, LessonResult } from "@/types/lesson";

interface LessonState {
  currentLessonId: string | null;
  exercises: ExerciseData[];
  currentExerciseIndex: number;
  progress: LessonProgress | null;
  selectedAnswer: string | null;
  isAnswerSubmitted: boolean;
  isCorrect: boolean | null;
  showExplanation: boolean;
  results: LessonResult | null;

  startLesson: (lessonId: string, exercises: ExerciseData[]) => void;
  selectAnswer: (answer: string) => void;
  submitAnswer: () => { isCorrect: boolean; correctAnswer: string };
  nextExercise: () => boolean;
  completeLesson: () => LessonResult;
  resetLesson: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentLessonId: null,
  exercises: [],
  currentExerciseIndex: 0,
  progress: null,
  selectedAnswer: null,
  isAnswerSubmitted: false,
  isCorrect: null,
  showExplanation: false,
  results: null,

  startLesson: (lessonId, exercises) => set({
    currentLessonId: lessonId,
    exercises,
    currentExerciseIndex: 0,
    progress: {
      lessonId,
      totalExercises: exercises.length,
      completedExercises: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentStreak: 0,
      startTime: Date.now(),
    },
    selectedAnswer: null,
    isAnswerSubmitted: false,
    isCorrect: null,
    showExplanation: false,
    results: null,
  }),

  selectAnswer: (answer) => set({ selectedAnswer: answer }),

  submitAnswer: () => {
    const state = get();
    const exercise = state.exercises[state.currentExerciseIndex];
    const isCorrect = state.selectedAnswer?.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim();

    set((s) => ({
      isAnswerSubmitted: true,
      isCorrect,
      showExplanation: true,
      progress: s.progress ? {
        ...s.progress,
        correctAnswers: s.progress.correctAnswers + (isCorrect ? 1 : 0),
        wrongAnswers: s.progress.wrongAnswers + (isCorrect ? 0 : 1),
        currentStreak: isCorrect ? s.progress.currentStreak + 1 : 0,
      } : null,
    }));

    return { isCorrect, correctAnswer: exercise.correctAnswer };
  },

  nextExercise: () => {
    const state = get();
    if (state.currentExerciseIndex >= state.exercises.length - 1) return false;
    set((s) => ({
      currentExerciseIndex: s.currentExerciseIndex + 1,
      selectedAnswer: null,
      isAnswerSubmitted: false,
      isCorrect: null,
      showExplanation: false,
      progress: s.progress ? { ...s.progress, completedExercises: s.progress.completedExercises + 1 } : null,
    }));
    return true;
  },

  completeLesson: () => {
    const state = get();
    const progress = state.progress!;
    const timeSpent = Math.floor((Date.now() - progress.startTime) / 1000);
    const score = Math.round((progress.correctAnswers / progress.totalExercises) * 100);
    const isPerfect = score === 100;
    const baseXp = 10;
    const xpEarned = baseXp + (isPerfect ? 5 : 0) + progress.correctAnswers;

    const results: LessonResult = {
      lessonId: state.currentLessonId!,
      score,
      xpEarned,
      timeSpent,
      correctAnswers: progress.correctAnswers,
      totalQuestions: progress.totalExercises,
      isPerfect,
    };

    set({ results });
    return results;
  },

  resetLesson: () => set({
    currentLessonId: null,
    exercises: [],
    currentExerciseIndex: 0,
    progress: null,
    selectedAnswer: null,
    isAnswerSubmitted: false,
    isCorrect: null,
    showExplanation: false,
    results: null,
  }),
}));
