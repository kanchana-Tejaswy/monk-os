"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Lock, 
  Calendar, 
  Plus, 
  Info,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  Check,
  Trash2,
  Flame
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { calculateStreak } from "@/lib/streak";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { createClient } from "@/utils/supabase/client";
import { syncManager } from "@/lib/sync/syncManager";

interface Habit {
  id: string;
  title: string;
  category: string;
  isNonNegotiable: boolean;
}

export default function HabitTrackerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [restartDate, setRestartDate] = useState<string | null>(null);
  
  const supabase = createClient();

  const dateKey = selectedDate.toISOString().split('T')[0];
  const isToday = dateKey === new Date().toISOString().split('T')[0];
  const isLocked = new Date().getTime() - selectedDate.getTime() > 48 * 60 * 60 * 1000 && !isToday;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("General");
  const [newHabitIsNonNegotiable, setNewHabitIsNonNegotiable] = useState(true);
  
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [reflectingHabitId, setReflectingHabitId] = useState<string | null>(null);
  const [reflectionContent, setReflectionContent] = useState("");

  useEffect(() => {
    const savedHabits = localStorage.getItem("monk_os_habits");
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      // Clean slate for new users
      setHabits([]);
    }

    const savedLogs = localStorage.getItem("monk_os_logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    const savedRestart = localStorage.getItem("monk_os_restartDate");
    if (savedRestart) setRestartDate(savedRestart);
  }, []);

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem("monk_os_habits", JSON.stringify(updatedHabits));
  };

  const toggleHabit = async (habitId: string) => {
    if (isLocked) return;
    
    const logKey = `${dateKey}-${habitId}`;
    const willBeCompleted = !logs[logKey];
    const newLogs = { ...logs, [logKey]: willBeCompleted };
    
    // Cloud Sync
    if (willBeCompleted) {
      syncManager.save('habit_logs', 'UPSERT', {
        habit_id: habitId,
        completed_at: new Date(dateKey).toISOString(),
      });
    } else {
      // Create a payload that allows backend/syncManager to delete by habit_id and date
      syncManager.save('habit_logs', 'DELETE', {
        habit_id: habitId,
        completed_at: new Date(dateKey).toISOString(),
      });
    }

    setLogs(newLogs);
    localStorage.setItem("monk_os_logs", JSON.stringify(newLogs));
    
    if (willBeCompleted) {
      setReflectingHabitId(habitId);
      setReflectionContent("");
      setIsReflectionModalOpen(true);
      
      // Auto-sync to Google if connected
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        pushToGoogle(habit.title);
      }
    }

    // Defer the event dispatch to ensure it happens after this render cycle
    setTimeout(() => {
      window.dispatchEvent(new Event("streak_updated"));
    }, 0);
  };

  const pushToGoogle = async (title: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.provider_token) return; // Not connected or token expired

    try {
      await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: `[monk mode] ${title} Completed`,
            description: "Evidence of discipline recorded in monk mode.",
            start: { dateTime: new Date().toISOString() },
            end: { dateTime: new Date(new Date().getTime() + 15 * 60000).toISOString() },
          }),
        }
      );
    } catch (e) {
      console.error("Google sync error:", e);
    }
  };

  const handleSaveReflection = () => {
    if (!reflectionContent.trim() || !reflectingHabitId) {
      setIsReflectionModalOpen(false);
      return;
    }

    const savedReflections = localStorage.getItem("monk_os_reflections");
    const reflections = savedReflections ? JSON.parse(savedReflections) : {};
    
    const habit = habits.find(h => h.id === reflectingHabitId);
    const newReflection = {
      habitId: reflectingHabitId,
      habitTitle: habit?.title || "Unknown Habit",
      content: reflectionContent,
      timestamp: Date.now(),
      date: dateKey
    };

    // Cloud Sync
    syncManager.save('journal_entries', 'INSERT', {
      content: reflectionContent,
      category: 'Reflection',
      domain: habit?.category || 'General',
      created_at: new Date().toISOString()
    });

    const dayReflections = reflections[dateKey] || [];
    reflections[dateKey] = [...dayReflections, newReflection];
    
    localStorage.setItem("monk_os_reflections", JSON.stringify(reflections));
    setIsReflectionModalOpen(false);
    setReflectionContent("");
  };

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditValue(habit.title);
  };

  const saveEdit = () => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }
    const updated = habits.map(h => 
      h.id === editingId ? { ...h, title: editValue } : h
    );
    
    // Cloud Sync
    const habitToUpdate = habits.find(h => h.id === editingId);
    if (habitToUpdate) {
      syncManager.save('habits', 'UPDATE', { ...habitToUpdate, title: editValue });
    }

    saveHabits(updated);
    setEditingId(null);
    setEditValue("");
  };

  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title: newHabitTitle,
      category: newHabitCategory,
      isNonNegotiable: newHabitIsNonNegotiable
    };
    const updated = [...habits, newHabit];
    
    // Cloud Sync
    syncManager.save('habits', 'INSERT', {
      id: newHabit.id,
      title: newHabit.title,
      category: newHabit.category,
      is_non_negotiable: newHabit.isNonNegotiable
    });

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
      
      // Cloud Sync
      syncManager.save('habits', 'DELETE', { id });

      saveHabits(updated);
      
      setTimeout(() => {
        window.dispatchEvent(new Event("streak_updated"));
      }, 0);
    }
  };

  const nonNegotiableHabits = habits.filter(h => h.isNonNegotiable);
  const normalHabits = habits.filter(h => !h.isNonNegotiable);

  const nnCompletedCount = nonNegotiableHabits.filter(h => logs[`${dateKey}-${h.id}`]).length;
  
  const progress = nonNegotiableHabits.length > 0 ? (nnCompletedCount / nonNegotiableHabits.length) * 100 : 0;
  const isPerfectDay = nnCompletedCount === nonNegotiableHabits.length && nonNegotiableHabits.length > 0;
  
  const currentStreak = calculateStreak(logs, nonNegotiableHabits.map(h => h.id), restartDate);

  // Heatmap Data (Last 12 weeks)
  const heatmapDays = Array.from({ length: 84 }).map((_, _i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - _i));
    const k = d.toISOString().split('T')[0];
    const totalHabitsAtTime = habits.length; 
    const completionRate = totalHabitsAtTime > 0 
      ? habits.filter(h => logs[`${k}-${h.id}`]).length / totalHabitsAtTime 
      : 0;
    return { 
      date: k, 
      completionRate, 
      dayOfWeek: d.getDay(), 
      month: d.toLocaleString('default', { month: 'short' }),
      dayOfMonth: d.getDate()
    };
  });

  const monthLabels: { label: string, index: number }[] = [];
  let lastMonth = "";
  heatmapDays.forEach((day, i) => {
    const weekIndex = Math.floor(i / 7);
    if (day.month !== lastMonth) {
      monthLabels.push({ label: day.month, index: weekIndex });
      lastMonth = day.month;
    }
  });

  // Filter out labels that are too close to each other
  const filteredMonthLabels = monthLabels.filter((ml, i) => {
    if (i === 0) return true;
    return ml.index - monthLabels[i-1].index > 2;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-24 md:pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-text-primary italic">Discipline Engine.</h1>
          <p className="text-sm text-text-secondary font-soft">Identity is built through non-negotiable actions.</p>
        </div>

        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm transition-all duration-300">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
            className="h-11 w-11 flex items-center justify-center hover:bg-secondary/50 dark:bg-white/5 rounded-xl transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-4 font-bold text-xs md:text-sm min-w-[120px] md:min-w-[140px] text-center tracking-widest uppercase">
            {isToday ? "Today" : formatDate(selectedDate)}
          </div>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
            disabled={isToday}
            className="h-11 w-11 flex items-center justify-center hover:bg-secondary/50 dark:bg-white/5 rounded-xl transition-all duration-200 disabled:opacity-20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 monk-card p-6 md:p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="font-bold text-base md:text-lg tracking-wide uppercase opacity-60">Integrity Score</h2>
              <span className="text-2xl md:text-3xl font-heading font-black text-primary italic">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 md:h-4 w-full bg-secondary/50 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000 ease-out rounded-full",
                  isPerfectDay ? "bg-monk-mint shadow-[0_0_15px_rgba(142,217,204,0.4)]" : "bg-primary shadow-[0_0_15px_rgba(217,167,167,0.4)]"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">
              <span>{nnCompletedCount} / {nonNegotiableHabits.length} Non-Negotiables</span>
              {isPerfectDay && (
                <span className="text-monk-mint flex items-center gap-2 font-black italic">
                  <div className="h-4 w-4 relative bg-white dark:bg-white/10 rounded-sm overflow-hidden p-0.5 border border-black/5 dark:border-white/10 shadow-sm">
                    <Image src="/monk-logo.jpeg" alt="Logo" fill className="object-contain" />
                  </div>
                  Systems Optimized
                </span>
              )}
            </div>
          </div>
          {isPerfectDay && <div className="absolute -right-10 md:-right-20 -top-10 md:-top-20 h-40 md:h-64 w-40 md:w-64 bg-monk-mint/10 rounded-full blur-3xl animate-pulse" />}
        </div>

        <div className="monk-card p-6 flex flex-col items-center justify-center gap-2 border-2 border-accent/10 group hover:border-accent/30 transition-all">
          <div className="relative flex items-center justify-center">
            {currentStreak > 0 ? (
              <>
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-orange-500 blur-2xl z-0"
                />
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Flame className="h-10 w-10 text-orange-500 fill-orange-500 relative z-10 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                </motion.div>
              </>
            ) : (
              <Flame className="h-10 w-10 text-text-secondary/10 fill-transparent" />
            )}
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-heading font-black tracking-tighter text-text-primary leading-none">
              {currentStreak}
            </div>
            <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-heading font-black text-xl tracking-tight flex items-center gap-3">
              Non-Negotiables
              {isLocked && <Lock className="h-4 w-4 text-text-secondary" />}
            </h2>
            <button
              onClick={() => { setNewHabitIsNonNegotiable(true); setIsAddModalOpen(true); }}
              className="h-10 px-4 bg-primary/5 rounded-xl text-[10px] font-black text-primary flex items-center gap-2 hover:bg-primary/10 transition-all uppercase tracking-widest"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
            {nonNegotiableHabits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={!!logs[`${dateKey}-${habit.id}`]}
                isLocked={isLocked}
                isEditing={editingId === habit.id}
                editValue={editValue}
                setEditValue={setEditValue}
                startEditing={() => startEditing(habit)}
                saveEdit={saveEdit}
                cancelEditing={() => setEditingId(null)}
                deleteHabit={() => deleteHabit(habit.id)}
                toggleHabit={() => toggleHabit(habit.id)}
              />
            ))}
            {nonNegotiableHabits.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 md:p-16 border-2 border-dashed border-border rounded-[32px] bg-secondary/10 dark:bg-white/[0.01] text-center space-y-6">
                <div className="p-6 bg-primary/10 rounded-[24px] text-primary">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-heading font-black tracking-tight">No Protocols.</h3>
                  <p className="text-sm text-text-secondary max-w-[240px] mx-auto font-soft leading-relaxed">Establish your non-negotiables to anchor your identity evolution.</p>
                </div>
                <button
                  onClick={() => { setNewHabitIsNonNegotiable(true); setIsAddModalOpen(true); }}
                  className="px-10 py-5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 active:scale-95"
                >
                  <Plus className="h-5 w-5" /> Initialize First Protocol
                </button>
              </div>
            )}
            </AnimatePresence>
          </div>
        </section>

        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-heading font-black text-xl tracking-tight flex items-center gap-3 text-text-secondary">
              Maintenance
            </h2>
            <button
              onClick={() => { setNewHabitIsNonNegotiable(false); setIsAddModalOpen(true); }}
              className="h-10 px-4 bg-secondary/30 rounded-xl text-[10px] font-black text-text-secondary flex items-center gap-2 hover:bg-secondary/50 transition-all uppercase tracking-widest"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
            {normalHabits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={!!logs[`${dateKey}-${habit.id}`]}
                isLocked={isLocked}
                isEditing={editingId === habit.id}
                editValue={editValue}
                setEditValue={setEditValue}
                startEditing={() => startEditing(habit)}
                saveEdit={saveEdit}
                cancelEditing={() => setEditingId(null)}
                deleteHabit={() => deleteHabit(habit.id)}
                toggleHabit={() => toggleHabit(habit.id)}
              />
            ))}
            {normalHabits.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-[32px] bg-secondary/10 dark:bg-white/[0.01] text-center space-y-4 opacity-80">
                <p className="text-sm text-text-secondary italic font-soft">No maintenance routines active.</p>
                <button
                  onClick={() => { setNewHabitIsNonNegotiable(false); setIsAddModalOpen(true); }}
                  className="text-[10px] font-black text-text-primary uppercase tracking-widest px-8 py-3 bg-secondary/40 rounded-xl hover:bg-secondary/60 transition-all active:scale-95"
                >
                  + Forge Routine
                </button>
              </div>
            )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {isLocked && (
        <div className="bg-card p-6 rounded-[24px] flex items-start gap-4 border border-border shadow-sm">
          <Info className="h-6 w-6 text-text-secondary shrink-0" />
          <p className="text-sm text-text-secondary leading-relaxed font-soft">
            History is set. <strong className="text-text-primary">monk mode</strong> maintains integrity by preventing back-filling protocols older than 48 hours. Focus on the present.
          </p>
        </div>
      )}

      {/* Heatmap Section */}
      <section className="monk-card p-6 md:p-10 relative overflow-hidden group border-border shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 md:h-12 md:w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl tracking-tight text-text-primary">Consistency Matrix.</h2>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] opacity-60">Visualizing Cellular Growth</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] bg-secondary/30 dark:bg-white/[0.02] px-5 py-2.5 rounded-2xl border border-border">
              <span>Low</span>
              <div className="flex gap-1.5">
                <div className="h-3.5 w-3.5 rounded-[3px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5" />
                <div className="h-3.5 w-3.5 rounded-[3px] bg-primary/20 border border-primary/5" />
                <div className="h-3.5 w-3.5 rounded-[3px] bg-primary/40 border border-primary/5" />
                <div className="h-3.5 w-3.5 rounded-[3px] bg-primary/70 border border-primary/5" />
                <div className="h-3.5 w-3.5 rounded-[3px] bg-primary shadow-[0_0_12px_rgba(217,167,167,0.5)]" />
              </div>
              <span>Peak</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col relative z-10 w-full overflow-hidden">
          {habits.length > 0 ? (
            <>
              <div className="flex gap-4">
                {/* Days of week - Fixed width for perfect alignment */}
                <div className="flex flex-col justify-between py-1 text-[10px] font-black text-text-secondary opacity-30 uppercase tracking-tighter w-8 shrink-0 mt-8">
                  <span className="h-4 flex items-center">Mon</span>
                  <span className="h-4 flex items-center invisible">Tue</span>
                  <span className="h-4 flex items-center">Wed</span>
                  <span className="h-4 flex items-center invisible">Thu</span>
                  <span className="h-4 flex items-center">Fri</span>
                  <span className="h-4 flex items-center invisible">Sat</span>
                  <span className="h-4 flex items-center">Sun</span>
                </div>

                {/* Scrollable Container for both Month labels and Heatmap Grid */}
                <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
                  <div className="min-w-max">
                    {/* Months - Perfectly aligned to grid columns */}
                    <div className="flex w-full mb-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] relative h-4 overflow-hidden [--col-width:1.125rem] md:[--col-width:1.25rem]">
                      {filteredMonthLabels.map((ml, i) => (
                        <div
                          key={i}
                          className="absolute transition-all opacity-40 group-hover:opacity-100 italic"
                          style={{ left: `calc(${ml.index} * var(--col-width))` }}
                        >
                          {ml.label}
                        </div>
                      ))}
                    </div>

                    {/* Heatmap Grid */}
                    <div className="grid grid-flow-col grid-rows-7 gap-1.5 md:gap-2">
                      {heatmapDays.map((day) => (
                        <div
                          key={day.date}
                          title={`${day.date}: ${Math.round(day.completionRate * 100)}%`}
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-[3px] transition-all duration-300 hover:scale-125 hover:z-20 cursor-help border",
                            day.completionRate === 0 && "bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-white/5",
                            day.completionRate > 0 && day.completionRate < 0.4 && "bg-primary/20 border-primary/5",
                            day.completionRate >= 0.4 && day.completionRate < 0.7 && "bg-primary/40 border-primary/5",
                            day.completionRate >= 0.7 && day.completionRate < 1 && "bg-primary/70 border-primary/5",
                            day.completionRate === 1 && "bg-primary border-primary shadow-[0_0_15px_rgba(217,167,167,0.4)]"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/20 shadow-inner">
                <Calendar className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-black text-xl tracking-tight">Your consistency journey starts now.</h3>
                <p className="text-sm text-text-secondary font-soft max-w-[280px] mx-auto">Complete your first protocol to begin encoding your history.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-6 lg:hidden pointer-events-none">
        <div className="max-w-md mx-auto flex justify-center pointer-events-auto">
          <button
            onClick={() => { setNewHabitIsNonNegotiable(true); setIsAddModalOpen(true); }}
            className="flex h-14 items-center gap-3 px-8 bg-primary text-primary-foreground rounded-2xl shadow-2xl shadow-primary/40 active:scale-95 transition-all border border-white/20"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs font-black uppercase tracking-widest">New Protocol</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md monk-card p-8 md:p-10 shadow-2xl border-2 border-primary/20">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-heading font-black tracking-tight italic flex items-center gap-3"><Plus className="text-primary h-8 w-8" /> New Action.</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="h-12 w-12 flex items-center justify-center hover:bg-secondary/20 rounded-xl transition-all"><X /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); addHabit(); }} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Protocol Identity</label>
                  <input autoFocus required value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} placeholder="e.g. Morning Meditation" className="w-full px-6 py-5 rounded-2xl bg-background border border-border focus:border-primary/50 focus:outline-none transition-all font-heading font-bold text-lg shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Category</label>
                    <select value={newHabitCategory} onChange={(e) => setNewHabitCategory(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:border-primary/50 focus:outline-none transition-all font-soft font-bold text-sm shadow-inner appearance-none">
                      <option>General</option><option>Health</option><option>Skill</option><option>Spiritual</option><option>Academic</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Tier</label>
                    <button type="button" onClick={() => setNewHabitIsNonNegotiable(!newHabitIsNonNegotiable)} className={cn("w-full px-5 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] shadow-sm", newHabitIsNonNegotiable ? "bg-primary/10 border-primary text-primary shadow-primary/10" : "bg-secondary/10 border-border text-muted-foreground")}>
                      {newHabitIsNonNegotiable ? "Core" : "Routine"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all mt-4">Initialize Protocol</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReflectionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg monk-card p-8 md:p-12 shadow-2xl relative z-10 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-heading font-black tracking-tighter uppercase italic">Witness Mastery.</h2>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Protocol: {habits.find(h => h.id === reflectingHabitId)?.title}</p>
                </div>
                <button onClick={() => setIsReflectionModalOpen(false)} className="h-12 w-12 flex items-center justify-center hover:bg-secondary/50 rounded-xl transition-all text-muted-foreground hover:text-foreground active:scale-90"><X className="h-6 w-6" /></button>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Session Outcome Disclosure</label>
                  <textarea autoFocus value={reflectionContent} onChange={(e) => setReflectionContent(e.target.value)} placeholder="Specifics build discipline. Vagueness builds weakness..." className="w-full h-56 bg-secondary/20 dark:bg-white/[0.02] rounded-3xl p-6 text-lg font-soft leading-relaxed border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:opacity-30 resize-none custom-scrollbar text-foreground shadow-inner" />
                </div>
                <button onClick={handleSaveReflection} className="w-full py-5 bg-primary text-primary-foreground font-heading font-black text-lg rounded-[24px] hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 uppercase tracking-[0.2em]"><Check className="h-6 w-6 stroke-[3px]" /> Submit Evidence</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
  }

  function HabitItem({
  habit, isCompleted, isLocked, isEditing, editValue, setEditValue, startEditing, saveEdit, cancelEditing, deleteHabit, toggleHabit
  }: {
  habit: Habit; isCompleted: boolean; isLocked: boolean; isEditing: boolean; editValue: string; setEditValue: (v: string) => void; startEditing: () => void; saveEdit: () => void; cancelEditing: () => void; deleteHabit: () => void; toggleHabit: () => void;
  }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn("group flex items-center justify-between p-6 rounded-[32px] border-2 transition-all duration-500", isLocked ? "opacity-60" : "cursor-pointer", isCompleted ? "bg-monk-mint/[0.05] border-monk-mint/30 shadow-xl shadow-monk-mint/[0.05]" : "bg-card border-border hover:border-primary/40 hover:shadow-lg active:scale-[0.99]")} onClick={() => !isEditing && toggleHabit()}>
      <div className="flex items-center gap-6 flex-1">
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm shrink-0", isCompleted ? "bg-monk-mint text-zinc-900 scale-110 shadow-lg shadow-monk-mint/20" : "bg-secondary/50 dark:bg-white/[0.03] text-text-secondary group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-105")}>
          {isCompleted ? <CheckCircle2 className="h-7 w-7 stroke-[2.5px]" /> : <Plus className="h-7 w-7 stroke-[2.5px]" />}
        </div>
        <div className="flex-1 space-y-0.5">
          {isEditing ? (
            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} className="bg-background border border-primary/30 px-5 py-2.5 rounded-xl text-base font-bold focus:outline-none w-full max-w-xs transition-all shadow-inner" />
              <button onClick={saveEdit} className="h-10 w-10 flex items-center justify-center text-monk-mint hover:bg-monk-mint/10 rounded-xl transition-colors"><Check className="h-5 w-5 stroke-[2.5px]"/></button>
              <button onClick={cancelEditing} className="h-10 w-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-xl transition-colors"><X className="h-5 w-5 stroke-[2.5px]"/></button>
            </div>
          ) : (
            <>
              <h3 className={cn("font-bold text-base md:text-lg tracking-tight transition-all", isCompleted ? "text-foreground italic" : "text-text-primary")}>{habit.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-50">{habit.category}</span>
                {isCompleted && <div className="h-1 w-1 rounded-full bg-monk-mint" />}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4" onClick={e => e.stopPropagation()}>
        {!isEditing && !isLocked && (
          <div className="flex opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 gap-1">
            <button onClick={startEditing} className="h-11 w-11 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90"><Edit2 className="h-4.5 w-4.5"/></button>
            <button onClick={deleteHabit} className="h-11 w-11 flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all active:scale-90"><Trash2 className="h-4.5 w-4.5"/></button>
          </div>
        )}
        {isLocked ? <Lock className="h-5 w-5 text-text-secondary/30" /> : (
          <div className={cn("hidden sm:flex text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest transition-all shadow-sm", isCompleted ? "bg-monk-mint/20 text-monk-mint border border-monk-mint/20" : "bg-secondary/50 dark:bg-white/[0.05] text-text-secondary border border-transparent")}>
            {isCompleted ? "Protocol Active" : "Standby"}
          </div>
        )}
      </div>
    </motion.div>
  );
  }

