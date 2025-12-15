/**
 * @fileoverview Reusable Error Boundary Component
 * @description Catches JavaScript errors in child component tree
 *
 * Features:
 * - Graceful error recovery
 * - Error logging
 * - User-friendly error messages
 * - Retry functionality
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for catching render errors
 * @class ErrorBoundary
 * @extends Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: sendToErrorTracking(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              An error occurred while rendering this component.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-gray-100 p-4 text-left text-sm text-red-600 dark:bg-gray-800">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
