/**
 * @fileoverview Lesson Detail Page
 * @description Interactive lesson page with exercises
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Book,
  Clock,
  Zap,
  Heart,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/common/LoadingSpinner";
import {
  MultipleChoice,
  FillInBlank,
  SentenceCorrection,
  WordOrder,
  LessonResult,
} from "@/components/exercises";
import { useLessonStore } from "@/stores/lessonStore";
import { useUserStore } from "@/stores/userStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { getLessonById, shuffleArray } from "@/lib/lessons/sample-lessons";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

type LessonPhase = "intro" | "exercise" | "result";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [phase, setPhase] = useState<LessonPhase>("intro");
  const [isLoading, setIsLoading] = useState(true);

  // Stores
  const {
    exercises,
    currentExerciseIndex,
    selectedAnswer,
    isAnswerSubmitted,
    isCorrect,
    progress,
    results,
    startLesson,
    selectAnswer,
    submitAnswer,
    nextExercise,
    completeLesson,
    resetLesson,
  } = useLessonStore();

  const { user, useHeart, addXp } = useUserStore();
  const { showXpGain } = useGamificationStore();
  const { playSound, playXpSound } = useSound();

  // Get lesson data
  const lesson = getLessonById(lessonId);

  // Initialize lesson
  useEffect(() => {
    if (lesson) {
      setIsLoading(false);
    } else {
      // Lesson not found, redirect
      router.push("/learn");
    }

    return () => {
      resetLesson();
    };
  }, [lesson, router, resetLesson]);

  // Start the lesson
  const handleStartLesson = () => {
    if (!lesson) return;

    // Prepare exercises with shuffled options
    const preparedExercises = lesson.exercises.map((exercise) => {
      if (exercise.type === "multiple_choice" && exercise.options) {
        return {
          ...exercise,
          options: shuffleArray(exercise.options),
        };
      }
      if (exercise.type === "word_order" && exercise.options) {
        return {
          ...exercise,
          options: shuffleArray(exercise.options),
        };
      }
      return exercise;
    });

    startLesson(lessonId, preparedExercises);
    setPhase("exercise");
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    const result = submitAnswer();

    // Play sound based on result
    if (result.isCorrect) {
      playSound("correct");
    } else {
      playSound("incorrect");
      // Use heart for wrong answers (free users)
      if (user?.subscriptionTier === "free") {
        useHeart();
      }
    }
  };

  // Handle next exercise or complete
  const handleNext = () => {
    const hasMore = nextExercise();
    if (!hasMore) {
      // Complete lesson
      const result = completeLesson();

      // Play completion sound
      playSound("complete");

      // Add XP with sound
      addXp(result.xpEarned);
      playXpSound(result.xpEarned);
      if (showXpGain) {
        showXpGain(result.xpEarned);
      }

      setPhase("result");
    }
  };

  // Retry lesson
  const handleRetry = () => {
    setPhase("intro");
    resetLesson();
  };

  // Continue to next lesson or back to learn
  const handleContinue = () => {
    router.push("/learn");
  };

  // Exit lesson
  const handleExit = () => {
    if (phase === "exercise" && progress && progress.completedExercises > 0) {
      if (
        confirm("Are you sure you want to exit? Your progress will be lost.")
      ) {
        router.push("/learn");
      }
    } else {
      router.push("/learn");
    }
  };

  if (isLoading || !lesson) {
    return <PageLoader />;
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progressPercent = progress
    ? ((currentExerciseIndex + (isAnswerSubmitted ? 1 : 0)) /
        progress.totalExercises) *
      100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>

            {phase === "exercise" && (
              <>
                <Progress value={progressPercent} className="flex-1 h-2" />
                <div className="flex items-center gap-3 shrink-0">
                  {user?.subscriptionTier === "free" && (
                    <div className="flex items-center gap-1">
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          user.hearts > 0
                            ? "text-red-500 fill-red-500"
                            : "text-gray-300"
                        )}
                      />
                      <span className="font-medium">{user.hearts}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {phase === "intro" && (
              <div className="flex-1 text-center">
                <span className="font-medium">{lesson.title}</span>
              </div>
            )}

            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Intro Phase */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Lesson Header */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Book className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{lesson.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{lesson.xpReward} XP</span>
                  </div>
                </div>
              </div>

              {/* Lesson Content Preview */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-3">
                      What you'll learn
                    </h2>
                    <p className="text-muted-foreground">
                      {lesson.content.introduction}
                    </p>
                  </div>

                  {/* Rules */}
                  <div className="space-y-4">
                    {lesson.content.rules.map((rule, index) => (
                      <div
                        key={index}
                        className="bg-muted/50 p-4 rounded-lg space-y-2"
                      >
                        <h3 className="font-medium flex items-center gap-2">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">
                            {index + 1}
                          </span>
                          {rule.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {rule.explanation}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rule.examples.slice(0, 2).map((example, i) => (
                            <span
                              key={i}
                              className="text-xs bg-background px-2 py-1 rounded border"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {lesson.content.tips && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                        💡 Quick Tips
                      </h3>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        {lesson.content.tips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Start Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStartLesson}
                  className="min-w-[200px]"
                >
                  Start Practice
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Exercise Phase */}
          {phase === "exercise" && currentExercise && (
            <motion.div
              key={`exercise-${currentExerciseIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="py-8"
            >
              {/* Exercise number */}
              <div className="text-center mb-8">
                <span className="text-sm text-muted-foreground">
                  Question {currentExerciseIndex + 1} of {exercises.length}
                </span>
              </div>

              {/* Render exercise based on type */}
              {currentExercise.type === "multiple_choice" && (
                <MultipleChoice
                  question={currentExercise.question}
                  options={currentExercise.options || []}
                  correctAnswer={currentExercise.correctAnswer}
                  hint={currentExercise.hint}
                  explanation={currentExercise.explanation}
                  selectedAnswer={selectedAnswer}
                  isSubmitted={isAnswerSubmitted}
                  isCorrect={isCorrect}
                  onSelect={selectAnswer}
                  onSubmit={handleSubmitAnswer}
                  onNext={handleNext}
                  isLastQuestion={
                    currentExerciseIndex === exercises.length - 1
                  }
                />
              )}

              {currentExercise.type === "fill_in_blank" && (
                <FillInBlank
                  sentence={currentExercise.sentence || currentExercise.question}
                  correctAnswer={currentExercise.correctAnswer}
                  hint={currentExercise.hint}
                  explanation={currentExercise.explanation}
                  selectedAnswer={selectedAnswer}
                  isSubmitted={isAnswerSubmitted}
                  isCorrect={isCorrect}
                  onSelect={selectAnswer}
                  onSubmit={handleSubmitAnswer}
                  onNext={handleNext}
                  isLastQuestion={
                    currentExerciseIndex === exercises.length - 1
                  }
                />
              )}

              {currentExercise.type === "sentence_correction" && (
                <SentenceCorrection
                  sentence={currentExercise.sentence || currentExercise.question}
                  correctAnswer={currentExercise.correctAnswer}
                  hint={currentExercise.hint}
                  explanation={currentExercise.explanation}
                  selectedAnswer={selectedAnswer}
                  isSubmitted={isAnswerSubmitted}
                  isCorrect={isCorrect}
                  onSelect={selectAnswer}
                  onSubmit={handleSubmitAnswer}
                  onNext={handleNext}
                  isLastQuestion={
                    currentExerciseIndex === exercises.length - 1
                  }
                />
              )}

              {currentExercise.type === "word_order" && (
                <WordOrder
                  words={currentExercise.options || []}
                  correctAnswer={currentExercise.correctAnswer}
                  hint={currentExercise.hint}
                  explanation={currentExercise.explanation}
                  selectedAnswer={selectedAnswer}
                  isSubmitted={isAnswerSubmitted}
                  isCorrect={isCorrect}
                  onSelect={selectAnswer}
                  onSubmit={handleSubmitAnswer}
                  onNext={handleNext}
                  isLastQuestion={
                    currentExerciseIndex === exercises.length - 1
                  }
                />
              )}
            </motion.div>
          )}

          {/* Result Phase */}
          {phase === "result" && results && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <LessonResult
                result={results}
                lessonTitle={lesson.title}
                onRetry={handleRetry}
                onContinue={handleContinue}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
