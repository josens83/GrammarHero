/**
 * @fileoverview Fill in the Blank Exercise Component
 * @description Type the missing word to complete the sentence
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FillInBlankProps {
  sentence: string; // Use ___ or [blank] to indicate the blank
  correctAnswer: string;
  hint?: string;
  explanation?: string;
  selectedAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  onSelect: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function FillInBlank({
  sentence,
  correctAnswer,
  hint,
  explanation,
  selectedAnswer,
  isSubmitted,
  isCorrect,
  onSelect,
  onSubmit,
  onNext,
  isLastQuestion,
}: FillInBlankProps) {
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [sentence]);

  // Reset hint when question changes
  useEffect(() => {
    setShowHint(false);
  }, [sentence]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isSubmitted && selectedAnswer) {
        onSubmit();
      } else if (isSubmitted) {
        onNext();
      }
    }
  };

  // Split sentence by blank marker
  const parts = sentence.split(/___|\[blank\]/);
  const hasBlank = parts.length > 1;

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Fill in the blank</h2>
        <p className="text-muted-foreground">Type the missing word</p>
      </div>

      {/* Sentence with blank */}
      <div className="text-center">
        <p className="text-xl leading-relaxed">
          {hasBlank ? (
            <>
              {parts[0]}
              <span className="inline-block mx-2 align-middle">
                <Input
                  ref={inputRef}
                  type="text"
                  value={selectedAnswer || ""}
                  onChange={(e) => !isSubmitted && onSelect(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitted}
                  className={cn(
                    "w-32 md:w-40 text-center font-medium inline-block",
                    isSubmitted && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                    isSubmitted && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20"
                  )}
                  placeholder="..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </span>
              {parts[1]}
            </>
          ) : (
            sentence
          )}
        </p>
      </div>

      {/* Correct answer display when wrong */}
      <AnimatePresence>
        {isSubmitted && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              Correct answer:{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                {correctAnswer}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {hint && !isSubmitted && (
        <div className="text-center">
          {showHint ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg"
            >
              <Lightbulb className="h-4 w-4" />
              {hint}
            </motion.div>
          ) : (
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
        </div>
      )}

      {/* Result indicator */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                isCorrect
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Correct!</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span className="font-medium">Not quite</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <AnimatePresence>
        {isSubmitted && explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "p-4 rounded-xl max-w-lg mx-auto",
              isCorrect
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            )}
          >
            <p className="text-sm font-medium mb-1">📚 Explanation:</p>
            <p className="text-sm text-muted-foreground">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        {!isSubmitted ? (
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={!selectedAnswer?.trim()}
            className="min-w-[200px]"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onNext}
            className={cn(
              "min-w-[200px]",
              isCorrect && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isLastQuestion ? "Complete Lesson" : "Continue"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FillInBlank;
