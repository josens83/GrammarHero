/**
 * @fileoverview Error Logging Utility
 * @description Centralized error logging for the application
 *
 * Features:
 * - Development-friendly console logging
 * - Production error tracking integration point
 * - Error categorization
 * - Context preservation
 *
 * @example
 * import { logError, ErrorCategory } from '@/lib/utils/error-logger';
 * logError(error, ErrorCategory.API, { userId: '123' });
 */

/**
 * Error categories for better organization and filtering
 */
export enum ErrorCategory {
  API = "API",
  AUTH = "AUTH",
  PAYMENT = "PAYMENT",
  DATABASE = "DATABASE",
  VALIDATION = "VALIDATION",
  RENDER = "RENDER",
  NETWORK = "NETWORK",
  UNKNOWN = "UNKNOWN",
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error context for additional debugging information
 */
export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  route?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Structured error log entry
 */
interface ErrorLogEntry {
  timestamp: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context?: ErrorContext;
  environment: string;
}

/**
 * Log an error with context
 * @param error - The error to log
 * @param category - Error category
 * @param context - Additional context
 * @param severity - Error severity level
 */
export function logError(
  error: Error | unknown,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  context?: ErrorContext,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    category,
    severity,
    message: errorObj.message,
    stack: errorObj.stack,
    context,
    environment: process.env.NODE_ENV || "development",
  };

  // Always log to console in development
  if (process.env.NODE_ENV === "development") {
    console.group(`[${category}] Error`);
    console.error("Message:", logEntry.message);
    console.error("Severity:", logEntry.severity);
    if (logEntry.context) {
      console.error("Context:", logEntry.context);
    }
    if (logEntry.stack) {
      console.error("Stack:", logEntry.stack);
    }
    console.groupEnd();
  } else {
    // In production, send to error tracking service
    sendToErrorTrackingService(logEntry);
  }
}

/**
 * Send error to external tracking service
 * @param logEntry - Structured error log entry
 */
function sendToErrorTrackingService(logEntry: ErrorLogEntry): void {
  // TODO: Implement integration with error tracking service
  // Examples: Sentry, LogRocket, Bugsnag, DataDog
  //
  // Example Sentry integration:
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.captureException(new Error(logEntry.message), {
  //   tags: {
  //     category: logEntry.category,
  //     severity: logEntry.severity,
  //   },
  //   extra: logEntry.context,
  // });

  // For now, just log to console in production as well
  console.error("[Production Error]", JSON.stringify(logEntry));
}

/**
 * Log an API error with request context
 * @param error - The error
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param userId - User ID if authenticated
 */
export function logApiError(
  error: Error | unknown,
  endpoint: string,
  method: string,
  userId?: string
): void {
  logError(error, ErrorCategory.API, {
    route: endpoint,
    action: method,
    userId,
  });
}

/**
 * Log an authentication error
 * @param error - The error
 * @param action - Auth action (login, signup, etc.)
 */
export function logAuthError(error: Error | unknown, action: string): void {
  logError(error, ErrorCategory.AUTH, { action }, ErrorSeverity.HIGH);
}

/**
 * Log a payment error
 * @param error - The error
 * @param userId - User ID
 * @param metadata - Payment metadata
 */
export function logPaymentError(
  error: Error | unknown,
  userId: string,
  metadata?: Record<string, unknown>
): void {
  logError(
    error,
    ErrorCategory.PAYMENT,
    { userId, metadata },
    ErrorSeverity.CRITICAL
  );
}

/**
 * Log a render error from Error Boundary
 * @param error - The error
 * @param errorInfo - React error info
 * @param component - Component name if known
 */
export function logRenderError(
  error: Error,
  errorInfo?: { componentStack?: string },
  component?: string
): void {
  logError(
    error,
    ErrorCategory.RENDER,
    {
      component,
      metadata: { componentStack: errorInfo?.componentStack },
    },
    ErrorSeverity.HIGH
  );
}

/**
 * Create a user-friendly error message
 * @param error - The error
 * @param fallbackMessage - Fallback message if error is unknown
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(
  error: Error | unknown,
  fallbackMessage = "An unexpected error occurred. Please try again."
): string {
  if (error instanceof Error) {
    // Map known error messages to user-friendly versions
    const errorMap: Record<string, string> = {
      "Network Error": "Unable to connect to the server. Please check your internet connection.",
      "Request failed with status code 401": "Your session has expired. Please log in again.",
      "Request failed with status code 403": "You don't have permission to perform this action.",
      "Request failed with status code 404": "The requested resource was not found.",
      "Request failed with status code 429": "Too many requests. Please wait a moment and try again.",
      "Request failed with status code 500": "Something went wrong on our end. Please try again later.",
    };

    return errorMap[error.message] || fallbackMessage;
  }

  return fallbackMessage;
}
