/**
 * @fileoverview Skip Link Component
 * @description Provides keyboard users ability to skip navigation
 *
 * Accessibility features:
 * - Hidden by default, visible on focus
 * - Allows keyboard users to jump to main content
 * - WCAG 2.1 AA compliant
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
 */

"use client";

import { cn } from "@/lib/utils";

interface SkipLinkProps {
  targetId?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Skip link for keyboard navigation
 * Should be placed at the very top of the page
 *
 * @example
 * <SkipLink targetId="main-content">Skip to main content</SkipLink>
 */
export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);

    if (target) {
      // Set tabindex temporarily to make it focusable
      target.setAttribute("tabindex", "-1");
      target.focus();

      // Scroll into view
      target.scrollIntoView({ behavior: "smooth" });

      // Remove tabindex after focus (optional)
      target.addEventListener(
        "blur",
        () => {
          target.removeAttribute("tabindex");
        },
        { once: true }
      );
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Hidden by default
        "sr-only",
        // Visible on focus
        "focus:not-sr-only",
        "focus:fixed focus:left-4 focus:top-4 focus:z-[9999]",
        "focus:rounded-md focus:bg-emerald-600 focus:px-4 focus:py-2",
        "focus:text-white focus:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Skip link target wrapper
 * Wraps main content to be the skip link target
 */
interface SkipLinkTargetProps {
  id?: string;
  children: React.ReactNode;
  as?: "main" | "div" | "section";
  className?: string;
}

export function SkipLinkTarget({
  id = "main-content",
  children,
  as: Component = "main",
  className,
}: SkipLinkTargetProps) {
  return (
    <Component
      id={id}
      className={cn("outline-none", className)}
      // aria-label for screen readers
      aria-label="Main content"
    >
      {children}
    </Component>
  );
}

export default SkipLink;
