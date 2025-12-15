"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Book, Lock, CheckCircle2, Clock, Zap, Crown, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { GRAMMAR_CATEGORIES } from "@/lib/constants";

// Demo lessons data
const DEMO_LESSONS = [
  { id: "present-simple", title: "Present Simple", category: "tenses", difficulty: "beginner", xp: 10, status: "completed", score: 100 },
  { id: "present-continuous", title: "Present Continuous", category: "tenses", difficulty: "beginner", xp: 10, status: "completed", score: 85 },
  { id: "past-simple", title: "Past Simple", category: "tenses", difficulty: "beginner", xp: 10, status: "available", score: 0 },
  { id: "past-continuous", title: "Past Continuous", category: "tenses", difficulty: "intermediate", xp: 15, status: "available", score: 0 },
  { id: "future-simple", title: "Future Simple", category: "tenses", difficulty: "intermediate", xp: 15, status: "locked", score: 0 },
  { id: "articles-a-an", title: "A vs An", category: "articles", difficulty: "beginner", xp: 10, status: "completed", score: 90 },
  { id: "articles-the", title: "The Definite Article", category: "articles", difficulty: "beginner", xp: 10, status: "available", score: 0 },
  { id: "prepositions-time", title: "Prepositions of Time", category: "prepositions", difficulty: "beginner", xp: 10, status: "available", score: 0 },
  { id: "prepositions-place", title: "Prepositions of Place", category: "prepositions", difficulty: "intermediate", xp: 15, status: "locked", score: 0, isPremium: true },
];

export default function LearnPage() {
  const { user, isLoading } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (isLoading) return <PageLoader />;

  const filteredLessons = selectedCategory === "all" ? DEMO_LESSONS : DEMO_LESSONS.filter((l) => l.category === selectedCategory);
  const completedCount = DEMO_LESSONS.filter((l) => l.status === "completed").length;
  const totalCount = DEMO_LESSONS.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learn Grammar</h1>
          <p className="text-muted-foreground">Master English grammar step by step</p>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={(completedCount / totalCount) * 100} className="w-32 h-2" />
          <span className="text-sm text-muted-foreground">{completedCount}/{totalCount} completed</span>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {GRAMMAR_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredLessons.map((lesson) => {
              const isLocked = lesson.status === "locked";
              const isCompleted = lesson.status === "completed";
              const isPremium = lesson.isPremium && user?.subscriptionTier === "free";

              return (
                <Card key={lesson.id} className={cn("transition-all", isLocked && "opacity-60", !isLocked && "hover:shadow-md cursor-pointer")}>
                  <CardContent className="p-4">
                    <Link href={isLocked || isPremium ? "#" : `/learn/${lesson.id}`} className={cn(isLocked || isPremium ? "pointer-events-none" : "")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isCompleted ? "bg-primary text-primary-foreground" : isLocked ? "bg-muted" : "bg-primary/10")}>
                          {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Play className="h-5 w-5 text-primary" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{lesson.title}</h3>
                            {isPremium && <Crown className="h-4 w-4 text-secondary" />}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="capitalize">{lesson.difficulty}</span>
                            <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{lesson.xp} XP</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isCompleted && <Badge variant="success">{lesson.score}%</Badge>}
                          {!isLocked && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
