/**
 * @fileoverview Root Loading State
 * @description Shows loading UI while page content loads
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {/* Animated logo/spinner */}
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>

        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
          Preparing your learning experience
        </p>
      </div>
    </div>
  );
}
