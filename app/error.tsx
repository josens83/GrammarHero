/**
 * @fileoverview App-level Error Page
 * @description Handles errors at the app level (within root layout)
 *
 * This component is rendered when an error occurs in a route segment
 * or its children. It provides a user-friendly error message and
 * recovery options.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error for debugging
    console.error("App Error:", error);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: sendToErrorTracking(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Oops! Something went wrong
        </h1>

        <p className="mt-3 max-w-md text-gray-600 dark:text-gray-400">
          We encountered an unexpected error. Don&apos;t worry, your progress is saved.
          You can try again or return to the dashboard.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 max-w-lg rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Error Details (Development Only):
            </p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-red-700 dark:text-red-400">
              {error.message}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Button variant="ghost" size="lg" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          If this problem persists, please{" "}
          <a
            href="mailto:support@grammarhero.com"
            className="text-emerald-600 hover:underline dark:text-emerald-400"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
