/**
 * @fileoverview Lesson Result Component
 * @description Shows lesson completion results with XP earned and score
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Trophy,
  Star,
  Zap,
  Clock,
  Target,
  ChevronRight,
  RotateCcw,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LessonResult as LessonResultType } from "@/types/lesson";
import { cn } from "@/lib/utils";

interface LessonResultProps {
  result: LessonResultType;
  lessonTitle: string;
  onRetry: () => void;
  onContinue: () => void;
}

export function LessonResult({
  result,
  lessonTitle,
  onRetry,
  onContinue,
}: LessonResultProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  // Trigger confetti for high scores
  useEffect(() => {
    if (result.score >= 80) {
      const duration = result.isPerfect ? 3000 : 1500;
      const end = Date.now() + duration;

      const colors = result.isPerfect
        ? ["#ffd700", "#ffb800", "#ff8c00"]
        : ["#10b981", "#34d399"];

      const frame = () => {
        confetti({
          particleCount: result.isPerfect ? 4 : 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: result.isPerfect ? 4 : 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }

    // Show details after animation
    const timer = setTimeout(() => setShowDetails(true), 500);
    return () => clearTimeout(timer);
  }, [result]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getScoreMessage = () => {
    if (result.isPerfect) return "Perfect Score! 🎉";
    if (result.score >= 90) return "Excellent! 🌟";
    if (result.score >= 80) return "Great job! 👏";
    if (result.score >= 70) return "Good effort! 💪";
    if (result.score >= 60) return "Keep practicing! 📚";
    return "Don't give up! 🔄";
  };

  const getScoreColor = () => {
    if (result.score >= 90) return "text-yellow-500";
    if (result.score >= 80) return "text-green-500";
    if (result.score >= 70) return "text-blue-500";
    if (result.score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div
            className={cn(
              "p-8 text-center text-white",
              result.isPerfect
                ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                : result.score >= 80
                ? "bg-gradient-to-br from-green-400 to-emerald-500"
                : result.score >= 60
                ? "bg-gradient-to-br from-blue-400 to-blue-500"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            )}
          >
            {result.isPerfect ? (
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
              >
                <Trophy className="h-16 w-16 mx-auto mb-4" />
              </motion.div>
            ) : (
              <Star className="h-16 w-16 mx-auto mb-4" />
            )}

            <h2 className="text-2xl font-bold mb-2">{getScoreMessage()}</h2>
            <p className="opacity-90">{lessonTitle} completed</p>
          </div>

          {/* Score */}
          <div className="p-6 text-center border-b">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className={cn("text-6xl font-bold mb-2", getScoreColor())}
            >
              {result.score}%
            </motion.div>
            <Progress
              value={result.score}
              className="h-3 max-w-[200px] mx-auto"
            />
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
            className="p-6 grid grid-cols-2 gap-4"
          >
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">
                +{result.xpEarned}
              </div>
              <div className="text-xs text-muted-foreground">XP Earned</div>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg col-span-2">
              <Clock className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold">
                {formatTime(result.timeSpent)}
              </div>
              <div className="text-xs text-muted-foreground">Time Spent</div>
            </div>
          </motion.div>

          {/* New Achievements */}
          {result.newAchievements && result.newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-6 pb-4"
            >
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                  🏆 New Achievements Unlocked!
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.newAchievements.map((achievement) => (
                    <span
                      key={achievement}
                      className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-medium"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="p-6 pt-2 space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={onContinue}
            >
              Continue Learning
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onRetry}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LessonResult;
