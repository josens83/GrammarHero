"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Trophy, Medal, Flame, Zap, Crown } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// Demo leaderboard data
const DEMO_LEADERBOARD = [
  { id: "1", name: "Sarah K.", avatar: null, xp: 12500, streak: 45, level: 15, rank: 1 },
  { id: "2", name: "Mike J.", avatar: null, xp: 11200, streak: 32, level: 14, rank: 2 },
  { id: "3", name: "Emma L.", avatar: null, xp: 10800, streak: 28, level: 13, rank: 3 },
  { id: "4", name: "Alex P.", avatar: null, xp: 9500, streak: 21, level: 12, rank: 4 },
  { id: "5", name: "Chris M.", avatar: null, xp: 8200, streak: 18, level: 11, rank: 5 },
  { id: "6", name: "You", avatar: null, xp: 2450, streak: 7, level: 5, rank: 42, isCurrentUser: true },
];

export default function LeaderboardPage() {
  const { user, isLoading } = useUser();
  const [period, setPeriod] = useState("weekly");

  if (isLoading) return <PageLoader />;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Trophy className="h-8 w-8 text-yellow-500" />Leaderboard</h1>
        <p className="text-muted-foreground">Compete with learners worldwide</p>
      </div>

      {/* Your Rank Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="text-xl">{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.displayName || "You"}</h2>
              <p className="text-muted-foreground">Level {user?.level}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">#42</p>
              <p className="text-sm text-muted-foreground">Your Rank</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-background/50 rounded-lg"><Zap className="h-5 w-5 text-primary mx-auto mb-1" /><p className="font-bold">{formatNumber(user?.totalXp || 0)}</p><p className="text-xs text-muted-foreground">Total XP</p></div>
            <div className="text-center p-3 bg-background/50 rounded-lg"><Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" /><p className="font-bold">{user?.currentStreak || 0}</p><p className="text-xs text-muted-foreground">Day Streak</p></div>
            <div className="text-center p-3 bg-background/50 rounded-lg"><Crown className="h-5 w-5 text-secondary mx-auto mb-1" /><p className="font-bold">{user?.level || 1}</p><p className="text-xs text-muted-foreground">Level</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="daily">Today</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DEMO_LEADERBOARD.map((player) => (
              <div key={player.id} className={cn("flex items-center gap-4 p-4 rounded-lg transition-colors", player.isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50")}>
                <div className="w-8 flex justify-center">{getRankIcon(player.rank)}</div>
                <Avatar>
                  <AvatarImage src={player.avatar || undefined} />
                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{player.name}</span>
                    {player.isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">Level {player.level}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1"><Flame className="h-4 w-4 text-orange-500" />{player.streak}</div>
                  <div className="flex items-center gap-1 font-semibold"><Zap className="h-4 w-4 text-primary" />{formatNumber(player.xp)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
