/**
 * @fileoverview Tests for LoadingSpinner component
 * @description Unit tests for loading spinner and related components
 */

import { render, screen } from "@/lib/test-utils";
import {
  LoadingSpinner,
  PageLoader,
  ButtonLoader,
} from "@/components/common/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render with default size", () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("h-8", "w-8"); // md size
  });

  it("should render small size", () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toHaveClass("h-4", "w-4");
  });

  it("should render large size", () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toHaveClass("h-12", "w-12");
  });

  it("should render text when provided", () => {
    render(<LoadingSpinner text="Loading data..." />);

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("should not render text when not provided", () => {
    render(<LoadingSpinner />);

    expect(screen.queryByText("Loading data...")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<LoadingSpinner className="custom-class" />);

    const container = document.querySelector(".custom-class");
    expect(container).toBeInTheDocument();
  });
});

describe("PageLoader", () => {
  it("should render with loading text", () => {
    render(<PageLoader />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render large spinner", () => {
    render(<PageLoader />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toHaveClass("h-12", "w-12");
  });

  it("should have minimum height", () => {
    render(<PageLoader />);

    const container = document.querySelector(".min-h-\\[50vh\\]");
    expect(container).toBeInTheDocument();
  });
});

describe("ButtonLoader", () => {
  it("should render spinner", () => {
    render(<ButtonLoader />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should have small size for buttons", () => {
    render(<ButtonLoader />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toHaveClass("h-4", "w-4");
  });
});
