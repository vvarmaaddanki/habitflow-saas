"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, Sector,
} from "recharts"
import {
  Sun, Moon, Plus, X, Trash2, Edit, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Target, Flame, Award, Calendar, Clock, Bell, Settings as SettingsIcon,
  ArrowLeft, ArrowRight, Check, Star, Zap, Heart, Brain,
  Dumbbell, BookOpen, Coffee, Wind, Sparkles,
  Menu, X as XIcon, Download, Upload, RefreshCw,
} from "lucide-react"
import { cn, formatDate, formatDateShort, getWeekStart, getMonthStart, addDays, isSameDay, generateId } from "@/lib/utils"
import { CATEGORIES, HABIT_TEMPLATES, ACHIEVEMENTS, STORAGE_KEYS, DEFAULT_SETTINGS } from "@/lib/constants"
import type { Habit, CategoryId, Settings, ViewMode, Achievement, UserStats } from "@/lib/types"
import { Button } from "./ui/Button"
import { Card, CardContent } from "./ui/Card"
import { Input } from "./ui/Input"
import { Badge } from "./ui/Badge"
import { Modal } from "./ui/Modal"

const getCategory = (id: CategoryId) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0]

export function Dashboard() {
  const { data: session, update } = useSession()
  const [habits, setHabits] = useState<Habit[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [achievements, setAchievements] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [newHabit, setNewHabit] = useState("")
  const [newCategory, setNewCategory] = useState<CategoryId>("health")
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editName, setEditName] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalHabits: 0, activeHabits: 0, completedToday: 0, completionRate: 0,
    maxStreak: 0, currentStreak: 0, totalCompletions: 0,
    perfectWeeks: 0, earlyCompletions: 0, lateCompletions: 0,
    categoriesUsed: 0, comebacks: 0,
  })

  useEffect(() => {
    const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS)
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    const storedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
    const onboardingDone = localStorage.getItem(STORAGE_KEYS.ONBOARDING)

    if (storedHabits) {
      try { setHabits(JSON.parse(storedHabits)) } catch { setHabits(getDefaultHabits()) }
    } else {
      setHabits(getDefaultHabits())
    }
    if (storedSettings) { setSettings(JSON.parse(storedSettings)) }
    if (storedAchievements) { setAchievements(JSON.parse(storedAchievements)) }
    if (!onboardingDone && habits.length === 0) { setShowOnboarding(true) }
  }, [])

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)) }, [habits])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)) }, [settings])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements)) }, [achievements])

  useEffect(() => { calculateStats() }, [habits])

  const getDefaultHabits = (): Habit[] => [
    { id: "1", name: "Morning Hydration", category: "health", streak: 5, bestStreak: 12, completed: true, completedDates: getLastNDates(5), createdAt: new Date().toISOString() },
    { id: "2", name: "Read 20 Pages", category: "learning", streak: 3, bestStreak: 14, completed: false, completedDates: getLastNDates(3), createdAt: new Date().toISOString() },
    { id: "3", name: "Morning Meditation", category: "mindfulness", streak: 7, bestStreak: 21, completed: true, completedDates: getLastNDates(7), createdAt: new Date().toISOString() },
  ]

  const getLastNDates = (n: number): string[] => {
    const dates: string[] = []
    for (let i = 0; i < n; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split("T")[0])
    }
    return dates
  }

  const getToday = () => new Date().toISOString().split("T")[0]

  const calculateStats = () => {
    const today = getToday()
    const active = habits.filter(h => !h.archived)
    const completedToday = active.filter(h => h.completedDates.includes(today)).length
    const maxStreak = Math.max(...active.map(h => h.bestStreak), 0)
    const currentStreak = Math.max(...active.map(h => h.streak), 0)
    const totalCompletions = active.reduce((sum, h) => sum + h.completedDates.length, 0)
    const categoriesUsed = new Set(active.map(h => h.category)).size

    let perfectWeeks = 0
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split("T")[0]
    })
    perfectWeeks = active.filter(h => last7Days.every(d => h.completedDates.includes(d))).length > 0 ? 1 : 0

    let earlyCompletions = 0, lateCompletions = 0, comebacks = 0
    active.forEach(h => {
      h.completedDates.forEach(d => {
        const hour = new Date(d + "T12:00:00").getHours()
        if (hour < 9) earlyCompletions++
        if (hour > 22) lateCompletions++
      })
      for (let i = 1; i < h.completedDates.length; i++) {
        const prev = new Date(h.completedDates[i - 1])
        const curr = new Date(h.completedDates[i])
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
        if (diff > 1 && diff < 7) comebacks++
      }
    })

    setStats({
      totalHabits: habits.length,
      activeHabits: active.length,
      completedToday,
      completionRate: active.length > 0 ? Math.round((completedToday / active.length) * 100) : 0,
      maxStreak,
      currentStreak,
      totalCompletions,
      perfectWeeks,
      earlyCompletions,
      lateCompletions,
      categoriesUsed,
      comebacks,
    })
  }

  const checkAchievements = useCallback(() => {
    ACHIEVEMENTS.forEach(a => {
      if (a.condition(stats) && !achievements.includes(a.id)) {
        setAchievements(prev => [...prev, a.id])
      }
    })
  }, [stats, achievements])

  useEffect(() => { checkAchievements() }, [checkAchievements])

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit: Habit = {
        id: generateId(), name: newHabit.trim(), category: newCategory,
        streak: 0, bestStreak: 0, completed: false,
        completedDates: [], createdAt: new Date().toISOString()
      }
      setHabits(prev => [...prev, habit])
      setNewHabit("")
      setNewCategory("health")
      setShowAddHabit(false)
      setShowTemplates(false)
    }
  }

  const addFromTemplates = () => {
    selectedTemplate.forEach(t => {
      const template = HABIT_TEMPLATES.find(h => h.name === t)
      if (template) {
        const habit: Habit = {
          id: generateId(), name: template.name, category: template.category,
          streak: 0, bestStreak: 0, completed: false,
          completedDates: [], createdAt: new Date().toISOString()
        }
        setHabits(prev => [...prev, habit])
      }
    })
    setShowTemplates(false)
    setSelectedTemplate([])
  }

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const today = getToday()
      const alreadyDone = h.completedDates.includes(today)
      if (alreadyDone) {
        return { ...h, completed: false, completedDates: h.completedDates.filter(d => d !== today), streak: Math.max(0, h.streak - 1) }
      }
      const newDates = [...h.completedDates, today]
      const yesterday = addDays(new Date(), -1).toISOString().split("T")[0]
      const newStreak = h.completedDates.includes(yesterday) ? h.streak + 1 : 1
      return { ...h, completed: true, completedDates: newDates, streak: newStreak, bestStreak: Math.max(h.bestStreak, newStreak) }
    }))
  }

  const deleteHabit = (id: string) => {
    if (confirm("Delete this habit permanently?")) {
      setHabits(prev => prev.filter(h => h.id !== id))
    }
  }

  const archiveHabit = (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: true } : h))
  }

  const startEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setEditName(habit.name)
  }

  const saveEdit = () => {
    if (editName.trim() && editingHabit) {
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? { ...h, name: editName.trim() } : h))
      setEditingHabit(null)
    }
  }

  const navigateDate = (days: number) => {
    setCurrentDate(prev => addDays(prev, days))
  }

  const navigateWeek = (weeks: number) => {
    setCurrentDate(prev => addDays(prev, weeks * 7))
  }

  const navigateMonth = (months: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + months)
      return d
    })
  }

  const exportData = () => {
    const data = { habits, settings, achievements, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `habit-tracker-backup-${formatDateShort(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.habits) { setHabits(data.habits); localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(data.habits)) }
        if (data.settings) { setSettings(data.settings); localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings)) }
        if (data.achievements) { setAchievements(data.achievements); localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements)) }
      } catch { alert("Invalid backup file") }
    }
    reader.readAsText(file)
  }

  const resetAllData = () => {
    if (confirm("This will delete ALL your data. Are you sure?")) {
      localStorage.clear()
      setHabits(getDefaultHabits())
      setSettings(DEFAULT_SETTINGS)
      setAchievements([])
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, "true")
    }
  }

  const activeHabits = habits.filter(h => !h.archived)
  const today = getToday()

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const weekStart = getWeekStart(currentDate)
    return addDays(weekStart, i)
  })

  const monthDays = (() => {
    const start = getMonthStart(currentDate)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    const days: Date[] = []
    let d = new Date(start)
    while (d <= end) { days.push(new Date(d)); d = addDays(d, 1) }
    return days
  })()

  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = addDays(new Date(), -29 + i)
      return { date: formatDate(d, { month: "short", day: "numeric" }), day: d.toISOString().split("T")[0] }
    })
    return last30Days.map(d => {
      const completed = activeHabits.filter(h => h.completedDates.includes(d.day)).length
      const total = activeHabits.length
      return { ...d, completed, total, rate: total > 0 ? Math.round((completed / total) * 100) : 0 }
    })
  }, [activeHabits])

  const categoryData = useMemo(() => {
    return CATEGORIES.map(c => {
      const count = activeHabits.filter(h => h.category === c.id).length
      const completed = activeHabits.filter(h => h.category === c.id && h.completedDates.includes(today)).length
      return { category: c.label, count, completed, color: c.color.replace("bg-", "") }
    }).filter(c => c.count > 0)
  }, [activeHabits, today])

  const streakData = useMemo(() => {
    return activeHabits.map(h => ({ name: h.name.length > 15 ? h.name.slice(0, 15) + "..." : h.name, streak: h.streak, best: h.bestStreak, color: getCategory(h.category).color.replace("bg-", "") }))
  }, [activeHabits])

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => { setShowOnboarding(false); localStorage.setItem(STORAGE_KEYS.ONBOARDING, "true") }} onboardingStep={onboardingStep} setOnboardingStep={setOnboardingStep} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header
        userName={session?.user?.name || "User"}
        onMenuClick={() => setShowSettings(true)}
        onAddClick={() => setShowAddHabit(true)}
        theme={settings.theme}
        onThemeChange={(t: "light" | "dark" | "system") => setSettings(prev => ({ ...prev, theme: t }))}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <StatsOverview stats={stats} />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <HabitsList
                habits={activeHabits}
                viewMode={viewMode}
                currentDate={currentDate}
                weekDays={weekDays}
                monthDays={monthDays}
                onToggle={toggleHabit}
                onEdit={startEdit}
                onDelete={deleteHabit}
                onArchive={archiveHabit}
                editingHabit={editingHabit}
                editName={editName}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingHabit(null)}
                onSetEditName={setEditName}
                settings={settings}
              />

              <ViewModeTabs viewMode={viewMode} onChange={setViewMode} />
              <DateNavigator
                viewMode={viewMode}
                currentDate={currentDate}
                onNavigate={viewMode === "day" ? navigateDate : viewMode === "week" ? navigateWeek : navigateMonth}
              />
            </div>

            <div className="space-y-6">
              <QuickActions
                onAddClick={() => setShowAddHabit(true)}
                onTemplatesClick={() => setShowTemplates(true)}
                onExportClick={exportData}
              />

              <ChartsSection
                chartData={chartData}
                categoryData={categoryData}
                streakData={streakData}
                activeHabits={activeHabits}
              />

              <AchievementsWidget
                achievements={achievements}
                allAchievements={ACHIEVEMENTS}
                stats={stats}
                onClick={() => setShowAchievements(true)}
              />
            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showAddHabit && (
          <AddHabitModal
            isOpen={showAddHabit}
            onClose={() => setShowAddHabit(false)}
            onSubmit={addHabit}
            name={newHabit}
            setName={setNewHabit}
            category={newCategory}
            setCategory={setNewCategory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTemplates && (
          <TemplatesModal
            isOpen={showTemplates}
            onClose={() => setShowTemplates(false)}
            onSubmit={addFromTemplates}
            selected={selectedTemplate}
            setSelected={setSelectedTemplate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} setSettings={setSettings} onExport={exportData} onImport={importData} onReset={resetAllData} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievements && <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} achievements={achievements} allAchievements={ACHIEVEMENTS} stats={stats} />}
      </AnimatePresence>
    </div>
  )
}

function Header({ userName, onMenuClick, onAddClick, theme, onThemeChange }: any) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
            >
              <Target className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">HabitFlow</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Build better habits, one day at a time</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onThemeChange} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="primary" size="sm" onClick={onAddClick} icon={<Plus className="w-4 h-4" />}>
              New Habit
            </Button>
            <Button variant="ghost" size="sm" onClick={onMenuClick} icon={<SettingsIcon className="w-5 h-5" />} />
          </div>
        </div>
      </div>
    </header>
  )
}

function StatsOverview({ stats }: { stats: any }) {
  const statCards = [
    { label: "Active Habits", value: stats.activeHabits, icon: Target, color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Completed Today", value: stats.completedToday, icon: Check, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: Award, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Best Streak", value: stats.maxStreak, icon: Flame, color: "from-rose-500 to-pink-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Total Days", value: stats.totalCompletions, icon: Calendar, color: "from-violet-500 to-purple-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Perfect Weeks", value: stats.perfectWeeks, icon: Sparkles, color: "from-cyan-500 to-blue-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className={cn("rounded-2xl p-5 shadow-sm border", stat.bg, "border-slate-200/50 dark:border-slate-800/50")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className={cn("p-3 rounded-xl", stat.bg.replace("bg-", "bg-").replace("/20", "/30"))}>
              <stat.icon className={cn("w-6 h-6", stat.color.replace("from-", "text-").replace(" to-", ""))} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function HabitsList({ habits, viewMode, currentDate, weekDays, monthDays, onToggle, onEdit, onDelete, onArchive, editingHabit, editName, onSaveEdit, onCancelEdit, onSetEditName, settings }: any) {
  const today = new Date().toISOString().split("T")[0]

  if (viewMode === "day") {
    return (
      <Card variant="glass">
        <CardContent className="p-0">
          {habits.length === 0 ? (
            <EmptyState onAddClick={() => {}} />
          ) : (
            <AnimatePresence mode="popLayout">
              {habits.map((habit: any, i: number) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 p-4 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0",
                    "bg-white/50 dark:bg-slate-900/50",
                    habit.completedDates.includes(today) ? "bg-emerald-50/50 dark:bg-emerald-900/20" : ""
                  )}
                >
                  <HabitItem
                    habit={habit}
                    isEditing={editingHabit?.id === habit.id}
                    editName={editName}
                    onEdit={onEdit}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                    onSetEditName={onSetEditName}
                    onToggle={() => onToggle(habit.id)}
                    onDelete={() => onDelete(habit.id)}
                    onArchive={() => onArchive(habit.id)}
                    settings={settings}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    )
  }

  if (viewMode === "week") {
    return (
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-400 w-48">Habit</th>
                  {weekDays.map((day: Date) => (
                    <th key={day.toISOString()} className="text-center p-3 font-medium text-slate-500 dark:text-slate-400 w-12">
                      <div className="text-xs">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                      <div className="font-semibold">{day.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit: any) => (
                  <tr key={habit.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm", getCategory(habit.category).color)}>
                          {getCategory(habit.category).icon}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">{habit.name}</span>
                      </div>
                    </td>
                    {weekDays.map((day: Date) => {
                      const dayStr = day.toISOString().split("T")[0]
                      const done = habit.completedDates.includes(dayStr)
                      const isToday = isSameDay(day, new Date())
                      return (
                        <td key={dayStr} className="p-2 text-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                              "w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-sm font-medium cursor-pointer transition-all",
                              done ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400",
                              isToday && "ring-2 ring-blue-500"
                            )}
                            onClick={() => onToggle(habit.id)}
                          >
                            {done ? <Check className="w-4 h-4" /> : day.getDate()}
                          </motion.div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {habits.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-500">No habits yet. Add one to get started!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="glass">
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">{d}</div>
          ))}
          {monthDays.map((day: Date) => {
            const dayStr = day.toISOString().split("T")[0]
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
            const isToday = isSameDay(day, new Date())
            const completions = habits.filter((h: Habit) => h.completedDates.includes(dayStr)).length
            const total = habits.length
            const rate = total > 0 ? completions / total : 0

            return (
              <motion.div
                key={dayStr}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.random() * 0.2 }}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
                  "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                  !isCurrentMonth && "opacity-30",
                  isToday && "ring-2 ring-blue-500",
                  rate === 1 && "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300",
                  rate > 0.5 && rate < 1 && "bg-amber-100 dark:bg-amber-900/30 border-amber-300",
                  rate > 0 && rate <= 0.5 && "bg-blue-100 dark:bg-blue-900/30 border-blue-300"
                )}
              >
                <span className={cn("font-medium", isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white")}>
                  {day.getDate()}
                </span>
                {total > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: total }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded",
                          i < completions ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function HabitItem({ habit, isEditing, editName, onEdit, onSave, onCancel, onSetEditName, onToggle, onDelete, onArchive, settings }: any) {
  const cat = getCategory(habit.category)
  const today = new Date().toISOString().split("T")[0]
  const done = habit.completedDates.includes(today)

  if (isEditing) {
    return (
      <div className="flex-1 flex items-center gap-3">
        <Input
          value={editName}
          onChange={(e) => onSetEditName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          autoFocus
          className="flex-1"
        />
        <Button size="sm" onClick={onSave} variant="primary"><Check className="w-4 h-4" /></Button>
        <Button size="sm" onClick={onCancel} variant="ghost"><X className="w-4 h-4" /></Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
          done ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        )}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      >
        {done ? <Check className="w-6 h-6" /> : <span className="text-2xl">{cat.icon}</span>}
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cat.color.replace("bg-", "bg-").replace("500", "100"), "text-slate-700 dark:text-slate-300")}>
            {cat.label}
          </span>
          <h3 className={cn("font-semibold text-slate-900 dark:text-white truncate", done && "line-through text-slate-400")}>
            {habit.name}
          </h3>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
          {settings.showStreakNumbers && (
            <>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {habit.streak} day{habit.streak !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Award className="w-3.5 h-3.5" />
                Best: {habit.bestStreak}
              </span>
            </>
          )}
          <span>{habit.completedDates.length} total days</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => onEdit(habit)} aria-label="Edit">
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onArchive(habit.id)} aria-label="Archive">
          <ChevronDown className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(habit.id)} aria-label="Delete">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ onAddClick }: any) {
  return (
    <div className="text-center py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center"
      >
        <Target className="w-12 h-12 text-slate-400" />
      </motion.div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No habits yet</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Start building better habits by adding your first one</p>
      <Button onClick={onAddClick} icon={<Plus className="w-4 h-4" />} size="lg">
        Add Your First Habit
      </Button>
    </div>
  )
}

function ViewModeTabs({ viewMode, onChange }: any) {
  const modes: { value: ViewMode; label: string; icon: any }[] = [
    { value: "day", label: "Today", icon: Sun },
    { value: "week", label: "Week", icon: Calendar },
    { value: "month", label: "Month", icon: Calendar },
  ]

  return (
    <div className="flex gap-2 p-1 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
      {modes.map(mode => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            viewMode === mode.value
              ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <mode.icon className="w-4 h-4" />
          {mode.label}
        </button>
      ))}
    </div>
  )
}

function DateNavigator({ viewMode, currentDate, onNavigate }: any) {
  const format = viewMode === "day"
    ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : viewMode === "week"
    ? `${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${addDays(currentDate, 6).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="flex items-center justify-between mt-4">
      <Button variant="outline" size="sm" onClick={() => onNavigate(-1)} icon={<ChevronLeft className="w-4 h-4" />} iconPosition="left" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{format}</h3>
      <Button variant="outline" size="sm" onClick={() => onNavigate(1)} icon={<ChevronRight className="w-4 h-4" />} iconPosition="right" />
    </div>
  )
}

function QuickActions({ onAddClick, onTemplatesClick, onExportClick }: any) {
  return (
    <Card variant="glass">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
        <Button className="w-full justify-start" variant="secondary" onClick={onAddClick} icon={<Plus className="w-4 h-4" />}>
          Add New Habit
        </Button>
        <Button className="w-full justify-start" variant="outline" onClick={onTemplatesClick} icon={<Sparkles className="w-4 h-4" />}>
          Browse Templates
        </Button>
        <Button className="w-full justify-start" variant="ghost" onClick={onExportClick} icon={<Download className="w-4 h-4" />}>
          Export Data
        </Button>
      </CardContent>
    </Card>
  )
}

function ChartsSection({ chartData, categoryData, streakData, activeHabits }: any) {
  if (activeHabits.length === 0) return null

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"]

  return (
    <Card variant="glass">
      <CardContent className="p-4 space-y-6">
        <h3 className="font-semibold text-slate-900 dark:text-white">Analytics</h3>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "12px", color: "white" }}
                formatter={(value: any) => [`${value} habits`, "Completed"]}
                labelFormatter={(label: any) => label}
              />
              <Area type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#completionGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                paddingAngle={2} dataKey="count" nameKey="category"
                label={(props: any) => `${props.name}: ${props.value} (${(props.percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} habits`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {streakData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={(value: any) => [`${value} days`, "Streak"]} />
                <Bar dataKey="best" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                <Bar dataKey="streak" radius={[0, 4, 4, 0]}>
                  {streakData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AchievementsWidget({ achievements, allAchievements, stats, onClick }: { achievements: string[]; allAchievements: Achievement[]; stats: UserStats; onClick: () => void }) {
  const unlocked = allAchievements.filter(a => achievements.includes(a.id))
  const nextLocked = allAchievements.filter(a => !achievements.includes(a.id))[0]

  return (
    <Card variant="glass">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Achievements
          </h3>
          <Button size="sm" variant="ghost" onClick={onClick}>View All</Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {unlocked.slice(0, 3).map(a => (
            <motion.div
              key={a.id}
              whileHover={{ scale: 1.05 }}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center"
            >
              <span className="text-3xl">{a.icon}</span>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1">{a.name}</p>
            </motion.div>
          ))}
          {unlocked.length < 3 && Array.from({ length: 3 - unlocked.length }).map((_, i) => (
            <div key={`empty-${i}`} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-3xl opacity-30">🏆</span>
              <p className="text-xs text-slate-400 mt-1">Locked</p>
            </div>
          ))}
        </div>

        {nextLocked && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Next: <span className="font-medium text-slate-900 dark:text-white">{nextLocked.name}</span></p>
            <p className="text-xs text-slate-500 mt-1">{nextLocked.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddHabitModal({ isOpen, onClose, onSubmit, name, setName, category, setCategory }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Habit" size="md">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="space-y-4">
        <Input
          label="Habit Name"
          placeholder="e.g., Morning Meditation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  category === cat.id
                    ? "border-transparent bg-gradient-to-br"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
                style={category === cat.id ? { background: `linear-gradient(135deg, ${cat.gradient.replace("from-", "").replace(" to-", "")})` } : undefined}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={cn("text-sm font-medium", category === cat.id ? "text-white" : "text-slate-700 dark:text-slate-300")}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={!name.trim()}>Create Habit</Button>
        </div>
      </form>
    </Modal>
  )
}

function TemplatesModal({ isOpen, onClose, onSubmit, selected, setSelected }: { isOpen: boolean; onClose: () => void; onSubmit: () => void; selected: string[]; setSelected: React.Dispatch<React.SetStateAction<string[]>> }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Habit Templates" description="Choose from popular habits to get started quickly" size="lg">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {HABIT_TEMPLATES.map(template => {
          const cat = getCategory(template.category)
          const isSelected = selected.includes(template.name)
          return (
            <motion.button
              key={template.name}
              type="button"
              onClick={() => setSelected(prev => isSelected ? prev.filter(t => t !== template.name) : [...prev, template.name])}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all",
                isSelected
                  ? "border-transparent bg-gradient-to-r"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              )}
              style={isSelected ? { background: `linear-gradient(135deg, ${cat.gradient.replace("from-", "").replace(" to-", "")})` } : undefined}
            >
              <motion.div
                animate={{ scale: isSelected ? 1.1 : 1 }}
                className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", isSelected ? "bg-white/20" : cat.color.replace("bg-", "bg-"))}
              >
                {cat.icon}
              </motion.div>
              <div className="flex-1">
                <h4 className={cn("font-semibold", isSelected ? "text-white" : "text-slate-900 dark:text-white")}>
                  {template.name}
                </h4>
                <p className={cn("text-sm mt-0.5", isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
                  {template.description}
                </p>
              </div>
              {isSelected && <Check className="w-6 h-6 text-white" />}
            </motion.button>
          )
        })}
      </div>
      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={onSubmit} disabled={selected.length === 0}>
          Add {selected.length} Habit{selected.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </Modal>
  )
}

function SettingsModal({ isOpen, onClose, settings, setSettings, onExport, onImport, onReset }: { isOpen: boolean; onClose: () => void; settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>; onExport: () => void; onImport: (file: File) => void; onReset: () => void }) {
  const [importFile, setImportFile] = useState<File | null>(null)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="space-y-6 max-h-96 overflow-y-auto">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Appearance</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {["light", "dark", "system"].map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, theme: theme as any }))}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center transition-all",
                      settings.theme === theme
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Animations</p>
                <p className="text-sm text-slate-500">Smooth transitions and micro-interactions</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }))}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  settings.animationsEnabled ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                )}
              >
                <motion.div
                  animate={{ x: settings.animationsEnabled ? 24 : 2 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Data</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={onExport} icon={<Download className="w-4 h-4" />}>Export Data</Button>
            <div className="relative">
              <Button variant="outline" icon={<Upload className="w-4 h-4" />}>Import Data</Button>
              <input
                type="file"
                accept=".json"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImportFile(f); onImport(f) }}}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <Button variant="danger" onClick={onReset} className="sm:col-span-2" icon={<RefreshCw className="w-4 h-4" />}>Reset All Data</Button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">About</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">HabitFlow v2.0.0 - Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion & Recharts</p>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button variant="secondary" onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}

function AchievementsModal({ isOpen, onClose, achievements, allAchievements, stats }: { isOpen: boolean; onClose: () => void; achievements: string[]; allAchievements: Achievement[]; stats: UserStats }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Achievements" size="xl">
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allAchievements.map(a => {
            const unlocked = achievements.includes(a.id)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.random() * 0.2 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  unlocked
                    ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60"
                )}
              >
                <span className={cn("text-4xl block mb-2", unlocked ? "" : "grayscale")}>{a.icon}</span>
                <h4 className={cn("font-semibold text-sm", unlocked ? "text-slate-900 dark:text-white" : "text-slate-500")}>{a.name}</h4>
                <p className={cn("text-xs mt-1", unlocked ? "text-slate-600 dark:text-slate-400" : "text-slate-400")}>{a.description}</p>
                {unlocked && <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium"><Check className="w-3 h-3" /> Unlocked</span>}
              </motion.div>
            )
          })}
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  )
}

function OnboardingFlow({ onComplete, onboardingStep, setOnboardingStep }: any) {
  const steps = [
    { title: "Welcome to HabitFlow", description: "Build lasting habits with beautiful streaks, analytics, and achievements.", icon: Target },
    { title: "Track Daily", description: "Mark habits complete each day. Watch your streaks grow and unlock achievements.", icon: Flame },
    { title: "Visualize Progress", description: "View weekly, monthly calendars and charts to see your patterns.", icon: Calendar },
    { title: "Stay Motivated", description: "Earn badges, beat your best streaks, and build habit streaks across categories.", icon: Award },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className={cn("w-2 h-2 rounded-full transition-colors", i <= onboardingStep ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700")}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={onComplete}>Skip</Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              {(() => { const Icon = steps[onboardingStep].icon; return <Icon className="w-10 h-10 text-white" /> })()}
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{steps[onboardingStep].title}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">{steps[onboardingStep].description}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setOnboardingStep(Math.max(0, onboardingStep - 1))} disabled={onboardingStep === 0}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button className="flex-1" onClick={() => onboardingStep === steps.length - 1 ? onComplete() : setOnboardingStep(onboardingStep + 1)}>
                {onboardingStep === steps.length - 1 ? "Get Started" : "Next"} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}