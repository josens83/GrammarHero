/**
 * @fileoverview Settings Page
 * @description User preferences and application settings
 */

"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useSoundStore } from "@/hooks/use-sound";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Globe,
  Moon,
  Sun,
  Target,
  Shield,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, isLoading, updateUser } = useUser();
  const { soundEnabled, toggleSound, animationsEnabled, toggleAnimations } = useGamificationStore();
  const { isMuted, volume, toggleMute, setVolume } = useSoundStore();
  const { toast } = useToast();

  // Local state for settings
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 3);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState("en");
  const [showProgress, setShowProgress] = useState(true);

  if (isLoading) return <PageLoader />;
  if (!user) return <PageLoader />;

  const handleSaveSettings = async () => {
    try {
      await updateUser({ dailyGoal });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    const userData = {
      profile: {
        displayName: user.displayName,
        email: user.email,
        level: user.level,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grammarhero-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your data has been downloaded.",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Learning Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Preferences
          </CardTitle>
          <CardDescription>
            Customize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Goal */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Daily Lesson Goal</Label>
              <span className="text-sm font-medium">{dailyGoal} lessons</span>
            </div>
            <Slider
              value={[dailyGoal]}
              onValueChange={([value]) => setDailyGoal(value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Set how many lessons you want to complete each day
            </p>
          </div>

          <Separator />

          {/* Difficulty */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Preferred Difficulty</Label>
              <p className="text-sm text-muted-foreground">
                Default difficulty for new lessons
              </p>
            </div>
            <Select defaultValue="intermediate">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Show Progress */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Progress on Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your learning progress
              </p>
            </div>
            <Switch
              checked={showProgress}
              onCheckedChange={setShowProgress}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound & Animation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Sound & Effects
          </CardTitle>
          <CardDescription>
            Control audio and visual feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Volume2 className="h-5 w-5 text-primary" />
              )}
              <div>
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for correct/incorrect answers
                </p>
              </div>
            </div>
            <Switch checked={!isMuted} onCheckedChange={toggleMute} />
          </div>

          {/* Volume Slider */}
          {!isMuted && (
            <div className="space-y-3 pl-8">
              <div className="flex justify-between">
                <Label>Volume</Label>
                <span className="text-sm font-medium">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={([value]) => setVolume(value / 100)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}

          <Separator />

          {/* Animations Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable XP animations and celebrations
                </p>
              </div>
            </div>
            <Switch checked={animationsEnabled} onCheckedChange={toggleAnimations} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how we communicate with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Browser push notifications
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Streak Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to maintain your streak
              </p>
            </div>
            <Switch
              checked={streakReminders}
              onCheckedChange={setStreakReminders}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Progress Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive a summary of your weekly progress
              </p>
            </div>
            <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how GrammarHero looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </span>
                </SelectItem>
                <SelectItem value="dark">
                  <span className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </span>
                </SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Language</Label>
              <p className="text-sm text-muted-foreground">
                Display language for the app
              </p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export My Data
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
