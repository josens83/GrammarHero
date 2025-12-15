/**
 * @fileoverview Accessibility Utility Functions
 * @description Helper functions for accessibility features
 *
 * Includes:
 * - Focus management
 * - ARIA attribute helpers
 * - Keyboard navigation utilities
 * - Color contrast utilities
 *
 * @see https://www.w3.org/WAI/ARIA/apg/
 */

/**
 * Check if user prefers reduced motion
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user is using keyboard navigation
 * Tracks whether the last interaction was via keyboard
 */
let isUsingKeyboard = false;

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      isUsingKeyboard = true;
    }
  });

  window.addEventListener("mousedown", () => {
    isUsingKeyboard = false;
  });
}

export function isKeyboardUser(): boolean {
  return isUsingKeyboard;
}

/**
 * Generate a unique ID for accessibility purposes
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
let idCounter = 0;
export function generateId(prefix = "a11y"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Get ARIA attributes for expandable elements
 * @param isExpanded - Whether the element is expanded
 * @param controlsId - ID of the element being controlled
 */
export function getExpandableAttributes(
  isExpanded: boolean,
  controlsId: string
): Record<string, string | boolean> {
  return {
    "aria-expanded": isExpanded,
    "aria-controls": controlsId,
  };
}

/**
 * Get ARIA attributes for selected items
 * @param isSelected - Whether the item is selected
 * @param multiSelect - Whether multiple selection is allowed
 */
export function getSelectedAttributes(
  isSelected: boolean,
  multiSelect = false
): Record<string, string | boolean> {
  return {
    "aria-selected": isSelected,
    role: multiSelect ? "option" : undefined,
  } as Record<string, string | boolean>;
}

/**
 * Get ARIA attributes for loading states
 * @param isLoading - Whether content is loading
 * @param loadingText - Text to announce when loading
 */
export function getLoadingAttributes(
  isLoading: boolean,
  loadingText = "Loading"
): Record<string, string | boolean> {
  return {
    "aria-busy": isLoading,
    "aria-describedby": isLoading ? "loading-status" : undefined,
  } as Record<string, string | boolean>;
}

/**
 * Get ARIA attributes for progress indicators
 * @param current - Current progress value
 * @param max - Maximum value
 * @param label - Label for the progress
 */
export function getProgressAttributes(
  current: number,
  max: number,
  label?: string
): Record<string, string | number> {
  return {
    role: "progressbar",
    "aria-valuenow": current,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-label": label || `Progress: ${Math.round((current / max) * 100)}%`,
  };
}

/**
 * Format a number for screen reader announcement
 * @param value - Number to format
 * @param unit - Unit label (e.g., "points", "percent")
 */
export function formatForScreenReader(value: number, unit?: string): string {
  const formattedNumber = new Intl.NumberFormat().format(value);
  return unit ? `${formattedNumber} ${unit}` : formattedNumber;
}

/**
 * Create a visually hidden text for screen readers
 * This is useful for providing context that's visible in the UI but needs explanation
 * @param text - The text to announce
 */
export function srOnly(text: string): string {
  return text;
}

/**
 * Key codes for keyboard navigation
 */
export const KeyCodes = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const;

/**
 * Check if a key event matches a specific key
 * @param event - Keyboard event
 * @param key - Key to check for
 */
export function isKey(
  event: KeyboardEvent | React.KeyboardEvent,
  key: keyof typeof KeyCodes
): boolean {
  return event.key === KeyCodes[key];
}

/**
 * Handle arrow key navigation in a list
 * @param event - Keyboard event
 * @param items - Array of focusable items
 * @param currentIndex - Current focused index
 * @param orientation - List orientation (vertical or horizontal)
 * @returns New index to focus, or -1 if not handled
 */
export function handleArrowNavigation(
  event: KeyboardEvent | React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  orientation: "vertical" | "horizontal" = "vertical"
): number {
  const isVertical = orientation === "vertical";
  const prevKey = isVertical ? KeyCodes.ARROW_UP : KeyCodes.ARROW_LEFT;
  const nextKey = isVertical ? KeyCodes.ARROW_DOWN : KeyCodes.ARROW_RIGHT;

  if (event.key === prevKey) {
    event.preventDefault();
    return currentIndex > 0 ? currentIndex - 1 : items.length - 1;
  }

  if (event.key === nextKey) {
    event.preventDefault();
    return currentIndex < items.length - 1 ? currentIndex + 1 : 0;
  }

  if (event.key === KeyCodes.HOME) {
    event.preventDefault();
    return 0;
  }

  if (event.key === KeyCodes.END) {
    event.preventDefault();
    return items.length - 1;
  }

  return -1;
}

/**
 * Calculate color contrast ratio
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns Contrast ratio
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rr, gg, bb] = [r, g, b].map((v) => {
      const normalized = v / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG requirements
 * @param ratio - Contrast ratio
 * @param level - WCAG level (AA or AAA)
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 */
export function meetsContrastRequirement(
  ratio: number,
  level: "AA" | "AAA" = "AA",
  isLargeText = false
): boolean {
  if (level === "AAA") {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
