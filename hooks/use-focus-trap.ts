/**
 * @fileoverview Focus Trap Hook
 * @description Traps focus within a container for modal accessibility
 *
 * Accessibility features:
 * - Traps focus within container
 * - Handles Tab and Shift+Tab navigation
 * - Restores focus on unmount
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  enabled?: boolean;
  /** Whether to auto-focus the first focusable element */
  autoFocus?: boolean;
  /** Whether to restore focus on unmount */
  restoreFocus?: boolean;
  /** Callback when escape is pressed */
  onEscape?: () => void;
}

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "area[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
].join(",");

/**
 * Hook to trap focus within a container element
 *
 * @example
 * function Modal({ isOpen, onClose, children }) {
 *   const containerRef = useFocusTrap<HTMLDivElement>({
 *     enabled: isOpen,
 *     onEscape: onClose,
 *   });
 *
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       {children}
 *     </div>
 *   );
 * }
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
) {
  const {
    enabled = true,
    autoFocus = true,
    restoreFocus = true,
    onEscape,
  } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS);
    return Array.from(elements).filter((el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !el.hasAttribute("hidden")
      );
    }) as HTMLElement[];
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return;

      // Handle Escape key
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key
      if (event.key === "Tab") {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab on first element -> go to last
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab on last element -> go to first
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [enabled, onEscape, getFocusableElements]
  );

  // Set up focus trap
  useEffect(() => {
    if (!enabled) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Auto-focus the first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Small delay to ensure the container is fully rendered
        requestAnimationFrame(() => {
          focusableElements[0].focus();
        });
      }
    }

    // Add keyboard event listener
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus to the previous element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, autoFocus, restoreFocus, handleKeyDown, getFocusableElements]);

  return containerRef;
}

export default useFocusTrap;
