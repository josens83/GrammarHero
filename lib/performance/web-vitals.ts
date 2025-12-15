/**
 * @fileoverview Web Vitals Monitoring
 * @description Monitors Core Web Vitals for performance tracking
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * - INP (Interaction to Next Paint)
 *
 * @see https://web.dev/articles/vitals
 */

type MetricName = "LCP" | "FID" | "CLS" | "TTFB" | "FCP" | "INP";

interface WebVitalsMetric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

type ReportHandler = (metric: WebVitalsMetric) => void;

/**
 * Thresholds for Core Web Vitals ratings
 * Based on Google's recommendations
 */
const THRESHOLDS: Record<MetricName, [number, number]> = {
  LCP: [2500, 4000], // good < 2.5s, poor > 4s
  FID: [100, 300], // good < 100ms, poor > 300ms
  CLS: [0.1, 0.25], // good < 0.1, poor > 0.25
  TTFB: [800, 1800], // good < 800ms, poor > 1.8s
  FCP: [1800, 3000], // good < 1.8s, poor > 3s
  INP: [200, 500], // good < 200ms, poor > 500ms
};

/**
 * Get rating for a metric value
 */
function getRating(
  name: MetricName,
  value: number
): "good" | "needs-improvement" | "poor" {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

/**
 * Generate unique ID for metric
 */
function generateId(): string {
  return `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Report a web vital metric
 */
function reportMetric(
  name: MetricName,
  value: number,
  delta: number,
  handler: ReportHandler
): void {
  const metric: WebVitalsMetric = {
    name,
    value,
    rating: getRating(name, value),
    delta,
    id: generateId(),
  };

  handler(metric);
}

/**
 * Observe Largest Contentful Paint (LCP)
 */
export function observeLCP(onReport: ReportHandler): void {
  if (typeof window === "undefined") return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        const value = lastEntry.startTime;
        reportMetric("LCP", value, value, onReport);
      }
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Observe First Input Delay (FID)
 */
export function observeFID(onReport: ReportHandler): void {
  if (typeof window === "undefined") return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming;

      if (firstEntry) {
        const value = firstEntry.processingStart - firstEntry.startTime;
        reportMetric("FID", value, value, onReport);
      }
    });

    observer.observe({ type: "first-input", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Observe Cumulative Layout Shift (CLS)
 */
export function observeCLS(onReport: ReportHandler): void {
  if (typeof window === "undefined") return;

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as (PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
      })[];

      for (const entry of entries) {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0] as
            | (PerformanceEntry & { value: number })
            | undefined;
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1] as
            | (PerformanceEntry & { value: number })
            | undefined;

          // If the entry occurred within 1 second of the previous entry and
          // less than 5 seconds after the first entry, include it in the
          // current session. Otherwise, start a new session.
          if (
            sessionValue &&
            lastSessionEntry &&
            firstSessionEntry &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          // Update CLS if this session is larger
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            reportMetric("CLS", clsValue, entry.value, onReport);
          }
        }
      }
    });

    observer.observe({ type: "layout-shift", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Observe Time to First Byte (TTFB)
 */
export function observeTTFB(onReport: ReportHandler): void {
  if (typeof window === "undefined") return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const navigationEntry = entries[0] as PerformanceNavigationTiming;

      if (navigationEntry) {
        const value = navigationEntry.responseStart - navigationEntry.requestStart;
        reportMetric("TTFB", value, value, onReport);
      }
    });

    observer.observe({ type: "navigation", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Observe First Contentful Paint (FCP)
 */
export function observeFCP(onReport: ReportHandler): void {
  if (typeof window === "undefined") return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint"
      );

      if (fcpEntry) {
        const value = fcpEntry.startTime;
        reportMetric("FCP", value, value, onReport);
      }
    });

    observer.observe({ type: "paint", buffered: true });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Report all Core Web Vitals
 * @param onReport - Handler to receive metrics
 */
export function reportWebVitals(onReport: ReportHandler): void {
  observeLCP(onReport);
  observeFID(onReport);
  observeCLS(onReport);
  observeTTFB(onReport);
  observeFCP(onReport);
}

/**
 * Log Web Vitals to console (for development)
 */
export function logWebVitals(): void {
  reportWebVitals((metric) => {
    const color =
      metric.rating === "good"
        ? "green"
        : metric.rating === "needs-improvement"
        ? "orange"
        : "red";

    console.log(
      `%c${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  });
}

/**
 * Send Web Vitals to analytics endpoint
 */
export function sendWebVitalsToAnalytics(
  endpoint: string,
  additionalData?: Record<string, unknown>
): void {
  reportWebVitals((metric) => {
    const body = JSON.stringify({
      ...metric,
      ...additionalData,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Use sendBeacon if available for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      fetch(endpoint, {
        method: "POST",
        body,
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Silently fail
      });
    }
  });
}
