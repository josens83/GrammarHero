/**
 * @fileoverview Notifications Page
 * @description User notifications center for achievements, reminders, and updates
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageLoader } from "@/components/common/LoadingSpinner";
import {
  Bell,
  Trophy,
  Flame,
  Zap,
  Gift,
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Crown,
  Target,
  Calendar,
  Star,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  type: "achievement" | "streak" | "xp" | "reminder" | "update" | "reward" | "challenge";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
}

// Demo notifications
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "You earned the 'First Steps' badge for completing your first lesson.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
    actionUrl: "/profile?tab=achievements",
    actionText: "View Badge",
  },
  {
    id: "2",
    type: "streak",
    title: "Streak at Risk! 🔥",
    message: "You haven't practiced today. Complete a lesson to maintain your 7-day streak!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: "/learn",
    actionText: "Practice Now",
  },
  {
    id: "3",
    type: "xp",
    title: "Level Up! 🎉",
    message: "Congratulations! You've reached Level 5. Keep up the great work!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: "4",
    type: "challenge",
    title: "Daily Challenge Available",
    message: "Today's challenge: Complete 5 exercises in under 10 minutes!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: false,
    actionUrl: "/challenge",
    actionText: "Start Challenge",
  },
  {
    id: "5",
    type: "reward",
    title: "Weekly Streak Reward",
    message: "You maintained a 7-day streak! Enjoy 50 bonus XP.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
  },
  {
    id: "6",
    type: "update",
    title: "New Grammar Lessons Added",
    message: "Check out our new Advanced Conditionals and Reported Speech lessons!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    actionUrl: "/learn",
    actionText: "Explore Lessons",
  },
  {
    id: "7",
    type: "reminder",
    title: "Review Time!",
    message: "You have 5 items due for review. Strengthen your memory now!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    actionUrl: "/review",
    actionText: "Start Review",
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "achievement":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "streak":
      return <Flame className="h-5 w-5 text-orange-500" />;
    case "xp":
      return <Zap className="h-5 w-5 text-primary" />;
    case "reminder":
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
    case "update":
      return <Star className="h-5 w-5 text-purple-500" />;
    case "reward":
      return <Gift className="h-5 w-5 text-pink-500" />;
    case "challenge":
      return <Target className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "achievement":
      return "bg-yellow-500/10 border-yellow-500/20";
    case "streak":
      return "bg-orange-500/10 border-orange-500/20";
    case "xp":
      return "bg-primary/10 border-primary/20";
    case "reminder":
      return "bg-blue-500/10 border-blue-500/20";
    case "update":
      return "bg-purple-500/10 border-purple-500/20";
    case "reward":
      return "bg-pink-500/10 border-pink-500/20";
    case "challenge":
      return "bg-green-500/10 border-green-500/20";
    default:
      return "bg-muted";
  }
};

export default function NotificationsPage() {
  const { user, isLoading } = useUser();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  if (isLoading) return <PageLoader />;
  if (!user) return <PageLoader />;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your learning progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                {filter === "unread"
                  ? "You've read all your notifications!"
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-muted/30"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border",
                        getNotificationColor(notification.type)
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn("font-medium", !notification.read && "font-semibold")}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                        <div className="flex gap-2">
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="h-auto p-0" asChild>
                              <Link href={notification.actionUrl}>
                                {notification.actionText || "View"}
                              </Link>
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{user.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{user.totalXp}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="h-6 w-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold">Lv.{user.level}</p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
