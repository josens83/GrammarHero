/**
 * @fileoverview Test Utilities
 * @description Custom render functions and test helpers
 *
 * Features:
 * - Custom render with providers
 * - Mock data generators
 * - Common test utilities
 *
 * @example
 * import { render, screen, mockUser } from '@/lib/test-utils';
 * render(<MyComponent user={mockUser()} />);
 */

import React, { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ============================================================================
// Custom Render with Providers
// ============================================================================

/**
 * All providers wrapper for testing
 */
interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <>
      {/* Add providers here as needed (Theme, Auth, etc.) */}
      {children}
    </>
  );
}

/**
 * Custom render function with all providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

// ============================================================================
// Mock Data Generators
// ============================================================================

/**
 * Generate a mock user object
 */
export function mockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: "test-user-id",
    email: "test@example.com",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Generate a mock profile object
 */
export function mockProfile(overrides?: Partial<MockProfile>): MockProfile {
  return {
    id: "test-user-id",
    display_name: "Test User",
    username: "testuser",
    email: "test@example.com",
    xp: 1000,
    level: 5,
    hearts: 5,
    streak: 7,
    subscription_tier: "free",
    daily_goal: 10,
    lessons_completed: 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export interface MockProfile {
  id: string;
  display_name: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  hearts: number;
  streak: number;
  subscription_tier: "free" | "pro" | "premium";
  daily_goal: number;
  lessons_completed: number;
  created_at: string;
  updated_at: string;
}

/**
 * Generate a mock lesson object
 */
export function mockLesson(overrides?: Partial<MockLesson>): MockLesson {
  return {
    id: "test-lesson-id",
    title: "Test Lesson",
    description: "A test lesson description",
    category: "Grammar Basics",
    difficulty: "beginner",
    xp_reward: 10,
    exercises: [],
    ...overrides,
  };
}

export interface MockLesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xp_reward: number;
  exercises: MockExercise[];
}

/**
 * Generate a mock exercise object
 */
export function mockExercise(overrides?: Partial<MockExercise>): MockExercise {
  return {
    id: "test-exercise-id",
    type: "multiple_choice",
    question: "What is the correct form?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    explanation: "This is the correct answer because...",
    ...overrides,
  };
}

export interface MockExercise {
  id: string;
  type: "multiple_choice" | "fill_blank" | "sentence_correction";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

/**
 * Generate a mock grammar check result
 */
export function mockGrammarCheckResult(
  overrides?: Partial<MockGrammarCheckResult>
): MockGrammarCheckResult {
  return {
    score: 85,
    issues: [
      {
        original: "He go to school",
        correction: "He goes to school",
        explanation: "Subject-verb agreement: third person singular requires 's'",
        type: "Subject-Verb Agreement",
      },
    ],
    ...overrides,
  };
}

export interface MockGrammarCheckResult {
  score: number;
  issues: {
    original: string;
    correction: string;
    explanation: string;
    type: string;
  }[];
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock API response
 */
export function mockApiResponse<T>(data: T, success = true) {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : "An error occurred",
  };
}

/**
 * Create a mock fetch response
 */
export function mockFetchResponse<T>(data: T, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

// ============================================================================
// Re-exports
// ============================================================================

// Re-export everything from testing library
export * from "@testing-library/react";
export { userEvent };

// Export custom render as default render
export { customRender as render };
