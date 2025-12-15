/**
 * @fileoverview Jest Configuration
 * @description Configuration for Jest testing framework
 *
 * Features:
 * - Next.js support with SWC
 * - TypeScript support
 * - CSS/Module mocking
 * - Coverage reporting
 *
 * @see https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler
 */

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Test environment
  testEnvironment: "jsdom",

  // Setup files to run before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Module path aliases (must match tsconfig.json paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
  ],

  // Transform ignore patterns
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "stores/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],

  // Coverage thresholds (will be increased as tests are added)
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html"],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
};

// Export the config
module.exports = createJestConfig(customJestConfig);
