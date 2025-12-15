/**
 * @fileoverview Global Error Handler
 * @description Handles errors at the root layout level
 *
 * This is a fallback error UI for the entire application.
 * It's rendered when an error occurs in the root layout itself.
 * Must include its own <html> and <body> tags.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */

"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the critical error
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-gray-900">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-white">
          <div className="text-center">
            {/* Simple SVG icon - no dependencies */}
            <svg
              className="mx-auto h-20 w-20 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>

            <h1 className="mt-6 text-4xl font-bold">Critical Error</h1>

            <p className="mt-4 max-w-md text-lg text-gray-400">
              A critical error occurred and the application couldn&apos;t recover.
              Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 max-w-lg rounded-lg bg-red-900/30 p-4 text-left">
                <p className="text-sm font-medium text-red-400">
                  Error (Development Only):
                </p>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-red-300">
                  {error.message}
                </pre>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>

              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go Home
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Error ID: {error.digest || "Unknown"}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
