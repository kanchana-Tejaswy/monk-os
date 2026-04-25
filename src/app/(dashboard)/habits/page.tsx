"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  Flame, 
  Calendar, 
  Plus, 
  Info,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  Check,
  Trash2
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { calculateStreak } from "@/lib/streak";
import { motion, AnimatePresence } from "framer-motion";

interface Habit {
  id: string;
  title: string;
  category: string;
  isNonNegotiable: boolean;
}

const DEFAULT_HABITS: Habit[] = [
  { id: "1", title: "Morning Chanting", category: "Spiritual", isNonNegotiable: true },
  { id: "2", title: "Deep Work: Coding", category: "Skill", isNonNegotiable: true },
  { id: "3", title: "45m Workout", category: "Health", isNonNegotiable: true },
  { id: "4", title: "DBMS Study", category: "Academic", isNonNegotiable: true },
];

export default function HabitTrackerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [restartDate, setRestartDate] = useState<string | null>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("General");

  useEffect(() => {
    const savedHabits = localStorage.getItem("monk_os_habits");
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      setHabits(DEFAULT_HABITS);
      localStorage.setItem("monk_os_habits", JSON.stringify(DEFAULT_HABITS));
    }

    const savedLogs = localStorage.getItem("monk_os_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
    
    const updateStreakData = () => {
      setRestartDate(localStorage.getItem("monk_os_streak_restart"));
    };
    
    updateStreakData();
    window.addEventListener("streak_updated", updateStreakData);
    return () => window.removeEventListener("streak_updated", updateStreakData);
  }, []);

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem("monk_os_habits", JSON.stringify(updatedHabits));
  };

  const dateKey = selectedDate.toISOString().split('T')[0];
  const isToday = dateKey === new Date().toISOString().split('T')[0];
  
  // 48-Hour Lock Logic
  const diffTime = Math.abs(new Date().getTime() - selectedDate.getTime());
  const diffHours = diffTime / (1000 * 60 * 60);
  const isLocked = diffHours > 48 && !isToday;

  const toggleHabit = (habitId: string) => {
    if (isLocked) return;
    
    const logKey = `${dateKey}-${habitId}`;
    const newLogs = { ...logs, [logKey]: !logs[logKey] };
    setLogs(newLogs);
    localStorage.setItem("monk_os_logs", JSON.stringify(newLogs));
    
    // Defer the event dispatch to ensure it happens after this render cycle
    setTimeout(() => {
      window.dispatchEvent(new Event("streak_updated"));
    }, 0);
  };

  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title: newHabitTitle,
      category: newHabitCategory,
      isNonNegotiable: true
    };
    const updated = [...habits, newHabit];
    saveHabits(updated);
    setNewHabitTitle("");
    setIsAddModalOpen(false);
    
    setTimeout(() => {
      window.dispatchEvent(new Event("streak_updated"));
    }, 0);
  };

  const deleteHabit = (id: string) => {
    if (confirm("Delete this habit and all its history?")) {
      const updated = habits.filter(h => h.id !== id);
      saveHabits(updated);
      
      setTimeout(() => {
        window.dispatchEvent(new Event("streak_updated"));
      }, 0);
    }
  };

  const completedCount = habits.filter(h => logs[`${dateKey}-${h.id}`]).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
  const isPerfectDay = completedCount === habits.length && habits.length > 0;
  
  const currentStreak = calculateStreak(logs, habits.map(h => h.id), restartDate);

  // Heatmap Data (Last 12 weeks)
  const heatmapDays = Array.from({ length: 84 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    const k = d.toISOString().split('T')[0];
    const isPerfect = habits.length > 0 && habits.every(h => logs[`${k}-${h.id}`]);
    const completionRate = habits.length > 0 
      ? habits.filter(h => logs[`${k}-${h.id}`]).length / habits.length 
      : 0;
    return { date: k, completionRate, isPerfect };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Discipline Engine</h1>
          <p className="text-muted-foreground mt-1">Identity is built through non-negotiable actions.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-monk-rose/10 shadow-sm">
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
            className="p-2 hover:bg-secondary/50 rounded-xl transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-4 font-semibold text-sm min-w-[140px] text-center">
            {isToday ? "Today" : formatDate(selectedDate)}
          </div>
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
            disabled={isToday}
            className="p-2 hover:bg-secondary/50 rounded-xl transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 monk-card p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Daily Integrity</h2>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 w-full bg-secondary/30 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-700 ease-out rounded-full",
                  isPerfectDay ? "bg-monk-mint" : "bg-primary"
                )} 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span>{completedCount} of {habits.length} Tasks</span>
              {isPerfectDay && <span className="text-monk-mint flex items-center gap-1 font-bold"><Flame className="h-3 w-3" /> Perfect Day Achieved</span>}
            </div>
          </div>
          {isPerfectDay && <div className="absolute -right-20 -top-20 h-64 w-64 bg-monk-mint/10 rounded-full blur-3xl animate-pulse" />}
        </div>

        <div className="monk-card p-6 flex flex-col items-center justify-center text-center space-y-2 border-2 border-accent/20">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Flame className="h-8 w-8 text-accent" />
          </div>
          <div>
            <div className="text-3xl font-heading font-bold">{currentStreak}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            Non-Negotiables
            {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          </h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add Habit
          </button>
        </div>

        {isLocked && (
          <div className="bg-secondary/20 p-4 rounded-2xl flex items-start gap-3 border border-secondary/30">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              This day is locked. **monk os** maintains integrity by preventing back-filling habits older than 48 hours.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
          {habits.map((habit) => {
            const isCompleted = logs[`${dateKey}-${habit.id}`];
            const isEditing = editingId === habit.id;

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={habit.id}
                className={cn(
                  "group flex items-center justify-between p-5 rounded-[24px] border-2 transition-all duration-300",
                  isLocked ? "opacity-75" : "cursor-pointer",
                  isCompleted 
                    ? "bg-monk-mint/5 border-monk-mint/20" 
                    : "bg-card border-monk-rose/10 hover:border-primary/30"
                )}
                onClick={() => !isEditing && toggleHabit(habit.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-500",
                    isCompleted ? "bg-monk-mint text-white scale-110 shadow-lg shadow-monk-mint/20" : "bg-secondary/30 text-muted-foreground group-hover:scale-105"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input 
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          className="bg-background border border-primary/30 px-3 py-1 rounded-lg text-sm font-bold focus:outline-none w-full max-w-xs"
                        />
                        <button onClick={saveEdit} className="p-1 text-monk-mint hover:bg-monk-mint/10 rounded"><Check className="h-4 w-4"/></button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-primary hover:bg-primary/10 rounded"><X className="h-4 w-4"/></button>
                      </div>
                    ) : (
                      <>
                        <h3 className={cn(
                          "font-bold transition-all",
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}>{habit.title}</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{habit.category}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {!isEditing && !isLocked && (
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(habit)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit2 className="h-4 w-4"/></button>
                      <button onClick={() => deleteHabit(habit.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4"/></button>
                    </div>
                  )}
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground/50" />
                  ) : (
                    <div className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                      isCompleted ? "bg-monk-mint/20 text-monk-mint" : "bg-secondary/20 text-muted-foreground"
                    )}>
                      {isCompleted ? "Completed" : "Pending"}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      </section>

      {/* LeetCode Style Heatmap */}
      <section className="monk-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-bold text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Consistency Heatmap
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded bg-secondary/20" />
              <div className="h-3 w-3 rounded bg-monk-mint/20" />
              <div className="h-3 w-3 rounded bg-monk-mint/40" />
              <div className="h-3 w-3 rounded bg-monk-mint/70" />
              <div className="h-3 w-3 rounded bg-monk-mint" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
            {heatmapDays.map((day, i) => (
              <div 
                key={day.date}
                title={`${day.date}: ${Math.round(day.completionRate * 100)}%`}
                className={cn(
                  "h-3.5 w-3.5 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-help",
                  day.completionRate === 0 ? "bg-secondary/20" :
                  day.completionRate < 0.4 ? "bg-monk-mint/20" :
                  day.completionRate < 0.7 ? "bg-monk-mint/40" :
                  day.completionRate < 1 ? "bg-monk-mint/70" :
                  "bg-monk-mint shadow-[0_0_5px_rgba(199,237,230,0.5)]"
                )}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2">
          <span>{heatmapDays[0].date}</span>
          <span>Today</span>
        </div>
      </section>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md monk-card p-8 shadow-2xl border-2 border-monk-rose/20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                  <Plus className="text-primary" /> New Non-Negotiable
                </h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-secondary/20 rounded-full transition-all"><X /></button>
              </div>

              <form onSubmit={e => { e.preventDefault(); addHabit(); }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Habit Name</label>
                  <input 
                    autoFocus
                    required
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="e.g. Morning Meditation"
                    className="w-full px-5 py-4 rounded-2xl bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all font-heading font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                  <select 
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all font-soft font-bold"
                  >
                    <option>General</option>
                    <option>Health</option>
                    <option>Skill</option>
                    <option>Spiritual</option>
                    <option>Academic</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Create Habit
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
