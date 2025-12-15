"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLessonStore } from "@/stores/lessonStore";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { X, Heart, Zap, CheckCircle2, XCircle, Lightbulb, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Demo exercises
const DEMO_EXERCISES = [
  { id: "1", type: "multiple_choice", question: "She ___ to school every day.", correctAnswer: "goes", options: ["go", "goes", "going", "gone"], explanation: "We use 'goes' with third person singular (he/she/it) in present simple." },
  { id: "2", type: "fill_in_blank", question: "They ___ playing football right now.", correctAnswer: "are", hint: "Present continuous needs a form of 'be'", explanation: "Present continuous: subject + am/is/are + verb-ing" },
  { id: "3", type: "multiple_choice", question: "I ___ my homework yesterday.", correctAnswer: "did", options: ["do", "did", "done", "does"], explanation: "We use past simple 'did' for actions completed in the past." },
  { id: "4", type: "sentence_correction", question: "Correct the sentence:", sentence: "She don't like coffee.", correctAnswer: "She doesn't like coffee.", explanation: "Third person singular uses 'doesn't' not 'don't'." },
];

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const { user, addXp, useHeart } = useUserStore();
  const { exercises, currentExerciseIndex, progress, selectedAnswer, isAnswerSubmitted, isCorrect, results, startLesson, selectAnswer, submitAnswer, nextExercise, completeLesson, resetLesson } = useLessonStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startLesson(params.lessonId, DEMO_EXERCISES);
    setIsLoading(false);
    return () => resetLesson();
  }, [params.lessonId, startLesson, resetLesson]);

  if (isLoading || exercises.length === 0) return <PageLoader />;

  const currentExercise = exercises[currentExerciseIndex];
  const progressPercent = ((currentExerciseIndex + (isAnswerSubmitted ? 1 : 0)) / exercises.length) * 100;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    const result = submitAnswer();
    if (!result.isCorrect && user?.subscriptionTier === "free") {
      useHeart();
    }
  };

  const handleNext = () => {
    const hasMore = nextExercise();
    if (!hasMore) {
      const result = completeLesson();
      addXp(result.xpEarned);
      if (result.isPerfect) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  // Results Screen
  if (results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className={cn("w-20 h-20 rounded-full mx-auto flex items-center justify-center", results.isPerfect ? "bg-primary" : "bg-yellow-500")}>
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{results.isPerfect ? "Perfect!" : "Lesson Complete!"}</h2>
                <p className="text-muted-foreground">You scored {results.score}%</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg"><Zap className="h-6 w-6 text-primary mx-auto mb-1" /><p className="text-xl font-bold">+{results.xpEarned}</p><p className="text-xs text-muted-foreground">XP Earned</p></div>
                <div className="p-4 bg-muted rounded-lg"><CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-1" /><p className="text-xl font-bold">{results.correctAnswers}/{results.totalQuestions}</p><p className="text-xs text-muted-foreground">Correct</p></div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" asChild><Link href="/learn">Continue Learning</Link></Button>
                <Button variant="outline" className="w-full" onClick={() => { resetLesson(); startLesson(params.lessonId, DEMO_EXERCISES); }}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b p-4">
        <div className="container flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/learn"><X className="h-5 w-5" /></Link></Button>
          <Progress value={progressPercent} className="flex-1 h-3" />
          {user?.subscriptionTier === "free" && (
            <div className="flex items-center gap-1"><Heart className="h-5 w-5 text-red-500 fill-red-500" /><span className="font-semibold">{user.hearts}</span></div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={currentExerciseIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Question {currentExerciseIndex + 1} of {exercises.length}</p>
              <h2 className="text-xl font-semibold">{currentExercise.question}</h2>
              {currentExercise.sentence && <p className="mt-4 p-4 bg-muted rounded-lg text-lg">{currentExercise.sentence}</p>}
            </div>

            {/* Answer Options */}
            {currentExercise.type === "multiple_choice" && currentExercise.options && (
              <div className="grid gap-3">
                {currentExercise.options.map((option) => (
                  <button key={option} onClick={() => !isAnswerSubmitted && selectAnswer(option)} disabled={isAnswerSubmitted}
                    className={cn("p-4 rounded-lg border-2 text-left transition-all",
                      selectedAnswer === option ? (isAnswerSubmitted ? (isCorrect ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10") : "border-primary bg-primary/5") : "border-input hover:border-primary/50",
                      isAnswerSubmitted && option === currentExercise.correctAnswer && "border-primary bg-primary/10"
                    )}>
                    <span className="font-medium">{option}</span>
                    {isAnswerSubmitted && option === currentExercise.correctAnswer && <CheckCircle2 className="inline ml-2 h-4 w-4 text-primary" />}
                    {isAnswerSubmitted && selectedAnswer === option && !isCorrect && <XCircle className="inline ml-2 h-4 w-4 text-destructive" />}
                  </button>
                ))}
              </div>
            )}

            {currentExercise.type === "fill_in_blank" && (
              <div className="space-y-4">
                <input type="text" value={selectedAnswer || ""} onChange={(e) => !isAnswerSubmitted && selectAnswer(e.target.value)} disabled={isAnswerSubmitted}
                  className={cn("w-full p-4 rounded-lg border-2 text-center text-lg", isAnswerSubmitted && (isCorrect ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"))}
                  placeholder="Type your answer..." />
                {currentExercise.hint && !isAnswerSubmitted && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Lightbulb className="h-4 w-4" />{currentExercise.hint}</p>
                )}
              </div>
            )}

            {currentExercise.type === "sentence_correction" && (
              <div className="space-y-4">
                <textarea value={selectedAnswer || ""} onChange={(e) => !isAnswerSubmitted && selectAnswer(e.target.value)} disabled={isAnswerSubmitted}
                  className={cn("w-full p-4 rounded-lg border-2 min-h-[100px]", isAnswerSubmitted && (isCorrect ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"))}
                  placeholder="Write the correct sentence..." />
              </div>
            )}

            {/* Feedback */}
            {isAnswerSubmitted && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("p-4 rounded-lg", isCorrect ? "bg-primary/10" : "bg-destructive/10")}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}
                  <span className="font-semibold">{isCorrect ? "Correct!" : "Not quite"}</span>
                </div>
                {!isCorrect && <p className="text-sm mb-2">Correct answer: <strong>{currentExercise.correctAnswer}</strong></p>}
                {currentExercise.explanation && <p className="text-sm text-muted-foreground">{currentExercise.explanation}</p>}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-background border-t p-4">
        <div className="container max-w-2xl">
          {!isAnswerSubmitted ? (
            <Button className="w-full" size="lg" disabled={!selectedAnswer} onClick={handleSubmit}>Check Answer</Button>
          ) : (
            <Button className="w-full" size="lg" onClick={handleNext}>{currentExerciseIndex < exercises.length - 1 ? "Continue" : "Finish"} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          )}
        </div>
      </footer>
    </div>
  );
}
