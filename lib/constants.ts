export const XP_CONFIG = {
  LESSON_COMPLETE: 10,
  LESSON_PERFECT_BONUS: 5,
  CORRECT_ANSWER: 1,
  STREAK_BONUS_MULTIPLIER: 0.1,
  DAILY_FIRST_LESSON: 5,
  DAILY_GOAL_COMPLETE: 10,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
  STREAK_100_DAYS: 1000,
};

export const HEARTS_CONFIG = {
  MAX_HEARTS: 5,
  REFILL_TIME_MINUTES: 30,
  PRO_UNLIMITED: true,
};

export const STREAK_CONFIG = {
  FREEZE_COST_GEMS: 200,
  MAX_FREEZES: 3,
};

export const PRICING = {
  FREE: {
    name: "Free",
    price: 0,
    features: ["5 hearts per day", "Basic grammar lessons", "Limited AI feedback", "Community leaderboard"],
    limits: { hearts: 5, aiChecks: 3, lessonsPerDay: 10, streakFreezes: 0 },
  },
  PRO: {
    name: "Pro",
    price: 9.99,
    priceId: "price_pro_monthly",
    features: ["Unlimited hearts", "All grammar lessons", "Unlimited AI feedback", "Priority support", "No ads", "Streak freezes"],
    limits: { hearts: -1, aiChecks: -1, lessonsPerDay: -1, streakFreezes: 3 },
  },
  PREMIUM: {
    name: "Premium",
    price: 19.99,
    priceId: "price_premium_monthly",
    features: ["Everything in Pro", "1-on-1 AI tutoring", "Custom learning path", "Certificate of completion", "Family sharing (up to 5)"],
    limits: { hearts: -1, aiChecks: -1, lessonsPerDay: -1, streakFreezes: -1 },
  },
};

export const GRAMMAR_CATEGORIES = [
  { id: "tenses", name: "Tenses", icon: "Clock", color: "bg-blue-500", description: "Past, present, future" },
  { id: "articles", name: "Articles", icon: "FileText", color: "bg-green-500", description: "A, an, the" },
  { id: "prepositions", name: "Prepositions", icon: "MapPin", color: "bg-purple-500", description: "In, on, at, by" },
  { id: "pronouns", name: "Pronouns", icon: "Users", color: "bg-orange-500", description: "He, she, they, it" },
  { id: "conjunctions", name: "Conjunctions", icon: "Link", color: "bg-pink-500", description: "And, but, or" },
  { id: "modals", name: "Modal Verbs", icon: "Zap", color: "bg-yellow-500", description: "Can, could, should" },
  { id: "conditionals", name: "Conditionals", icon: "GitBranch", color: "bg-red-500", description: "If clauses" },
  { id: "passive", name: "Passive Voice", icon: "RefreshCw", color: "bg-cyan-500", description: "Was done, is made" },
];

export const ACHIEVEMENTS = [
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", icon: "🎯", xpBonus: 10 },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", xpBonus: 50 },
  { id: "streak_30", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "💪", xpBonus: 200 },
  { id: "perfect_10", name: "Perfect 10", description: "Get 10 perfect lessons", icon: "⭐", xpBonus: 100 },
  { id: "level_10", name: "Rising Star", description: "Reach level 10", icon: "🌟", xpBonus: 150 },
  { id: "all_categories", name: "Grammar Guru", description: "Complete all categories", icon: "🏆", xpBonus: 500 },
];
