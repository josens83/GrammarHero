export type ExerciseType = "multiple_choice" | "fill_in_blank" | "sentence_correction" | "word_order";

export interface ExerciseData {
  id: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  wrongAnswers?: string[];
  hint?: string;
  explanation?: string;
  sentence?: string;
  options?: string[];
}

export interface LessonProgress {
  lessonId: string;
  totalExercises: number;
  completedExercises: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  startTime: number;
}

export interface LessonResult {
  lessonId: string;
  score: number;
  xpEarned: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  isPerfect: boolean;
  newAchievements?: string[];
}

export interface LessonContent {
  introduction: string;
  rules: { title: string; explanation: string; examples: string[] }[];
  tips?: string[];
}
