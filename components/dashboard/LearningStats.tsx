/**
 * @fileoverview Learning Statistics Component
 * @description Displays user's learning progress and statistics
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Clock,
  Zap,
  Flame,
  Trophy,
  BookOpen,
  Calendar,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LearningStatsProps {
  stats: {
    totalXp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lessonsCompleted: number;
    totalTimeMinutes: number;
    averageScore: number;
    perfectLessons: number;
    achievementsUnlocked: number;
    totalAchievements: number;
    weeklyXp: number[];
    dailyGoal: number;
    todayXp: number;
  };
  className?: string;
}

export function LearningStats({ stats, className }: LearningStatsProps) {
  // Calculate XP to next level
  const xpForCurrentLevel = stats.level * 100;
  const xpForNextLevel = (stats.level + 1) * 100;
  const xpProgress =
    ((stats.totalXp - xpForCurrentLevel) /
      (xpForNextLevel - xpForCurrentLevel)) *
    100;

  // Daily goal progress
  const dailyGoalProgress = Math.min(
    100,
    (stats.todayXp / stats.dailyGoal) * 100
  );

  // Weekly trend
  const weeklyTotal = stats.weeklyXp.reduce((a, b) => a + b, 0);
  const weeklyAverage = Math.round(weeklyTotal / 7);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxWeeklyXp = Math.max(...stats.weeklyXp, 1);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Level */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{stats.level}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={xpProgress} className="mt-2 h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalXp} / {xpForNextLevel} XP
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak} days</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Best: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        {/* Lessons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lessons</p>
                <p className="text-2xl font-bold">{stats.lessonsCompleted}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.perfectLessons} perfect scores
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">
                  {stats.achievementsUnlocked}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <Progress
              value={(stats.achievementsUnlocked / stats.totalAchievements) * 100}
              className="mt-2 h-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.achievementsUnlocked} / {stats.totalAchievements}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal & Weekly Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Goal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold">{stats.todayXp}</p>
                  <p className="text-sm text-muted-foreground">
                    of {stats.dailyGoal} XP goal
                  </p>
                </div>
                <div
                  className={cn(
                    "text-right",
                    dailyGoalProgress >= 100 && "text-green-500"
                  )}
                >
                  <p className="text-2xl font-bold">
                    {Math.round(dailyGoalProgress)}%
                  </p>
                  {dailyGoalProgress >= 100 && (
                    <p className="text-sm">Goal reached!</p>
                  )}
                </div>
              </div>
              <Progress value={dailyGoalProgress} className="h-3" />

              {dailyGoalProgress < 100 && (
                <p className="text-sm text-muted-foreground">
                  {stats.dailyGoal - stats.todayXp} XP more to reach your goal
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end h-24">
                {stats.weeklyXp.map((xp, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(xp / maxWeeklyXp) * 80}px` }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={cn(
                        "w-6 rounded-t-sm",
                        xp > 0
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {dayLabels[index]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Weekly total: <strong>{weeklyTotal} XP</strong>
                </span>
                <span className="text-muted-foreground">
                  Daily avg: <strong>{weeklyAverage} XP</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Award className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
              <p className="text-xs text-muted-foreground">Avg. Score</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.perfectLessons}</p>
              <p className="text-xs text-muted-foreground">Perfect Scores</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                {Math.floor(stats.totalTimeMinutes / 60)}h{" "}
                {stats.totalTimeMinutes % 60}m
              </p>
              <p className="text-xs text-muted-foreground">Time Spent</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalXp}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LearningStats;
