/**
 * @fileoverview Screen Reader Announcer Hook
 * @description Provides live region announcements for screen readers
 *
 * Accessibility features:
 * - ARIA live regions for dynamic content
 * - Polite and assertive announcement modes
 * - Automatic cleanup
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
 */

"use client";

import { useCallback, useEffect, useRef } from "react";

type AnnouncementPoliteness = "polite" | "assertive";

interface UseAnnouncerOptions {
  /** Default politeness level */
  defaultPoliteness?: AnnouncementPoliteness;
  /** Delay before clearing the announcement (ms) */
  clearDelay?: number;
}

/**
 * Hook to make announcements to screen readers
 *
 * @example
 * function QuizComponent() {
 *   const { announce } = useAnnouncer();
 *
 *   const handleCorrectAnswer = () => {
 *     announce("Correct! You earned 10 XP.");
 *   };
 *
 *   return <button onClick={handleCorrectAnswer}>Submit</button>;
 * }
 */
export function useAnnouncer(options: UseAnnouncerOptions = {}) {
  const { defaultPoliteness = "polite", clearDelay = 1000 } = options;

  const politeRegionRef = useRef<HTMLDivElement | null>(null);
  const assertiveRegionRef = useRef<HTMLDivElement | null>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create the live regions on mount
  useEffect(() => {
    // Check if regions already exist (for SSR/hydration)
    let politeRegion = document.getElementById(
      "sr-announcer-polite"
    ) as HTMLDivElement | null;
    let assertiveRegion = document.getElementById(
      "sr-announcer-assertive"
    ) as HTMLDivElement | null;

    // Create polite region if it doesn't exist
    if (!politeRegion) {
      politeRegion = document.createElement("div");
      politeRegion.id = "sr-announcer-polite";
      politeRegion.setAttribute("role", "status");
      politeRegion.setAttribute("aria-live", "polite");
      politeRegion.setAttribute("aria-atomic", "true");
      Object.assign(politeRegion.style, {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      });
      document.body.appendChild(politeRegion);
    }
    politeRegionRef.current = politeRegion;

    // Create assertive region if it doesn't exist
    if (!assertiveRegion) {
      assertiveRegion = document.createElement("div");
      assertiveRegion.id = "sr-announcer-assertive";
      assertiveRegion.setAttribute("role", "alert");
      assertiveRegion.setAttribute("aria-live", "assertive");
      assertiveRegion.setAttribute("aria-atomic", "true");
      Object.assign(assertiveRegion.style, {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      });
      document.body.appendChild(assertiveRegion);
    }
    assertiveRegionRef.current = assertiveRegion;

    return () => {
      // Clear any pending timeouts
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param politeness - The politeness level (polite or assertive)
   */
  const announce = useCallback(
    (
      message: string,
      politeness: AnnouncementPoliteness = defaultPoliteness
    ) => {
      const region =
        politeness === "assertive"
          ? assertiveRegionRef.current
          : politeRegionRef.current;

      if (!region) return;

      // Clear any existing timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }

      // Clear the region first (to trigger re-announcement of same message)
      region.textContent = "";

      // Small delay to ensure the change is detected
      requestAnimationFrame(() => {
        region.textContent = message;

        // Clear after delay
        clearTimeoutRef.current = setTimeout(() => {
          region.textContent = "";
        }, clearDelay);
      });
    },
    [defaultPoliteness, clearDelay]
  );

  /**
   * Announce with polite politeness level
   */
  const announcePolite = useCallback(
    (message: string) => {
      announce(message, "polite");
    },
    [announce]
  );

  /**
   * Announce with assertive politeness level
   */
  const announceAssertive = useCallback(
    (message: string) => {
      announce(message, "assertive");
    },
    [announce]
  );

  return {
    announce,
    announcePolite,
    announceAssertive,
  };
}

export default useAnnouncer;
