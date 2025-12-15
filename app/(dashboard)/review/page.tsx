/**
 * @fileoverview Review Page
 * @description Spaced repetition review session page with real API integration
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Clock,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lightbulb,
  Calendar,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { useUser } from "@/hooks/useUser";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

type ReviewPhase = "overview" | "session" | "complete";

interface ReviewItem {
  id: string;
  lesson_id: string;
  exercise_id: string;
  question: string;
  correct_answer: string;
  category: string;
  difficulty: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
}

function getItemStrength(item: ReviewItem): "new" | "learning" | "strong" | "mastered" {
  if (item.repetitions === 0) return "new";
  if (item.interval_days < 7) return "learning";
  if (item.interval_days < 30) return "strong";
  return "mastered";
}

export default function ReviewPage() {
  const { user, isLoading } = useUser();
  const { playSound } = useSound();

  const [phase, setPhase] = useState<ReviewPhase>("overview");
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [sessionResults, setSessionResults] = useState<{
    correct: number;
    incorrect: number;
    xpEarned: number;
  }>({ correct: 0, incorrect: 0, xpEarned: 0 });

  // Fetch review items
  useEffect(() => {
    const fetchReviewItems = async () => {
      try {
        const res = await fetch("/api/review?due=true&limit=50");
        if (res.ok) {
          const data = await res.json();
          setReviewItems(data.data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch review items:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchReviewItems();
    }
  }, [user]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekDate = weekFromNow.toISOString().split("T")[0];

    const dueToday = reviewItems.filter((item) => item.next_review_date <= today).length;
    const dueThisWeek = reviewItems.filter((item) => item.next_review_date <= weekDate).length;
    const learned = reviewItems.filter((item) => item.repetitions > 0).length;
    const mastered = reviewItems.filter((item) => item.interval_days >= 30).length;

    return { dueToday, dueThisWeek, learned, mastered };
  }, [reviewItems]);

  // Due items
  const dueItems = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return reviewItems.filter((item) => item.next_review_date <= today);
  }, [reviewItems]);

  // Current item
  const currentItem = dueItems[currentIndex];

  // Start review session
  const handleStartSession = () => {
    if (dueItems.length === 0) return;
    setPhase("session");
    setSessionStartTime(new Date());
    setQuestionStartTime(new Date());
    setCurrentIndex(0);
    setSessionResults({ correct: 0, incorrect: 0, xpEarned: 0 });
  };

  // Calculate quality based on performance
  const calculateQuality = (correct: boolean, responseTime: number, usedHint: boolean): number => {
    if (!correct) return usedHint ? 0 : 1;
    if (usedHint) return 3;
    if (responseTime < 3000) return 5; // Fast and correct
    if (responseTime < 8000) return 4; // Medium speed
    return 3; // Slow but correct
  };

  // Submit answer
  const handleSubmit = async () => {
    if (!currentItem || !questionStartTime) return;

    const responseTime = Date.now() - questionStartTime.getTime();
    const correct =
      userAnswer.toLowerCase().trim() ===
      currentItem.correct_answer.toLowerCase().trim();
    const quality = calculateQuality(correct, responseTime, showHint);

    // Update the review item via API
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          itemId: currentItem.id,
          quality,
        }),
      });
    } catch (error) {
      console.error("Failed to update review item:", error);
    }

    // Update session results
    const xp = correct ? 5 : 0;
    setSessionResults((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      xpEarned: prev.xpEarned + xp,
    }));

    // Play sound
    playSound(correct ? "correct" : "incorrect");

    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  // Next question
  const handleNext = () => {
    if (currentIndex + 1 >= dueItems.length) {
      playSound("complete");
      setPhase("complete");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setIsSubmitted(false);
      setShowHint(false);
      setQuestionStartTime(new Date());
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isSubmitted && userAnswer.trim()) {
        handleSubmit();
      } else if (isSubmitted) {
        handleNext();
      }
    }
  };

  if (isLoading || isLoadingData) return <PageLoader />;
  if (!user) return <PageLoader />;

  return (
    <div className="p-6 space-y-6">
      <AnimatePresence mode="wait">
        {/* Overview Phase */}
        {phase === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Brain className="h-8 w-8 text-primary" />
                  Smart Review
                </h1>
                <p className="text-muted-foreground mt-1">
                  Strengthen your memory with spaced repetition
                </p>
              </div>
              {dueItems.length > 0 && (
                <Button size="lg" onClick={handleStartSession}>
                  Start Review
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-500/10">
                      <Clock className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.dueToday}</p>
                      <p className="text-xs text-muted-foreground">Due Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.dueThisWeek}</p>
                      <p className="text-xs text-muted-foreground">This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.learned}</p>
                      <p className="text-xs text-muted-foreground">Learned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-500/10">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.mastered}</p>
                      <p className="text-xs text-muted-foreground">Mastered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Review Items Preview */}
            {dueItems.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Items to Review ({dueItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dueItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{item.question}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.category || "Grammar"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            getItemStrength(item) === "mastered"
                              ? "success"
                              : getItemStrength(item) === "strong"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {getItemStrength(item)}
                        </Badge>
                      </div>
                    ))}
                    {dueItems.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        +{dueItems.length - 5} more items
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">All caught up!</h2>
                  <p className="text-muted-foreground mb-4">
                    {reviewItems.length === 0
                      ? "Complete lessons to add items to your review queue!"
                      : "No items due for review today. Check back later!"}
                  </p>
                  <Button asChild>
                    <Link href="/learn">Go to Lessons</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Session Phase */}
        {phase === "session" && currentItem && (
          <motion.div
            key="session"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Question {currentIndex + 1} of {dueItems.length}
                </span>
                <span className="text-muted-foreground">
                  {currentItem.category || "Grammar"}
                </span>
              </div>
              <Progress
                value={((currentIndex + (isSubmitted ? 1 : 0)) / dueItems.length) * 100}
                className="h-2"
              />
            </div>

            {/* Question Card */}
            <Card className="p-8">
              <div className="text-center space-y-6">
                <h2 className="text-xl font-medium text-muted-foreground">
                  Fill in the blank
                </h2>

                <p className="text-2xl font-medium">{currentItem.question}</p>

                {/* Input */}
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => !isSubmitted && setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitted}
                  className={cn(
                    "w-48 text-center text-xl p-3 border-2 rounded-lg outline-none transition-colors",
                    isSubmitted && isCorrect && "border-green-500 bg-green-50",
                    isSubmitted && !isCorrect && "border-red-500 bg-red-50",
                    !isSubmitted && "border-primary focus:border-primary"
                  )}
                  placeholder="..."
                  autoFocus
                />

                {/* Correct answer display */}
                {isSubmitted && !isCorrect && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-muted-foreground"
                  >
                    Correct answer:{" "}
                    <span className="font-bold text-green-600">
                      {currentItem.correct_answer}
                    </span>
                  </motion.p>
                )}

                {/* Result indicator */}
                {isSubmitted && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                      isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Correct! +5 XP</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        <span>Keep practicing!</span>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Hint */}
                {!isSubmitted && !showHint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="text-muted-foreground"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Need a hint?
                  </Button>
                )}

                {showHint && !isSubmitted && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg inline-block"
                  >
                    First letter: {currentItem.correct_answer[0]}
                  </motion.p>
                )}
              </div>
            </Card>

            {/* Action Button */}
            <div className="flex justify-center">
              {!isSubmitted ? (
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="min-w-[200px]"
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className={cn(
                    "min-w-[200px]",
                    isCorrect && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {currentIndex + 1 >= dueItems.length
                    ? "Complete"
                    : "Continue"}
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Complete Phase */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center"
            >
              <Brain className="h-12 w-12 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold">Review Complete!</h1>
            <p className="text-muted-foreground">
              Great job strengthening your memory!
            </p>

            {/* Stats */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {sessionResults.correct}
                    </p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-500">
                      {sessionResults.incorrect}
                    </p>
                    <p className="text-xs text-muted-foreground">To Review</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      +{sessionResults.xpEarned}
                    </p>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                  </div>
                </div>

                {(sessionResults.correct + sessionResults.incorrect) > 0 && (
                  <>
                    <Progress
                      value={
                        (sessionResults.correct /
                          (sessionResults.correct + sessionResults.incorrect)) *
                        100
                      }
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(
                        (sessionResults.correct /
                          (sessionResults.correct + sessionResults.incorrect)) *
                          100
                      )}
                      % accuracy
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setPhase("overview");
                  setCurrentIndex(0);
                  setUserAnswer("");
                  setIsSubmitted(false);
                  setShowHint(false);
                }}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Review More
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/learn">Continue Learning</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
