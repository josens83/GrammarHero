/**
 * @fileoverview Security headers configuration
 * @description Provides secure HTTP headers for the application
 *
 * Security headers implemented:
 * - Content-Security-Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 * @see https://securityheaders.com/
 */

/**
 * Content Security Policy directives
 * Customize based on your application's needs
 */
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-eval'", // Required for Next.js in development
    "'unsafe-inline'", // Required for some inline scripts
    "https://js.stripe.com",
    "https://accounts.google.com",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and CSS-in-JS
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.supabase.co",
    "https://*.stripe.com",
    "https://*.googleusercontent.com",
  ],
  "font-src": [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://api.stripe.com",
    "https://api.anthropic.com",
  ],
  "frame-src": [
    "'self'",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://accounts.google.com",
  ],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": [],
};

/**
 * Build Content-Security-Policy header value
 * @returns CSP header string
 */
function buildCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(" ")}`;
    })
    .join("; ");
}

/**
 * Security headers to apply to all responses
 */
export const securityHeaders: Record<string, string> = {
  // Prevent clickjacking attacks
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Disable browser features we don't need
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
  ].join(", "),

  // XSS protection (legacy, but still useful)
  "X-XSS-Protection": "1; mode=block",

  // Content Security Policy
  "Content-Security-Policy": buildCSP(),
};

/**
 * Security headers for API responses (more permissive for CORS)
 */
export const apiSecurityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store, max-age=0",
};

/**
 * CORS headers for API responses
 * @param origin - Request origin
 * @returns CORS headers object
 */
export function getCORSHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
  ];

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Apply security headers to a Response object
 * @param response - Response to modify
 * @param additionalHeaders - Additional headers to apply
 * @returns Modified response with security headers
 */
export function withSecurityHeaders(
  response: Response,
  additionalHeaders?: Record<string, string>
): Response {
  const headers = new Headers(response.headers);

  // Apply security headers
  Object.entries({ ...apiSecurityHeaders, ...additionalHeaders }).forEach(
    ([key, value]) => {
      headers.set(key, value);
    }
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
