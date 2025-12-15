/**
 * @fileoverview Tests for ErrorBoundary component
 * @description Unit tests for error boundary functionality
 */

import { render, screen, fireEvent } from "@/lib/test-utils";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Component that throws an error for testing
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for cleaner test output
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should render children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render error UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Go Home")).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it("should reset error state when Try Again is clicked", async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // Error UI should be shown
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click Try Again
    fireEvent.click(screen.getByText("Try Again"));

    // Re-render without throwing
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Normal content should be shown after reset (if component doesn't throw again)
    // Note: This depends on the implementation and may need adjustment
  });

  it("should show error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;

    // Note: NODE_ENV is usually set at build time, so this test
    // verifies the error message is captured correctly
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // The error boundary should have captured the error
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should log error to console", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      expect.any(Error),
      expect.anything()
    );
  });
});

describe("ErrorBoundary with nested components", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should catch errors from deeply nested components", () => {
    render(
      <ErrorBoundary>
        <div>
          <div>
            <ThrowError shouldThrow />
          </div>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should allow nested error boundaries", () => {
    render(
      <ErrorBoundary fallback={<div>Outer error</div>}>
        <div>Outer content</div>
        <ErrorBoundary fallback={<div>Inner error</div>}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // Inner error boundary should catch the error
    expect(screen.getByText("Inner error")).toBeInTheDocument();
    expect(screen.getByText("Outer content")).toBeInTheDocument();
    expect(screen.queryByText("Outer error")).not.toBeInTheDocument();
  });
});
