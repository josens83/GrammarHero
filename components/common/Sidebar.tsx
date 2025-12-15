"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Home, Book, PenTool, Trophy, User, Flame, Heart, Crown, Zap } from "lucide-react";
import { getXPForNextLevel } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: Book },
  { href: "/practice", label: "Practice", icon: PenTool },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const xpProgress = user ? getXPForNextLevel(user.totalXp) : { current: 0, needed: 100, progress: 0 };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "secondary" : "ghost"} className={cn("w-full justify-start gap-3", isActive && "bg-primary/10 text-primary hover:bg-primary/20")}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className="border-t p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Level {user.level}</span>
              <span className="font-medium">{xpProgress.current}/{xpProgress.needed} XP</span>
            </div>
            <Progress value={xpProgress.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{user.currentStreak} day</span>
            </div>
            {user.subscriptionTier === "free" ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <span className="text-sm font-medium">{user.hearts}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10">
                <Crown className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">{user.subscriptionTier}</span>
              </div>
            )}
          </div>

          {user.subscriptionTier === "free" && (
            <Button asChild className="w-full" variant="secondary">
              <Link href="/pricing"><Crown className="mr-2 h-4 w-4" />Go Pro</Link>
            </Button>
          )}
        </div>
      )}
    </aside>
  );
}
