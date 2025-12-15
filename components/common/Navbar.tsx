"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Zap, Flame, Heart, Crown, Moon, Sun, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

export function Navbar() {
  const { user, isAuthenticated } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isMarketingPage = pathname === "/" || pathname === "/pricing";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">G</div>
            <span className="font-bold text-xl hidden sm:block">GrammarHero</span>
          </Link>
        </div>

        {isAuthenticated && !isMarketingPage && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">{user?.totalXp || 0} XP</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm">{user?.currentStreak || 0}</span>
            </div>
            {user?.subscriptionTier === "free" && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <span className="font-semibold text-sm">{user?.hearts || 0}</span>
              </div>
            )}
            {user?.subscriptionTier !== "free" && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10">
                <Crown className="h-4 w-4 text-secondary" />
                <span className="text-xs font-semibold text-secondary">{user?.subscriptionTier?.toUpperCase()}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || ""} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/profile?tab=settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild><Link href="/login">Log in</Link></Button>
              <Button asChild><Link href="/signup">Get Started</Link></Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
