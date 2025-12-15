import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * @fileoverview Application middleware
 * @description Handles session management and security headers
 *
 * Security measures:
 * - Session token refresh via Supabase
 * - CSRF protection via SameSite cookies
 * - Security headers applied to responses
 */

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const response = await updateSession(request);

  // Add additional security headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
