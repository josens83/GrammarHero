/**
 * @fileoverview Intersection Observer Hook
 * @description Observes element visibility for lazy loading and animations
 *
 * Use cases:
 * - Lazy load images and components
 * - Trigger animations when in view
 * - Infinite scroll
 * - Track element visibility for analytics
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionObserverOptions {
  /** Root element for intersection */
  root?: Element | null;
  /** Margin around the root */
  rootMargin?: string;
  /** Visibility threshold (0-1 or array) */
  threshold?: number | number[];
  /** Only trigger once */
  triggerOnce?: boolean;
  /** Callback when intersection changes */
  onChange?: (entry: IntersectionObserverEntry) => void;
  /** Whether the observer is enabled */
  enabled?: boolean;
}

interface UseIntersectionObserverReturn<T extends HTMLElement> {
  /** Ref to attach to the target element */
  ref: React.RefObject<T>;
  /** Whether the element is currently intersecting */
  isIntersecting: boolean;
  /** The intersection entry */
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook to observe element intersection with viewport
 *
 * @example
 * function LazyImage({ src, alt }) {
 *   const { ref, isIntersecting } = useIntersectionObserver<HTMLImageElement>({
 *     triggerOnce: true,
 *     rootMargin: '200px',
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       {isIntersecting ? (
 *         <img src={src} alt={alt} />
 *       ) : (
 *         <div className="placeholder" />
 *       )}
 *     </div>
 *   );
 * }
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn<T> {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    triggerOnce = false,
    onChange,
    enabled = true,
  } = options;

  const elementRef = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasTriggeredRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // Skip if already triggered and triggerOnce is true
      if (triggerOnce && hasTriggeredRef.current) return;

      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);
      onChange?.(entry);

      if (entry.isIntersecting && triggerOnce) {
        hasTriggeredRef.current = true;
      }
    },
    [triggerOnce, onChange]
  );

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !enabled) return;

    // Skip if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggeredRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, enabled, handleIntersection]);

  return {
    ref: elementRef,
    isIntersecting,
    entry,
  };
}

/**
 * Hook for infinite scroll functionality
 *
 * @example
 * function InfiniteList({ loadMore, hasMore }) {
 *   const { ref } = useInfiniteScroll({
 *     onLoadMore: loadMore,
 *     enabled: hasMore,
 *   });
 *
 *   return (
 *     <div>
 *       {items.map(item => <Item key={item.id} />)}
 *       <div ref={ref}>Loading more...</div>
 *     </div>
 *   );
 * }
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLElement>(options: {
  /** Callback when sentinel enters viewport */
  onLoadMore: () => void;
  /** Whether more items can be loaded */
  enabled?: boolean;
  /** Distance from viewport to trigger load */
  rootMargin?: string;
}) {
  const { onLoadMore, enabled = true, rootMargin = "200px" } = options;
  const loadMoreRef = useRef(onLoadMore);

  // Keep ref updated
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const { ref, isIntersecting } = useIntersectionObserver<T>({
    rootMargin,
    enabled,
    threshold: 0,
  });

  useEffect(() => {
    if (isIntersecting && enabled) {
      loadMoreRef.current();
    }
  }, [isIntersecting, enabled]);

  return { ref, isLoading: isIntersecting && enabled };
}

export default useIntersectionObserver;
