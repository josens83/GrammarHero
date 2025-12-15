/**
 * @fileoverview Prefetch Hook
 * @description Prefetches routes and data for improved performance
 *
 * Inspired by Duolingo's approach:
 * - Prefetch likely next pages on hover/focus
 * - Preload data that will be needed
 * - Use Intersection Observer for viewport-based prefetching
 *
 * @see https://web.dev/articles/link-prefetch
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UsePrefetchOptions {
  /** Delay before prefetching (ms) */
  delay?: number;
  /** Only prefetch when on fast connection */
  onlyOnFastConnection?: boolean;
}

/**
 * Hook to prefetch routes on hover/focus
 *
 * @example
 * function NavLink({ href, children }) {
 *   const { prefetchProps } = usePrefetch(href);
 *   return <Link href={href} {...prefetchProps}>{children}</Link>;
 * }
 */
export function usePrefetch(href: string, options: UsePrefetchOptions = {}) {
  const { delay = 100, onlyOnFastConnection = true } = options;
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef(false);

  const canPrefetch = useCallback(() => {
    // Check if already prefetched
    if (prefetchedRef.current) return false;

    // Check connection speed
    if (onlyOnFastConnection && typeof navigator !== "undefined") {
      const connection =
        (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } })
          .connection;
      if (connection) {
        // Don't prefetch on slow connections or if data saver is on
        if (connection.saveData) return false;
        if (
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g"
        ) {
          return false;
        }
      }
    }

    return true;
  }, [onlyOnFastConnection]);

  const prefetch = useCallback(() => {
    if (!canPrefetch()) return;

    timeoutRef.current = setTimeout(() => {
      router.prefetch(href);
      prefetchedRef.current = true;
    }, delay);
  }, [href, delay, router, canPrefetch]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelPrefetch();
    };
  }, [cancelPrefetch]);

  return {
    prefetch,
    cancelPrefetch,
    prefetchProps: {
      onMouseEnter: prefetch,
      onMouseLeave: cancelPrefetch,
      onFocus: prefetch,
      onBlur: cancelPrefetch,
    },
  };
}

/**
 * Hook to prefetch when element enters viewport
 *
 * @example
 * function ContentSection({ href }) {
 *   const ref = useViewportPrefetch<HTMLDivElement>(href);
 *   return <div ref={ref}>Content</div>;
 * }
 */
export function useViewportPrefetch<T extends HTMLElement = HTMLElement>(
  href: string,
  options: UsePrefetchOptions & { rootMargin?: string } = {}
) {
  const { rootMargin = "200px", onlyOnFastConnection = true } = options;
  const router = useRouter();
  const elementRef = useRef<T>(null);
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current || prefetchedRef.current) return;

    // Check connection speed
    if (onlyOnFastConnection && typeof navigator !== "undefined") {
      const connection =
        (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } })
          .connection;
      if (connection?.saveData) return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefetchedRef.current) {
            router.prefetch(href);
            prefetchedRef.current = true;
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [href, rootMargin, router, onlyOnFastConnection]);

  return elementRef;
}

export default usePrefetch;
