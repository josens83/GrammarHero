/**
 * @fileoverview Word Order Exercise Component
 * @description Drag and arrange words to form a correct sentence
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Check, X, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WordOrderProps {
  words: string[]; // Shuffled words
  correctAnswer: string; // Correct sentence
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

export function WordOrder({
  words: initialWords,
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
}: WordOrderProps) {
  const [showHint, setShowHint] = useState(false);
  const [orderedWords, setOrderedWords] = useState<string[]>(initialWords);

  // Initialize words
  useEffect(() => {
    setOrderedWords(initialWords);
    onSelect(initialWords.join(" "));
  }, [initialWords]);

  // Reset hint when question changes
  useEffect(() => {
    setShowHint(false);
  }, [initialWords]);

  // Update answer when order changes
  const handleReorder = (newOrder: string[]) => {
    if (!isSubmitted) {
      setOrderedWords(newOrder);
      onSelect(newOrder.join(" "));
    }
  };

  // Reset to original order
  const handleReset = () => {
    setOrderedWords(initialWords);
    onSelect(initialWords.join(" "));
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Arrange the words</h2>
        <p className="text-muted-foreground">
          Drag and drop to form a correct sentence
        </p>
      </div>

      {/* Word tiles */}
      <div className="flex justify-center">
        <div className="bg-muted/30 p-4 rounded-xl min-h-[80px] min-w-[300px] max-w-lg">
          <Reorder.Group
            axis="x"
            values={orderedWords}
            onReorder={handleReorder}
            className="flex flex-wrap gap-2 justify-center"
          >
            {orderedWords.map((word) => (
              <Reorder.Item
                key={word}
                value={word}
                className={cn(
                  "cursor-grab active:cursor-grabbing",
                  isSubmitted && "cursor-default"
                )}
                whileDrag={{ scale: 1.1, zIndex: 1 }}
              >
                <motion.div
                  className={cn(
                    "px-4 py-2 bg-background rounded-lg border-2 font-medium select-none",
                    "shadow-sm hover:shadow-md transition-shadow",
                    !isSubmitted && "border-primary/30 hover:border-primary",
                    isSubmitted && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                    isSubmitted && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20"
                  )}
                  layout
                >
                  {word}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* Current sentence preview */}
      <div className="text-center">
        <p className="text-lg text-muted-foreground italic">
          "{orderedWords.join(" ")}"
        </p>
      </div>

      {/* Reset button */}
      {!isSubmitted && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset order
          </Button>
        </div>
      )}

      {/* Correct answer display when wrong */}
      <AnimatePresence>
        {isSubmitted && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">Correct order:</p>
            <p className="text-lg font-medium text-green-600 dark:text-green-400">
              "{correctAnswer}"
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
                  <span className="font-medium">Perfect order!</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span className="font-medium">Not quite right</span>
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
          <Button size="lg" onClick={onSubmit} className="min-w-[200px]">
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

export default WordOrder;
