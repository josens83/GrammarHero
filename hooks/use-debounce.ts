/**
 * @fileoverview Debounce Hook
 * @description Debounces values and callbacks for performance optimization
 *
 * Use cases:
 * - Search input (debounce API calls)
 * - Window resize handlers
 * - Scroll handlers
 * - Form validation
 *
 * @see https://lodash.com/docs/4.17.15#debounce
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook to debounce a value
 *
 * @example
 * function SearchInput() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       searchAPI(debouncedQuery);
 *     }
 *   }, [debouncedQuery]);
 *
 *   return <input value={query} onChange={e => setQuery(e.target.value)} />;
 * }
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to create a debounced callback function
 *
 * @example
 * function SearchComponent() {
 *   const handleSearch = useDebouncedCallback(
 *     (query: string) => {
 *       searchAPI(query);
 *     },
 *     300
 *   );
 *
 *   return <input onChange={e => handleSearch(e.target.value)} />;
 * }
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Hook to throttle a callback function
 * Unlike debounce, throttle ensures the function is called at most once per interval
 *
 * @example
 * function ScrollHandler() {
 *   const handleScroll = useThrottledCallback(
 *     () => {
 *       updateScrollPosition();
 *     },
 *     100
 *   );
 *
 *   useEffect(() => {
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, [handleScroll]);
 * }
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      } else {
        // Schedule a trailing call
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callbackRef.current(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [delay]
  );
}

export default useDebounce;
