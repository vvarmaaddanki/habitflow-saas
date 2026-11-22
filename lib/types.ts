export interface Habit {
  id: string
  name: string
  category: CategoryId
  streak: number
  bestStreak: number
  completed: boolean
  completedDates: string[]
  createdAt: string
  archived?: boolean
  reminderTime?: string
  notes?: string
}

export type CategoryId = "health" | "fitness" | "learning" | "mindfulness" | "productivity" | "custom"

export interface Category {
  id: CategoryId
  label: string
  color: string
  icon: string
  gradient: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  condition: (stats: UserStats) => boolean
}

export interface UserStats {
  totalHabits: number
  activeHabits: number
  completedToday: number
  completionRate: number
  maxStreak: number
  currentStreak: number
  totalCompletions: number
  perfectWeeks: number
  earlyCompletions: number
  lateCompletions: number
  categoriesUsed: number
  comebacks: number
}

export interface Settings {
  theme: "light" | "dark" | "system"
  notifications: boolean
  reminderTime: string
  weekStartsOn: number
  compactMode: boolean
  showStreakNumbers: boolean
  animationsEnabled: boolean
  soundEnabled: boolean
}

export interface HabitTemplate {
  name: string
  category: CategoryId
  description: string
}

export type ViewMode = "day" | "week" | "month"

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  completions: Map<string, boolean> // habitId -> completed
}