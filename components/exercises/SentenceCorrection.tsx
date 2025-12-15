/**
 * @fileoverview Sentence Correction Exercise Component
 * @description Find and correct the error in the sentence
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Lightbulb, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SentenceCorrectionProps {
  sentence: string; // The sentence with error
  correctAnswer: string; // The corrected sentence
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

export function SentenceCorrection({
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
}: SentenceCorrectionProps) {
  const [showHint, setShowHint] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize with the original sentence
  useEffect(() => {
    if (!selectedAnswer) {
      onSelect(sentence);
    }
  }, [sentence, selectedAnswer, onSelect]);

  // Reset hint when question changes
  useEffect(() => {
    setShowHint(false);
    setIsEditing(false);
  }, [sentence]);

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  // Handle Enter key (with shift for newline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitted && selectedAnswer) {
        onSubmit();
      }
    }
  };

  // Check if sentence was changed
  const hasChanges = selectedAnswer !== sentence;

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Correct the sentence</h2>
        <p className="text-muted-foreground">Find and fix the grammar error</p>
      </div>

      {/* Original sentence (read-only) */}
      <div className="max-w-lg mx-auto">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Original sentence:
        </label>
        <div className="p-4 bg-muted/50 rounded-xl border border-dashed">
          <p className="text-lg">{sentence}</p>
        </div>
      </div>

      {/* Editable area */}
      <div className="max-w-lg mx-auto">
        <label className="text-sm font-medium mb-2 flex items-center justify-between">
          <span>Your correction:</span>
          {!isSubmitted && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEditing}
              className="text-primary"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </label>

        {isEditing || isSubmitted ? (
          <Textarea
            value={selectedAnswer || sentence}
            onChange={(e) => !isSubmitted && onSelect(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitted}
            className={cn(
              "text-lg min-h-[100px] resize-none",
              isSubmitted && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
              isSubmitted && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20"
            )}
            placeholder="Type the corrected sentence..."
            autoFocus
          />
        ) : (
          <div
            onClick={handleStartEditing}
            className="p-4 bg-background rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary transition-colors"
          >
            <p className="text-lg text-muted-foreground">
              Click to edit and correct the sentence...
            </p>
          </div>
        )}
      </div>

      {/* Correct answer display when wrong */}
      <AnimatePresence>
        {isSubmitted && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto"
          >
            <label className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 block">
              Correct answer:
            </label>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-lg text-green-700 dark:text-green-300">{correctAnswer}</p>
            </div>
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
                  <span className="font-medium">Perfect correction!</span>
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
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={!hasChanges}
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

export default SentenceCorrection;
