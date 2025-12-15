/**
 * @fileoverview Multiple Choice Exercise Component
 * @description Interactive multiple choice exercise with answer feedback
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MultipleChoiceProps {
  question: string;
  options: string[];
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

export function MultipleChoice({
  question,
  options,
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
}: MultipleChoiceProps) {
  const [showHint, setShowHint] = useState(false);

  // Reset hint when question changes
  useEffect(() => {
    setShowHint(false);
  }, [question]);

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose the correct answer</h2>
        <p className="text-lg text-muted-foreground">{question}</p>
      </div>

      {/* Hint */}
      {hint && !isSubmitted && (
        <div className="text-center">
          {showHint ? (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg inline-block"
            >
              💡 {hint}
            </motion.p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(true)}
              className="text-muted-foreground"
            >
              Need a hint?
            </Button>
          )}
        </div>
      )}

      {/* Options */}
      <div className="grid gap-3 max-w-lg mx-auto">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === correctAnswer;
          const showCorrect = isSubmitted && isCorrectOption;
          const showIncorrect = isSubmitted && isSelected && !isCorrectOption;

          return (
            <motion.button
              key={option}
              onClick={() => !isSubmitted && onSelect(option)}
              disabled={isSubmitted}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                "flex items-center justify-between",
                !isSubmitted && "hover:border-primary hover:bg-primary/5",
                isSelected && !isSubmitted && "border-primary bg-primary/10",
                showCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                showIncorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                isSubmitted && !isSelected && !isCorrectOption && "opacity-50"
              )}
              whileHover={!isSubmitted ? { scale: 1.02 } : {}}
              whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    isSelected && !isSubmitted && "bg-primary text-primary-foreground",
                    showCorrect && "bg-green-500 text-white",
                    showIncorrect && "bg-red-500 text-white",
                    !isSelected && !showCorrect && "bg-muted"
                  )}
                >
                  {showCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : showIncorrect ? (
                    <X className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="font-medium">{option}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

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
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            )}
          >
            <p className="text-sm font-medium mb-1">
              {isCorrect ? "🎉 Correct!" : "📚 Explanation:"}
            </p>
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
            disabled={!selectedAnswer}
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

export default MultipleChoice;
