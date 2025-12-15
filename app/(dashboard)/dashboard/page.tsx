/**
 * @fileoverview Dashboard Page
 * @description Main dashboard with user stats, recent lessons, and daily goals
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { StreakProtection } from "@/components/gamification/StreakProtection";
import {
  Zap,
  Trophy,
  Flame,
  Book,
  Heart,
  Target,
  ArrowRight,
  Crown,
  Clock,
  Brain,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { getXPForNextLevel, formatNumber } from "@/lib/utils";
import { GRAMMAR_CATEGORIES } from "@/lib/constants";

interface DashboardData {
  lessonProgress: Array<{
    lesson_id: string;
    status: string;
    score: number;
    lessons?: { title: string; category_id: string };
  }>;
  dailyActivity: Array<{
    date: string;
    xp_earned: number;
    lessons_completed: number;
  }>;
  stats: {
    completedLessons: number;
    weeklyXp: number;
  };
}

interface ReviewData {
  dueCount: number;
}

interface LeaderboardData {
  userRank: {
    rank: number;
  } | null;
}

interface StreakFreezeData {
  available: number;
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [streakFreezes, setStreakFreezes] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const [progressRes, reviewRes, leaderboardRes, freezeRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/review?due=true&limit=1"),
          fetch("/api/leaderboard?limit=1"),
          fetch("/api/streak/freeze"),
        ]);

        if (progressRes.ok) {
          const data = await progressRes.json();
          setDashboardData(data.data);
        }

        if (reviewRes.ok) {
          const data = await reviewRes.json();
          setReviewData(data.data);
        }

        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          setLeaderboardData(data.data);
        }

        if (freezeRes.ok) {
          const data = await freezeRes.json();
          setStreakFreezes(data.data.available || 0);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleUseStreakFreeze = async () => {
    if (streakFreezes <= 0) return;

    try {
      const res = await fetch("/api/streak/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "use" }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreakFreezes(data.data.remaining);
      }
    } catch (error) {
      console.error("Failed to use streak freeze:", error);
    }
  };

  if (isLoading || isLoadingData) return <PageLoader />;
  if (!user) return <PageLoader />;

  const xpProgress = getXPForNextLevel(user.totalXp);

  // Calculate today's progress
  const today = new Date().toISOString().split("T")[0];
  const todayActivity = dashboardData?.dailyActivity?.find((d) => d.date === today);
  const todayProgress = {
    lessonsCompleted: todayActivity?.lessons_completed || 0,
    dailyGoal: user.dailyGoal,
    xpEarned: todayActivity?.xp_earned || 0,
  };

  // Get recent lessons from progress
  const recentLessons = (dashboardData?.lessonProgress || [])
    .filter((p) => p.lessons)
    .slice(0, 3)
    .map((p) => ({
      id: p.lesson_id,
      title: p.lessons?.title || "Lesson",
      category: p.lessons?.category_id || "Grammar",
      progress: p.status === "completed" ? 100 : (p.score || 0),
      status: p.status,
    }));

  // If no recent lessons, show default starters
  const displayLessons = recentLessons.length > 0 ? recentLessons : [
    { id: "present-simple", title: "Present Simple", category: "Tenses", progress: 0, status: "available" },
    { id: "articles-basics", title: "Articles: A, An, The", category: "Articles", progress: 0, status: "available" },
    { id: "prepositions-place", title: "Prepositions of Place", category: "Prepositions", progress: 0, status: "available" },
  ];

  // Last activity date
  const lastActivityDate = user.lastActivityDate ? new Date(user.lastActivityDate) : new Date();

  return (
    <div className="p-6 space-y-6">
      {/* Streak Protection */}
      <StreakProtection
        currentStreak={user.currentStreak}
        lastActivityDate={lastActivityDate}
        streakFreezes={streakFreezes}
        onUseFreeze={handleUseStreakFreeze}
        onStartLesson={() => router.push("/learn")}
      />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user.displayName || "Learner"}!
          </h1>
          <p className="text-muted-foreground">Continue your grammar journey</p>
        </div>
        <Button asChild size="lg">
          <Link href="/learn">
            Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(user.totalXp)}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Level {user.level}</p>
                <p className="text-xs text-muted-foreground">
                  {xpProgress.current}/{xpProgress.needed} XP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {user.subscriptionTier === "free" ? user.hearts : "∞"}
                </p>
                <p className="text-xs text-muted-foreground">Hearts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>
                {todayProgress.lessonsCompleted} of {todayProgress.dailyGoal} lessons
              </span>
              <span className="text-primary font-medium">
                +{todayProgress.xpEarned} XP today
              </span>
            </div>
            <Progress
              value={(todayProgress.lessonsCompleted / todayProgress.dailyGoal) * 100}
              className="h-3"
            />
            {todayProgress.lessonsCompleted >= todayProgress.dailyGoal && (
              <p className="text-sm text-green-600 font-medium">
                Daily goal completed! Great job!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/challenge">
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <CalendarDays className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">Daily Challenge</p>
              <p className="text-xs text-muted-foreground">Earn bonus XP</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/review">
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Brain className="h-8 w-8 text-purple-500 mb-2" />
              <p className="font-medium">Review</p>
              <p className="text-xs text-muted-foreground">
                {reviewData?.dueCount || 0} items due
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leaderboard">
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <p className="font-medium">Leaderboard</p>
              <p className="text-xs text-muted-foreground">
                Rank #{leaderboardData?.userRank?.rank || "-"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stats">
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="font-medium">Statistics</p>
              <p className="text-xs text-muted-foreground">View progress</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayLessons.map((lesson) => (
              <Link key={lesson.id} href={`/learn/${lesson.id}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">{lesson.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.status === "completed" ? (
                      <Badge variant="success">Complete</Badge>
                    ) : lesson.progress > 0 ? (
                      <Badge variant="warning">{lesson.progress}%</Badge>
                    ) : (
                      <Badge variant="outline">New</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
            <Button variant="outline" asChild className="w-full">
              <Link href="/learn">View All Lessons</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Grammar Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {GRAMMAR_CATEGORIES.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={`/learn?category=${cat.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-full ${cat.color} flex items-center justify-center mb-2`}
                    >
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Banner */}
      {user.subscriptionTier === "free" && (
        <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Crown className="h-10 w-10 text-secondary" />
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Unlimited hearts, all lessons, and AI feedback
                </p>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
