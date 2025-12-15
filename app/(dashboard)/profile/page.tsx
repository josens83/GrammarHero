"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader, ButtonLoader } from "@/components/common/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Edit2, Trophy, Zap, Flame, Crown, Target, CheckCircle2, Calendar, Settings, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { getXPForNextLevel, formatDate } from "@/lib/utils";
import { ACHIEVEMENTS } from "@/lib/constants";
import { useTheme } from "next-themes";
import { useGamificationStore } from "@/stores/gamificationStore";

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, toggleSound } = useGamificationStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 10);

  if (isLoading || !user) return <PageLoader />;

  const xpProgress = getXPForNextLevel(user.totalXp);

  // Demo achievements
  const userAchievements = ["first_lesson", "streak_7"];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("profiles").update({ display_name: displayName, daily_goal: dailyGoal }).eq("id", user.id);
      toast({ title: "Profile updated" });
      setIsEditing(false);
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="achievements"><Trophy className="h-4 w-4 mr-2" />Achievements</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">{user.displayName?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Daily Goal (lessons)</Label>
                        <Input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} min={1} max={50} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <ButtonLoader /> : "Save"}</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">{user.displayName || "User"}</h2>
                          <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4 mr-2" />Edit</Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.subscriptionTier !== "free" && <Badge variant="secondary"><Crown className="h-3 w-3 mr-1" />{user.subscriptionTier}</Badge>}
                        <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />Joined {formatDate(user.createdAt)}</Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center"><Zap className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{user.totalXp}</p><p className="text-sm text-muted-foreground">Total XP</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" /><p className="text-2xl font-bold">{user.currentStreak}</p><p className="text-sm text-muted-foreground">Current Streak</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" /><p className="text-2xl font-bold">{user.longestStreak}</p><p className="text-sm text-muted-foreground">Best Streak</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Target className="h-8 w-8 text-purple-500 mx-auto mb-2" /><p className="text-2xl font-bold">Level {user.level}</p><p className="text-sm text-muted-foreground">{xpProgress.current}/{xpProgress.needed} XP</p></CardContent></Card>
          </div>

          {/* Level Progress */}
          <Card>
            <CardHeader><CardTitle>Level Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Level {user.level}</span><span>Level {user.level + 1}</span></div>
                <Progress value={xpProgress.progress} className="h-4" />
                <p className="text-center text-sm text-muted-foreground">{xpProgress.needed - xpProgress.current} XP to next level</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Achievements ({userAchievements.length}/{ACHIEVEMENTS.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = userAchievements.includes(achievement.id);
                  return (
                    <div key={achievement.id} className={`p-4 rounded-lg border ${isUnlocked ? "bg-primary/5 border-primary/20" : "opacity-50"}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            {isUnlocked && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-primary mt-1">+{achievement.xpBonus} XP</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><Moon className="h-5 w-5" /><div><p className="font-medium">Dark Mode</p><p className="text-sm text-muted-foreground">Toggle dark/light theme</p></div></div>
                <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">{soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}<div><p className="font-medium">Sound Effects</p><p className="text-sm text-muted-foreground">Play sounds for correct/wrong answers</p></div></div>
                <Button variant="outline" size="sm" onClick={toggleSound}>{soundEnabled ? "On" : "Off"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
