import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SkipLink } from "@/components/common/SkipLink";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrammarHero - Master English Grammar with AI",
  description: "GrammarHero uses AI to personalize your English grammar learning journey. Fun, effective, and free to start.",
  keywords: ["English grammar", "learn English", "grammar learning", "AI tutor", "language learning"],
  openGraph: {
    title: "GrammarHero - Master English Grammar with AI",
    description: "GrammarHero uses AI to personalize your English grammar learning journey. Fun, effective, and free to start.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#22c55e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Skip link for keyboard accessibility */}
          <SkipLink />

          {/* Main content with skip link target */}
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
