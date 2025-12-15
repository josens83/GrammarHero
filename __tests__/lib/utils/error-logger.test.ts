/**
 * @fileoverview Tests for error logging utility
 * @description Unit tests for error logging and categorization
 */

import {
  logError,
  logApiError,
  logAuthError,
  logPaymentError,
  logRenderError,
  getUserFriendlyMessage,
  ErrorCategory,
  ErrorSeverity,
} from "@/lib/utils/error-logger";

describe("logError", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "group").mockImplementation();
    jest.spyOn(console, "groupEnd").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should log error with category", () => {
    const error = new Error("Test error");
    logError(error, ErrorCategory.API);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should log error with context", () => {
    const error = new Error("Test error");
    logError(error, ErrorCategory.API, {
      userId: "user-123",
      action: "test-action",
    });

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should handle non-Error objects", () => {
    logError("String error", ErrorCategory.UNKNOWN);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should respect severity levels", () => {
    const error = new Error("Critical error");
    logError(error, ErrorCategory.PAYMENT, undefined, ErrorSeverity.CRITICAL);

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe("logApiError", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "group").mockImplementation();
    jest.spyOn(console, "groupEnd").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should log API error with endpoint info", () => {
    const error = new Error("API failed");
    logApiError(error, "/api/test", "POST", "user-123");

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe("logAuthError", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "group").mockImplementation();
    jest.spyOn(console, "groupEnd").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should log auth error with action", () => {
    const error = new Error("Auth failed");
    logAuthError(error, "login");

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe("logPaymentError", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "group").mockImplementation();
    jest.spyOn(console, "groupEnd").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should log payment error with metadata", () => {
    const error = new Error("Payment failed");
    logPaymentError(error, "user-123", { amount: 100 });

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe("logRenderError", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "group").mockImplementation();
    jest.spyOn(console, "groupEnd").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should log render error with component info", () => {
    const error = new Error("Render failed");
    logRenderError(error, { componentStack: "at Component" }, "TestComponent");

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe("getUserFriendlyMessage", () => {
  it("should return user-friendly message for network error", () => {
    const error = new Error("Network Error");
    const message = getUserFriendlyMessage(error);

    expect(message).toContain("internet connection");
  });

  it("should return user-friendly message for 401 error", () => {
    const error = new Error("Request failed with status code 401");
    const message = getUserFriendlyMessage(error);

    expect(message).toContain("session has expired");
  });

  it("should return user-friendly message for 403 error", () => {
    const error = new Error("Request failed with status code 403");
    const message = getUserFriendlyMessage(error);

    expect(message).toContain("permission");
  });

  it("should return user-friendly message for 404 error", () => {
    const error = new Error("Request failed with status code 404");
    const message = getUserFriendlyMessage(error);

    expect(message).toContain("not found");
  });

  it("should return user-friendly message for 429 error", () => {
    const error = new Error("Request failed with status code 429");
    const message = getUserFriendlyMessage(error);

    expect(message).toContain("Too many requests");
  });

  it("should return user-friendly message for 500 error", () => {
    const error = new Error("Request failed with status code 500");
    const message = getUserFriendlyMessage(error);

    expect(message).toContain("Something went wrong on our end");
  });

  it("should return fallback message for unknown error", () => {
    const error = new Error("Unknown error type");
    const message = getUserFriendlyMessage(error);

    expect(message).toBe("An unexpected error occurred. Please try again.");
  });

  it("should return custom fallback message", () => {
    const error = new Error("Unknown error");
    const customFallback = "Custom fallback message";
    const message = getUserFriendlyMessage(error, customFallback);

    expect(message).toBe(customFallback);
  });

  it("should handle non-Error objects", () => {
    const message = getUserFriendlyMessage("string error");

    expect(message).toBe("An unexpected error occurred. Please try again.");
  });
});
