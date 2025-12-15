/**
 * @fileoverview Leaderboard Page
 * @description Interactive leaderboard with leagues and real-time updates
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/common/LoadingSpinner";
import {
  Trophy,
  Medal,
  Flame,
  Zap,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronUp,
  ChevronDown,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// League definitions
const LEAGUES = [
  { id: "bronze", name: "Bronze", minXp: 0, color: "bg-amber-700", icon: Shield },
  { id: "silver", name: "Silver", minXp: 5000, color: "bg-gray-400", icon: Shield },
  { id: "gold", name: "Gold", minXp: 15000, color: "bg-yellow-500", icon: Crown },
  { id: "diamond", name: "Diamond", minXp: 35000, color: "bg-cyan-400", icon: Star },
  { id: "master", name: "Master", minXp: 75000, color: "bg-purple-500", icon: Trophy },
];

// Demo leaderboard data
const generateLeaderboard = (count: number) => {
  const names = [
    "Sarah K.", "Mike J.", "Emma L.", "Alex P.", "Chris M.",
    "Jordan R.", "Taylor S.", "Morgan B.", "Casey D.", "Riley W.",
    "Quinn N.", "Avery T.", "Cameron H.", "Drew F.", "Jamie L.",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: names[i % names.length],
    avatar: null,
    xp: Math.floor(15000 - i * 500 + Math.random() * 200),
    weeklyXp: Math.floor(2000 - i * 100 + Math.random() * 50),
    streak: Math.floor(50 - i * 2 + Math.random() * 5),
    level: Math.floor(15 - i * 0.5 + Math.random() * 2),
    rank: i + 1,
    previousRank: i + 1 + Math.floor(Math.random() * 5) - 2,
    isCurrentUser: false,
  }));
};

export default function LeaderboardPage() {
  const { user, isLoading } = useUser();
  const [period, setPeriod] = useState<"daily" | "weekly" | "alltime">("weekly");
  const [leaderboard, setLeaderboard] = useState(generateLeaderboard(15));
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  // Find user's league
  const userLeague = useMemo(() => {
    const userXp = user?.totalXp || 0;
    return [...LEAGUES].reverse().find((league) => userXp >= league.minXp) || LEAGUES[0];
  }, [user?.totalXp]);

  // Next league
  const nextLeague = useMemo(() => {
    const currentIndex = LEAGUES.findIndex((l) => l.id === userLeague.id);
    return currentIndex < LEAGUES.length - 1 ? LEAGUES[currentIndex + 1] : null;
  }, [userLeague]);

  // Progress to next league
  const leagueProgress = useMemo(() => {
    if (!nextLeague) return 100;
    const userXp = user?.totalXp || 0;
    const progressXp = userXp - userLeague.minXp;
    const neededXp = nextLeague.minXp - userLeague.minXp;
    return Math.min(100, (progressXp / neededXp) * 100);
  }, [user?.totalXp, userLeague, nextLeague]);

  // Current user's position in leaderboard
  const userRank = useMemo(() => {
    // Find where user would rank based on their XP
    const userXp = user?.totalXp || 0;
    const higherRanked = leaderboard.filter((p) => p.xp > userXp).length;
    return higherRanked + 1;
  }, [user?.totalXp, leaderboard]);

  // Displayed players
  const displayedPlayers = showAllPlayers ? leaderboard : leaderboard.slice(0, 10);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankChange = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) {
      return (
        <span className="flex items-center text-green-500 text-xs">
          <ChevronUp className="h-3 w-3" />
          {diff}
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="flex items-center text-red-500 text-xs">
          <ChevronDown className="h-3 w-3" />
          {Math.abs(diff)}
        </span>
      );
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">Compete with learners worldwide</p>
        </div>
      </div>

      {/* League Card */}
      <Card className="overflow-hidden">
        <div className={cn("h-2", userLeague.color)} />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                userLeague.color
              )}
            >
              <userLeague.icon className="h-10 w-10 text-white" />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{userLeague.name} League</h2>
                <Badge variant="outline" className="text-xs">
                  Rank #{userRank}
                </Badge>
              </div>

              {nextLeague ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Progress to {nextLeague.name}
                    </span>
                    <span className="font-medium">
                      {formatNumber(user?.totalXp || 0)} / {formatNumber(nextLeague.minXp)} XP
                    </span>
                  </div>
                  <Progress value={leagueProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(nextLeague.minXp - (user?.totalXp || 0))} XP to promotion
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You've reached the highest league!
                </p>
              )}
            </div>

            <div className="flex gap-4">
              {LEAGUES.map((league) => (
                <div
                  key={league.id}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    league.id === userLeague.id
                      ? cn(league.color, "ring-2 ring-offset-2 ring-primary")
                      : "bg-muted opacity-50"
                  )}
                >
                  <league.icon className="h-5 w-5 text-white" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Stats Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="text-xl">
                {user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.displayName || "You"}</h2>
              <p className="text-muted-foreground">Level {user?.level}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">#{userRank}</p>
              <p className="text-sm text-muted-foreground">Your Rank</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-bold">{formatNumber(user?.totalXp || 0)}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="font-bold">{user?.currentStreak || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Crown className="h-5 w-5 text-secondary mx-auto mb-1" />
              <p className="font-bold">{user?.level || 1}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Learners
            </CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <TabsList>
                <TabsTrigger value="daily">Today</TabsTrigger>
                <TabsTrigger value="weekly">This Week</TabsTrigger>
                <TabsTrigger value="alltime">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {displayedPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg transition-colors",
                    player.isCurrentUser
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(player.rank)}
                  </div>
                  <div className="w-6">{getRankChange(player.rank, player.previousRank)}</div>
                  <Avatar>
                    <AvatarImage src={player.avatar || undefined} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{player.name}</span>
                      {player.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Level {player.level}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {player.streak}
                    </div>
                    <div className="flex items-center gap-1 font-semibold min-w-[80px] justify-end">
                      <Zap className="h-4 w-4 text-primary" />
                      {formatNumber(period === "weekly" ? player.weeklyXp : player.xp)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!showAllPlayers && leaderboard.length > 10 && (
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowAllPlayers(true)}
            >
              Show all {leaderboard.length} players
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Promotion/Demotion Zone */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600 flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Promotion Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Top 3 players get promoted to the next league
            </p>
            <div className="space-y-2">
              {leaderboard.slice(0, 3).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-2 rounded bg-green-50 dark:bg-green-900/20"
                >
                  <span className="font-bold">#{player.rank}</span>
                  <span>{player.name}</span>
                  <span className="ml-auto text-sm font-medium">
                    {formatNumber(player.xp)} XP
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 flex items-center gap-2 text-base">
              <TrendingDown className="h-5 w-5" />
              Demotion Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Bottom 3 players get demoted to the previous league
            </p>
            <div className="space-y-2">
              {leaderboard.slice(-3).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-2 rounded bg-red-50 dark:bg-red-900/20"
                >
                  <span className="font-bold">#{player.rank}</span>
                  <span>{player.name}</span>
                  <span className="ml-auto text-sm font-medium">
                    {formatNumber(player.xp)} XP
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
