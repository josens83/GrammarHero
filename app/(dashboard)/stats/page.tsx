/**
 * @fileoverview Statistics Page
 * @description Comprehensive learning statistics and progress tracking
 */

"use client";

import { useUser } from "@/hooks/useUser";
import { LearningStats } from "@/components/dashboard/LearningStats";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Share2 } from "lucide-react";

export default function StatsPage() {
  const { user, isLoading } = useUser();

  if (isLoading) return <PageLoader />;
  if (!user) return <PageLoader />;

  // Demo stats data - in production, this would come from the database
  const stats = {
    totalXp: user.totalXp,
    level: user.level,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lessonsCompleted: 24,
    totalTimeMinutes: 180,
    averageScore: 87,
    perfectLessons: 8,
    achievementsUnlocked: 5,
    totalAchievements: 16,
    weeklyXp: [45, 60, 30, 75, 50, 0, 35],
    dailyGoal: user.dailyGoal,
    todayXp: 35,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Your Statistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your learning progress and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Learning Stats Component */}
      <LearningStats stats={stats} />

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                Best Learning Time
              </h3>
              <p className="text-2xl font-bold">Evening</p>
              <p className="text-sm text-muted-foreground">
                You perform best between 6-9 PM
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                Strongest Category
              </h3>
              <p className="text-2xl font-bold">Tenses</p>
              <p className="text-sm text-muted-foreground">
                92% accuracy in this category
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                Recommended Focus
              </h3>
              <p className="text-2xl font-bold">Articles</p>
              <p className="text-sm text-muted-foreground">
                Practice more to improve accuracy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
