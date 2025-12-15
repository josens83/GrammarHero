/**
 * @fileoverview Streak Protection Component
 * @description Modal and alerts for streak protection features
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Shield, AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  isStreakAtRisk,
  getHoursUntilStreakExpires,
  getStreakStatusMessage,
  getNextMilestone,
  getDaysUntilMilestone,
} from "@/lib/streaks/streak-manager";

interface StreakProtectionProps {
  currentStreak: number;
  lastActivityDate: Date | null;
  streakFreezes: number;
  onUseFreeze: () => void;
  onStartLesson: () => void;
}

export function StreakProtection({
  currentStreak,
  lastActivityDate,
  streakFreezes,
  onUseFreeze,
  onStartLesson,
}: StreakProtectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const atRisk = isStreakAtRisk(lastActivityDate);

  useEffect(() => {
    if (atRisk && currentStreak > 0) {
      const hours = getHoursUntilStreakExpires(lastActivityDate);
      setHoursRemaining(hours);

      // Show modal if less than 4 hours remaining
      if (hours > 0 && hours <= 4) {
        setShowModal(true);
      }

      // Update every minute
      const interval = setInterval(() => {
        const newHours = getHoursUntilStreakExpires(lastActivityDate);
        setHoursRemaining(newHours);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [atRisk, currentStreak, lastActivityDate]);

  const nextMilestone = getNextMilestone(currentStreak);
  const daysUntilMilestone = getDaysUntilMilestone(currentStreak);

  return (
    <>
      {/* Streak at risk banner */}
      <AnimatePresence>
        {atRisk && currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-16 left-1/2 -translate-x-1/2 z-50",
              "px-4 py-2 rounded-full shadow-lg",
              hoursRemaining <= 2
                ? "bg-red-500 text-white"
                : "bg-orange-500 text-white"
            )}
          >
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              <span className="font-medium">
                {hoursRemaining <= 2
                  ? `Streak expires in ${hoursRemaining}h!`
                  : `Keep your ${currentStreak}-day streak alive!`}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={onStartLesson}
                className="ml-2"
              >
                Practice now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak protection modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="h-5 w-5" />
              Streak at Risk!
            </DialogTitle>
            <DialogDescription>
              Your {currentStreak}-day streak will expire soon. Take action now!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Streak display */}
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30"
              >
                <Flame className="h-10 w-10 text-orange-500" />
              </motion.div>
              <p className="text-4xl font-bold mt-4">{currentStreak}</p>
              <p className="text-muted-foreground">day streak</p>
            </div>

            {/* Time remaining */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Time remaining
                </span>
                <span className="font-bold text-orange-500">
                  {hoursRemaining}h
                </span>
              </div>
              <Progress
                value={(hoursRemaining / 24) * 100}
                className="h-2"
              />
            </div>

            {/* Next milestone */}
            {nextMilestone && (
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Next milestone in{" "}
                  <span className="font-bold text-primary">
                    {daysUntilMilestone} days
                  </span>
                </p>
                <p className="font-medium">
                  {nextMilestone}-day streak reward!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={onStartLesson} className="w-full" size="lg">
                <Flame className="mr-2 h-5 w-5" />
                Practice Now
              </Button>

              {streakFreezes > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onUseFreeze();
                    setShowModal(false);
                  }}
                  className="w-full"
                >
                  <Shield className="mr-2 h-5 w-5 text-blue-500" />
                  Use Streak Freeze ({streakFreezes} left)
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Streak celebration modal for milestones
 */
interface StreakCelebrationProps {
  milestone: number;
  onClose: () => void;
}

export function StreakCelebration({ milestone, onClose }: StreakCelebrationProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center"
        >
          <Flame className="h-12 w-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mt-4">
            {milestone}-Day Streak!
          </h2>
          <p className="text-muted-foreground mt-2">
            {milestone >= 365
              ? "A full year of learning! You're legendary!"
              : milestone >= 30
              ? "A whole month! Your dedication is inspiring!"
              : milestone >= 7
              ? "A full week! You're on fire!"
              : "Great start! Keep the momentum going!"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Button onClick={onClose} className="w-full">
            Continue Learning
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Streak broken modal
 */
interface StreakBrokenProps {
  previousStreak: number;
  onRecover?: () => void;
  recoveryCost?: number;
  onClose: () => void;
}

export function StreakBroken({
  previousStreak,
  onRecover,
  recoveryCost,
  onClose,
}: StreakBrokenProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="mx-auto w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
        >
          <Flame className="h-12 w-12 text-gray-400" />
        </motion.div>

        <h2 className="text-2xl font-bold mt-4">Streak Lost</h2>
        <p className="text-muted-foreground mt-2">
          Your {previousStreak}-day streak has ended. Don't worry, everyone
          misses a day sometimes!
        </p>

        <div className="space-y-3 mt-6">
          {onRecover && recoveryCost && (
            <Button
              variant="secondary"
              onClick={onRecover}
              className="w-full"
            >
              Recover Streak ({recoveryCost} gems)
            </Button>
          )}
          <Button onClick={onClose} className="w-full">
            Start Fresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StreakProtection;
