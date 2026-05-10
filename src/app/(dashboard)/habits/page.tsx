"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
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
  const [newHabitIsNonNegotiable, setNewHabitIsNonNegotiable] = useState(true);

  // Reflection Modal State
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [reflectionContent, setReflectionContent] = useState("");
  const [reflectingHabitId, setReflectingHabitId] = useState<string | null>(null);

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
    const willBeCompleted = !logs[logKey];
    const newLogs = { ...logs, [logKey]: willBeCompleted };
    
    setLogs(newLogs);
    localStorage.setItem("monk_os_logs", JSON.stringify(newLogs));
    
    if (willBeCompleted) {
      setReflectingHabitId(habitId);
      setReflectionContent("");
      setIsReflectionModalOpen(true);
    }

    // Defer the event dispatch to ensure it happens after this render cycle
    setTimeout(() => {
      window.dispatchEvent(new Event("streak_updated"));
    }, 0);
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
    saveHabits(updated);
    setEditingId(null);
    setEditValue("");
  };

  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title: newHabitTitle,
      category: newHabitCategory,
      isNonNegotiable: newHabitIsNonNegotiable
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

  const nonNegotiableHabits = habits.filter(h => h.isNonNegotiable);
  const normalHabits = habits.filter(h => !h.isNonNegotiable);

  const completedCount = habits.filter(h => logs[`${dateKey}-${h.id}`]).length;
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-text-primary italic">Discipline Engine</h1>
          <p className="text-text-secondary font-soft mt-1">Identity is built through non-negotiable actions.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm transition-all duration-300">
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
            className="p-2 hover:bg-secondary/50 dark:bg-white/5 rounded-xl transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-4 font-semibold text-sm min-w-[140px] text-center tracking-wide">
            {isToday ? "Today" : formatDate(selectedDate)}
          </div>
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
            disabled={isToday}
            className="p-2 hover:bg-secondary/50 dark:bg-white/5 rounded-xl transition-all duration-200 disabled:opacity-20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 monk-card p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg tracking-wide">Integrity Score</h2>
              <span className="text-base font-black text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full bg-secondary/50 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out rounded-full",
                  isPerfectDay ? "bg-monk-mint shadow-[0_0_15px_rgba(142,217,204,0.3)]" : "bg-primary shadow-[0_0_15px_rgba(217,167,167,0.3)]"
                )} 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-text-secondary font-bold uppercase tracking-[0.15em]">
              <span>{nnCompletedCount} of {nonNegotiableHabits.length} Non-Negotiables</span>
              {isPerfectDay && <span className="text-monk-mint flex items-center gap-1.5 font-black"><Flame className="h-3.5 w-3.5" /> Integrity Maintained</span>}
            </div>
          </div>
          {isPerfectDay && <div className="absolute -right-20 -top-20 h-64 w-64 bg-monk-mint/5 rounded-full blur-3xl animate-pulse" />}
        </div>

        <div className="monk-card p-8 flex flex-row lg:flex-col items-center justify-center lg:justify-center text-left lg:text-center gap-5 lg:space-y-2 border-2 border-accent/10">
          <div className="h-14 w-14 rounded-2xl bg-accent/5 flex items-center justify-center shrink-0">
            <Flame className="h-9 w-9 text-accent drop-shadow-[0_0_8px_rgba(232,197,71,0.2)]" />
          </div>
          <div>
            <div className="text-4xl font-heading font-black tracking-tight">{currentStreak}</div>
            <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-semibold text-lg tracking-wide flex items-center gap-2.5">
              Non-Negotiables
              {isLocked && <Lock className="h-4 w-4 text-text-secondary" />}
            </h2>
            <button 
              onClick={() => { setNewHabitIsNonNegotiable(true); setIsAddModalOpen(true); }}
              className="text-xs font-black text-primary flex items-center gap-1.5 hover:opacity-80 transition-all uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5" /> Add
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
              <div className="p-10 border-2 border-dashed border-border rounded-[24px] text-center bg-secondary/20 dark:bg-white/[0.02]">
                <p className="text-sm text-text-secondary italic">No non-negotiables defined.</p>
              </div>
            )}
            </AnimatePresence>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-semibold text-lg tracking-wide flex items-center gap-2.5 text-text-secondary">
              Maintenance
            </h2>
            <button 
              onClick={() => { setNewHabitIsNonNegotiable(false); setIsAddModalOpen(true); }}
              className="text-xs font-black text-text-secondary flex items-center gap-1.5 hover:text-text-primary transition-all uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5" /> Add
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
              <div className="p-10 border-2 border-dashed border-border rounded-[24px] text-center bg-secondary/20 dark:bg-white/[0.02]">
                <p className="text-sm text-text-secondary italic">No maintenance habits.</p>
              </div>
            )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {isLocked && (
        <div className="bg-card p-5 rounded-2xl flex items-start gap-3.5 border border-border shadow-sm">
          <Info className="h-5 w-5 text-text-secondary mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed font-soft">
            This day is locked. <strong className="text-text-primary">monk mode</strong> maintains integrity by preventing back-filling habits older than 48 hours.
          </p>
        </div>
      )}

      {/* Heatmap Section */}
      <section className="monk-card p-6 md:p-10 relative overflow-hidden group border-border shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg tracking-wide text-text-primary">Consistency Heatmap</h2>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">Visualizing Identity Growth</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] bg-secondary/30 dark:bg-white/[0.02] px-4 py-2 rounded-xl border border-border">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-sm bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5" />
                <div className="h-3 w-3 rounded-sm bg-primary/20 border border-primary/5" />
                <div className="h-3 w-3 rounded-sm bg-primary/40 border border-primary/5" />
                <div className="h-3 w-3 rounded-sm bg-primary/70 border border-primary/5" />
                <div className="h-3 w-3 rounded-sm bg-primary shadow-[0_0_10px_rgba(217,167,167,0.4)]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col relative z-10 w-full">
          {/* Months - Perfectly aligned to grid columns */}
          <div className="flex w-full mb-3 text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em] relative h-4 overflow-hidden" style={{ paddingLeft: '40px' }}>
            {filteredMonthLabels.map((ml, i) => (
              <div 
                key={i} 
                className="absolute transition-all opacity-40 group-hover:opacity-80" 
                style={{ left: `${40 + (ml.index * 17)}px` }}
              >
                {ml.label}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Days of week - Fixed width for perfect alignment */}
            <div className="flex flex-col justify-between py-1 text-[9px] font-black text-text-secondary opacity-30 uppercase tracking-tighter w-8 shrink-0">
              <span className="h-3 flex items-center">Mon</span>
              <span className="h-3 flex items-center invisible">Tue</span>
              <span className="h-3 flex items-center">Wed</span>
              <span className="h-3 flex items-center invisible">Thu</span>
              <span className="h-3 flex items-center">Fri</span>
              <span className="h-3 flex items-center invisible">Sat</span>
              <span className="h-3 flex items-center">Sun</span>
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
              {heatmapDays.map((day) => (
                <div 
                  key={day.date}
                  title={`${day.date}: ${Math.round(day.completionRate * 100)}%`}
                  className={cn(
                    "h-3.2 w-3.2 md:h-3.5 md:w-3.5 rounded-[2px] transition-all duration-300 hover:scale-125 hover:z-20 cursor-help border",
                    day.completionRate === 0 && "bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-white/5",
                    day.completionRate > 0 && day.completionRate < 0.4 && "bg-primary/20 border-primary/5",
                    day.completionRate >= 0.4 && day.completionRate < 0.7 && "bg-primary/40 border-primary/5",
                    day.completionRate >= 0.7 && day.completionRate < 1 && "bg-primary/70 border-primary/5",
                    day.completionRate === 1 && "bg-primary border-primary shadow-[0_0_12px_rgba(217,167,167,0.3)]"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md monk-card p-8 shadow-2xl border-2 border-monk-rose/20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold flex items-center gap-2"><Plus className="text-primary" /> New Action</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-secondary/20 rounded-full transition-all"><X /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); addHabit(); }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Habit Name</label>
                  <input autoFocus required value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} placeholder="e.g. Morning Meditation" className="w-full px-5 py-4 rounded-2xl bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all font-heading font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                    <select value={newHabitCategory} onChange={(e) => setNewHabitCategory(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all font-soft font-bold">
                      <option>General</option><option>Health</option><option>Skill</option><option>Spiritual</option><option>Academic</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</label>
                    <button type="button" onClick={() => setNewHabitIsNonNegotiable(!newHabitIsNonNegotiable)} className={cn("w-full px-5 py-4 rounded-2xl border transition-all font-bold text-sm", newHabitIsNonNegotiable ? "bg-primary/10 border-primary text-primary" : "bg-secondary/10 border-secondary text-muted-foreground")}>
                      {newHabitIsNonNegotiable ? "Non-Negotiable" : "Maintenance"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Create Habit</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReflectionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg bg-card text-card-foreground rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-heading font-black tracking-tighter uppercase italic">Witness Mastery</h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Recording: {habits.find(h => h.id === reflectingHabitId)?.title}</p>
                </div>
                <button onClick={() => setIsReflectionModalOpen(false)} className="p-2 hover:bg-secondary/50 rounded-full transition-all text-muted-foreground hover:text-foreground"><X /></button>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">What did you achieve during this session?</label>
                  <textarea autoFocus value={reflectionContent} onChange={(e) => setReflectionContent(e.target.value)} placeholder="Specifics build discipline. Vagueness builds weakness..." className="w-full h-48 bg-transparent text-xl font-soft leading-relaxed border-none focus:ring-0 placeholder:opacity-20 resize-none no-scrollbar text-foreground" />
                </div>
                <button onClick={handleSaveReflection} className="w-full py-5 bg-primary text-primary-foreground font-heading font-black text-lg rounded-3xl hover:scale-[1.01] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"><Check className="h-6 w-6" /> SUBMIT EVIDENCE</button>
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
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn("group flex items-center justify-between p-5 rounded-[24px] border-2 transition-all duration-300", isLocked ? "opacity-60" : "cursor-pointer", isCompleted ? "bg-monk-mint/[0.03] border-monk-mint/20 shadow-lg shadow-monk-mint/[0.02]" : "bg-card border-border hover:border-primary/40 hover:translate-y-[-1px]")} onClick={() => !isEditing && toggleHabit()}>
      <div className="flex items-center gap-5 flex-1">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500", isCompleted ? "bg-monk-mint text-white scale-110 shadow-lg shadow-monk-mint/20" : "bg-secondary/30 dark:bg-white/[0.03] text-text-secondary group-hover:bg-white/[0.05] group-hover:scale-105")}>
          {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} className="bg-background border border-primary/30 px-4 py-1.5 rounded-xl text-sm font-bold focus:outline-none w-full max-w-xs transition-all" />
              <button onClick={saveEdit} className="p-1.5 text-monk-mint hover:bg-monk-mint/10 rounded-lg transition-colors"><Check className="h-4 w-4"/></button>
              <button onClick={cancelEditing} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"><X className="h-4 w-4"/></button>
            </div>
          ) : (
            <>
              <h3 className={cn("font-bold text-sm tracking-tight transition-all", isCompleted ? "text-foreground" : "text-text-primary")}>{habit.title}</h3>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.15em] mt-0.5">{habit.category}</p>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
        {!isEditing && !isLocked && (
          <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button onClick={startEditing} className="p-2.5 text-text-secondary hover:text-primary transition-colors"><Edit2 className="h-4 w-4"/></button>
            <button onClick={deleteHabit} className="p-2.5 text-text-secondary hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4"/></button>
          </div>
        )}
        {isLocked ? <Lock className="h-4 w-4 text-text-secondary/50" /> : (
          <div className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all", isCompleted ? "bg-monk-mint/10 text-monk-mint" : "bg-secondary/30 dark:bg-white/[0.03] text-text-secondary")}>
            {isCompleted ? "Done" : "Pending"}
          </div>
        )}
      </div>
    </motion.div>
  );
}
