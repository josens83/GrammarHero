"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Zap, Trophy, Flame, Book, Heart, Target, ArrowRight, Crown, Clock } from "lucide-react";
import { getXPForNextLevel } from "@/lib/utils";
import { GRAMMAR_CATEGORIES } from "@/lib/constants";

export default function DashboardPage() {
  const { user, isLoading } = useUser();

  if (isLoading) return <PageLoader />;
  if (!user) return <PageLoader />;

  const xpProgress = getXPForNextLevel(user.totalXp);

  // Demo data
  const todayProgress = { lessonsCompleted: 2, dailyGoal: user.dailyGoal, xpEarned: 35 };
  const recentLessons = [
    { id: "1", title: "Present Simple", category: "Tenses", progress: 100 },
    { id: "2", title: "Articles: A vs An", category: "Articles", progress: 60 },
    { id: "3", title: "Prepositions of Time", category: "Prepositions", progress: 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.displayName || "Learner"}!</h1>
          <p className="text-muted-foreground">Continue your grammar journey</p>
        </div>
        <Button asChild size="lg">
          <Link href="/learn">Continue Learning <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10"><Zap className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{user.totalXp}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/10"><Flame className="h-5 w-5 text-orange-500" /></div>
              <div>
                <p className="text-2xl font-bold">{user.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10"><Trophy className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-2xl font-bold">Level {user.level}</p>
                <p className="text-xs text-muted-foreground">{xpProgress.current}/{xpProgress.needed} XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10"><Heart className="h-5 w-5 text-red-500 fill-red-500" /></div>
              <div>
                <p className="text-2xl font-bold">{user.subscriptionTier === "free" ? user.hearts : "∞"}</p>
                <p className="text-xs text-muted-foreground">Hearts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Daily Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{todayProgress.lessonsCompleted} of {todayProgress.dailyGoal} lessons</span>
              <span className="text-primary">+{todayProgress.xpEarned} XP today</span>
            </div>
            <Progress value={(todayProgress.lessonsCompleted / todayProgress.dailyGoal) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Book className="h-5 w-5" />Continue Learning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLessons.map((lesson) => (
              <Link key={lesson.id} href={`/learn/${lesson.id}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">{lesson.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.progress === 100 ? (
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
                    <div className={`w-8 h-8 rounded-full ${cat.color} flex items-center justify-center mb-2`}>
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
                <p className="text-sm text-muted-foreground">Unlimited hearts, all lessons, and AI feedback</p>
              </div>
            </div>
            <Button asChild variant="secondary"><Link href="/pricing">View Plans</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
