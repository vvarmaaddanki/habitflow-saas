import { UserStats } from "@/lib/types"

export const CATEGORIES = [
  { id: "health", label: "Health", color: "bg-emerald-500", icon: "💚", gradient: "from-emerald-500 to-teal-500" },
  { id: "fitness", label: "Fitness", color: "bg-rose-500", icon: "💪", gradient: "from-rose-500 to-pink-500" },
  { id: "learning", label: "Learning", color: "bg-blue-500", icon: "📚", gradient: "from-blue-500 to-indigo-500" },
  { id: "mindfulness", label: "Mindfulness", color: "bg-violet-500", icon: "🧘", gradient: "from-violet-500 to-purple-500" },
  { id: "productivity", label: "Productivity", color: "bg-amber-500", icon: "⚡", gradient: "from-amber-500 to-orange-500" },
  { id: "custom", label: "Custom", color: "bg-slate-500", icon: "✨", gradient: "from-slate-500 to-gray-500" },
] as const

export const HABIT_TEMPLATES = [
  { name: "Morning Hydration", category: "health", description: "Drink a glass of water first thing" },
  { name: "10-Minute Walk", category: "fitness", description: "Take a short walk outside" },
  { name: "Read 20 Pages", category: "learning", description: "Read a book for 20 pages" },
  { name: "Morning Meditation", category: "mindfulness", description: "Meditate for 10 minutes" },
  { name: "Plan Your Day", category: "productivity", description: "Write top 3 priorities" },
  { name: "Stretch Break", category: "fitness", description: "Stretch for 5 minutes" },
  { name: "Gratitude Journal", category: "mindfulness", description: "Write 3 things you're grateful for" },
  { name: "Learn New Word", category: "learning", description: "Learn one new vocabulary word" },
  { name: "No Phone Before Bed", category: "health", description: "Stop using phone 1 hour before sleep" },
  { name: "Deep Work Session", category: "productivity", description: "Focused work for 90 minutes" },
  { name: "Evening Walk", category: "fitness", description: "Walk after dinner" },
  { name: "Language Practice", category: "learning", description: "Practice language for 15 minutes" },
] as const

export const ACHIEVEMENTS = [
  { id: "first_habit", name: "First Steps", description: "Create your first habit", icon: "🌱", condition: (stats: UserStats) => stats.totalHabits >= 1 },
  { id: "week_streak", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", condition: (stats: UserStats) => stats.maxStreak >= 7 },
  { id: "month_streak", name: "Month Master", description: "Maintain a 30-day streak", icon: "🏆", condition: (stats: UserStats) => stats.maxStreak >= 30 },
  { id: "hundred_days", name: "Centurion", description: "Complete 100 total habit days", icon: "💯", condition: (stats: UserStats) => stats.totalCompletions >= 100 },
  { id: "five_habits", name: "Habit Collector", description: "Have 5 active habits", icon: "📚", condition: (stats: UserStats) => stats.totalHabits >= 5 },
  { id: "perfect_week", name: "Perfect Week", description: "Complete all habits for 7 days", icon: "✨", condition: (stats: UserStats) => stats.perfectWeeks >= 1 },
  { id: "early_bird", name: "Early Bird", description: "Complete habits before 9 AM for a week", icon: "🌅", condition: (stats: UserStats) => stats.earlyCompletions >= 7 },
  { id: "night_owl", name: "Night Owl", description: "Complete habits after 10 PM for a week", icon: "🦉", condition: (stats: UserStats) => stats.lateCompletions >= 7 },
  { id: "category_master", name: "Category Master", description: "Have habits in all 6 categories", icon: "🌈", condition: (stats: UserStats) => stats.categoriesUsed >= 6 },
  { id: "comeback_king", name: "Comeback King", description: "Restart a broken streak 3 times", icon: "🔄", condition: (stats: UserStats) => stats.comebacks >= 3 },
]

export const STORAGE_KEYS = {
  HABITS: "habit-tracker-habits-v2",
  SETTINGS: "habit-tracker-settings",
  ONBOARDING: "habit-tracker-onboarding",
  ACHIEVEMENTS: "habit-tracker-achievements",
} as const

export const DEFAULT_SETTINGS = {
  theme: "system" as "light" | "dark" | "system",
  notifications: true,
  reminderTime: "09:00",
  weekStartsOn: 0, // Sunday
  compactMode: false,
  showStreakNumbers: true,
  animationsEnabled: true,
  soundEnabled: false,
} as const