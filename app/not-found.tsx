/**
 * @fileoverview 404 Not Found Page
 * @description Custom 404 page for invalid routes
 *
 * Features:
 * - User-friendly message
 * - Navigation options
 * - Search suggestions
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import Link from "next/link";
import { Home, ArrowLeft, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="relative">
          <span className="text-[10rem] font-bold leading-none text-gray-200 dark:text-gray-800">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-24 w-24 text-emerald-500" />
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h1>

        <p className="mt-3 max-w-md text-gray-600 dark:text-gray-400">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track with your learning journey.
        </p>

        {/* Quick Links */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link href="/learn">
              <BookOpen className="h-4 w-4" />
              Start Learning
            </Link>
          </Button>

          <Button variant="ghost" size="lg" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Popular Pages
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/learn"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Lessons
            </Link>
            <Link
              href="/practice"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Practice
            </Link>
            <Link
              href="/leaderboard"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Leaderboard
            </Link>
            <Link
              href="/pricing"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
