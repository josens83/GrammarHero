/**
 * @fileoverview Daily Challenge Page
 * @description Daily challenge with special rewards
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Zap,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  X,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import {
  MultipleChoice,
  FillInBlank,
  SentenceCorrection,
  LessonResult,
} from "@/components/exercises";
import { useLessonStore } from "@/stores/lessonStore";
import { useUserStore } from "@/stores/userStore";
import {
  generateDailyChallenge,
  getTodayDateString,
  checkChallengeComplete,
  DailyChallenge,
} from "@/lib/challenges/daily-challenge";
import { shuffleArray } from "@/lib/lessons/sample-lessons";
import { cn } from "@/lib/utils";

type ChallengePhase = "intro" | "exercise" | "result";

export default function ChallengePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<ChallengePhase>("intro");
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

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

  const { user, addXp } = useUserStore();

  // Generate today's challenge
  useEffect(() => {
    const todayChallenge = generateDailyChallenge();
    setChallenge(todayChallenge);
  }, []);

  // Timer for timed challenges
  useEffect(() => {
    if (phase !== "exercise" || !challenge?.timeLimit || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = challenge.timeLimit! - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        // Auto-complete when time runs out
        handleCompleteChallenge();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, challenge, startTime]);

  // Clean up on unmount
  useEffect(() => {
    return () => resetLesson();
  }, [resetLesson]);

  const handleStartChallenge = () => {
    if (!challenge) return;

    const preparedExercises = challenge.exercises.map((exercise) => {
      if (exercise.type === "multiple_choice" && exercise.options) {
        return { ...exercise, options: shuffleArray(exercise.options) };
      }
      return exercise;
    });

    startLesson(challenge.id, preparedExercises);
    setStartTime(Date.now());
    if (challenge.timeLimit) {
      setTimeLeft(challenge.timeLimit);
    }
    setPhase("exercise");
  };

  const handleSubmitAnswer = () => {
    submitAnswer();
  };

  const handleNext = () => {
    const hasMore = nextExercise();
    if (!hasMore) {
      handleCompleteChallenge();
    }
  };

  const handleCompleteChallenge = () => {
    if (!challenge) return;

    const result = completeLesson();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const { completed, isPerfect, xpEarned } = checkChallengeComplete(
      challenge,
      result.score,
      timeSpent
    );

    if (completed) {
      addXp(xpEarned);
    }

    setPhase("result");
  };

  const handleRetry = () => {
    resetLesson();
    setPhase("intro");
    setTimeLeft(null);
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  const handleExit = () => {
    if (phase === "exercise") {
      if (confirm("Are you sure? Your progress will be lost.")) {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!challenge) {
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
            <Button variant="ghost" size="icon" onClick={handleExit}>
              <X className="h-5 w-5" />
            </Button>

            {phase === "exercise" && (
              <>
                <Progress value={progressPercent} className="flex-1 h-2" />
                {timeLeft !== null && (
                  <div
                    className={cn(
                      "flex items-center gap-1 font-mono font-bold",
                      timeLeft <= 30 && "text-red-500"
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </>
            )}

            {phase === "intro" && (
              <div className="flex-1 text-center">
                <span className="font-medium">Daily Challenge</span>
              </div>
            )}

            <div className="w-10" />
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
              {/* Challenge Header */}
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                  {challenge.icon}
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </Badge>
                  <h1 className="text-3xl font-bold">{challenge.title}</h1>
                  <p className="text-muted-foreground mt-2">
                    {challenge.description}
                  </p>
                </div>
              </div>

              {/* Challenge Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">
                        {challenge.exercises.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>

                    {challenge.timeLimit && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">
                          {formatTime(challenge.timeLimit)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Time Limit
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{challenge.xpReward}</p>
                      <p className="text-xs text-muted-foreground">XP Reward</p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-2xl font-bold">+{challenge.bonusXp}</p>
                      <p className="text-xs text-muted-foreground">
                        Perfect Bonus
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                      🎯 Challenge Requirements
                    </h3>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      {challenge.requirements.minScore && (
                        <li>• Score at least {challenge.requirements.minScore}%</li>
                      )}
                      {challenge.requirements.maxTime && (
                        <li>
                          • Complete within{" "}
                          {formatTime(challenge.requirements.maxTime)}
                        </li>
                      )}
                      {challenge.requirements.perfectRequired && (
                        <li>• Get 100% accuracy (no mistakes!)</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Start Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStartChallenge}
                  className="min-w-[200px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Start Challenge
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
              <div className="text-center mb-8">
                <span className="text-sm text-muted-foreground">
                  Question {currentExerciseIndex + 1} of {exercises.length}
                </span>
              </div>

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
                  isLastQuestion={currentExerciseIndex === exercises.length - 1}
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
                  isLastQuestion={currentExerciseIndex === exercises.length - 1}
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
                  isLastQuestion={currentExerciseIndex === exercises.length - 1}
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
                lessonTitle={`Daily Challenge: ${challenge.title}`}
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
