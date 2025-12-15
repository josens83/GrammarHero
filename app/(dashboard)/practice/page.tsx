/**
 * @fileoverview Practice Page
 * @description AI-powered grammar checking with real API integration
 */

"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLoader, ButtonLoader } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/hooks/use-sound";
import {
  PenTool,
  Sparkles,
  Crown,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RefreshCw,
  Copy,
  History,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GrammarIssue {
  original: string;
  correction: string;
  explanation: string;
  type: string;
  severity: "error" | "warning" | "suggestion";
}

interface CheckResult {
  issues: GrammarIssue[];
  score: number;
  correctedText: string;
  summary: string;
}

// Practice prompts for users
const PRACTICE_PROMPTS = [
  { title: "Daily Routine", prompt: "Describe your typical day from morning to evening." },
  { title: "Favorite Hobby", prompt: "Write about your favorite hobby and why you enjoy it." },
  { title: "Travel Experience", prompt: "Describe a memorable trip or vacation you have taken." },
  { title: "Future Goals", prompt: "What do you want to achieve in the next five years?" },
  { title: "Book Review", prompt: "Write about a book you recently read and what you thought of it." },
  { title: "Technology", prompt: "How has technology changed your daily life?" },
];

export default function PracticePage() {
  const { user, isLoading } = useUser();
  const { toast } = useToast();
  const { playSound } = useSound();

  const [text, setText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [history, setHistory] = useState<{ text: string; score: number; date: Date }[]>([]);

  if (isLoading) return <PageLoader />;

  const isPro = user?.subscriptionTier !== "free";
  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const maxCharacters = isPro ? 5000 : 500;

  const handleCheck = async () => {
    if (!text.trim()) return;
    if (!isPro && characterCount > maxCharacters) {
      toast({
        title: "Character limit exceeded",
        description: "Upgrade to Pro for longer texts.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setResult(null);

    try {
      const response = await fetch("/api/ai/check-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to check grammar");
      }

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        playSound(data.data.score >= 80 ? "correct" : "incorrect");

        // Add to history
        setHistory((prev) => [
          { text: text.slice(0, 50) + "...", score: data.data.score, date: new Date() },
          ...prev.slice(0, 4),
        ]);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Grammar check error:", error);
      toast({
        title: "Error",
        description: "Failed to check grammar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setText("");
    setResult(null);
  };

  const handleCopyCorrection = () => {
    if (result?.correctedText) {
      navigator.clipboard.writeText(result.correctedText);
      toast({
        title: "Copied!",
        description: "Corrected text copied to clipboard.",
      });
    }
  };

  const handleUsePrompt = (prompt: string) => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to use practice prompts.",
      });
      return;
    }
    setText(prompt + "\n\n");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200";
      case "suggestion":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PenTool className="h-8 w-8 text-primary" />
          Practice Writing
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered feedback on your grammar and writing
        </p>
      </div>

      {/* Pro Upgrade Banner */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-secondary" />
              <div>
                <p className="font-semibold">Upgrade to Pro</p>
                <p className="text-sm text-muted-foreground">
                  Get unlimited AI grammar checks and longer text support
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Grammar Check
          </CardTitle>
          <CardDescription>
            Write or paste your text below to check for grammar errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Write or paste your text here to check for grammar errors..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] pb-8"
              maxLength={maxCharacters}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {characterCount}/{maxCharacters} characters • {wordCount} words
            </div>
          </div>

          {!isPro && characterCount > maxCharacters * 0.8 && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              Approaching character limit. Upgrade for more.
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleCheck}
              disabled={!text.trim() || isChecking || characterCount > maxCharacters}
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <ButtonLoader /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Check Grammar
                </>
              )}
            </Button>
            {(text || result) && (
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Results</span>
              <Badge
                variant={
                  result.score >= 80
                    ? "success"
                    : result.score >= 60
                    ? "warning"
                    : "destructive"
                }
                className="text-lg px-4 py-1"
              >
                {result.score}% Score
              </Badge>
            </CardTitle>
            {result.summary && (
              <CardDescription>{result.summary}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Grammar Score</span>
                <span className="font-medium">{result.score}%</span>
              </div>
              <Progress
                value={result.score}
                className={cn(
                  "h-3",
                  result.score >= 80
                    ? "[&>div]:bg-green-500"
                    : result.score >= 60
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-red-500"
                )}
              />
            </div>

            {/* Issues List */}
            {result.issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">Excellent! No grammar issues found.</p>
                <p className="text-sm text-muted-foreground">
                  Your writing is grammatically correct.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  {result.issues.length} Issue{result.issues.length !== 1 ? "s" : ""} Found
                </h3>

                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 border rounded-lg space-y-3",
                      getSeverityColor(issue.severity)
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{issue.type}</Badge>
                      <Badge
                        variant={
                          issue.severity === "error"
                            ? "destructive"
                            : issue.severity === "warning"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="line-through text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                        {issue.original}
                      </span>
                      <span className="text-primary">→</span>
                      <span className="text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded font-medium">
                        {issue.correction}
                      </span>
                    </div>
                    <p className="text-sm flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                      {issue.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Corrected Text */}
            {result.correctedText && result.issues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Corrected Version</h3>
                  <Button variant="ghost" size="sm" onClick={handleCopyCorrection}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
                  <p className="whitespace-pre-wrap">{result.correctedText}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Practice Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Practice Prompts
          </CardTitle>
          <CardDescription>
            Need inspiration? Try one of these writing prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {PRACTICE_PROMPTS.map((item, i) => (
              <Button
                key={i}
                variant="outline"
                className="justify-start h-auto py-3 px-4 text-left"
                onClick={() => handleUsePrompt(item.prompt)}
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.prompt}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm truncate flex-1">{item.text}</span>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge
                      variant={
                        item.score >= 80
                          ? "success"
                          : item.score >= 60
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {item.score}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tips for Better Writing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              Keep sentences clear and concise - avoid run-on sentences
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              Check subject-verb agreement, especially with third person singular
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              Use articles (a, an, the) correctly before nouns
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              Maintain consistent verb tenses throughout your writing
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
