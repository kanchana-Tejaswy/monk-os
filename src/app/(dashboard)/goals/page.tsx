"use client";

import { useState, useEffect } from "react";
import { 
  Target, 
  Flag, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  X, 
  Sparkles,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { syncManager } from "@/lib/sync/syncManager";
import { useAuth } from "@/lib/contexts/AuthContext";

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  milestones: Milestone[];
}

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Goal Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Career");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [tempMilestones, setTempMilestones] = useState<string[]>([]);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem("monk_os_goals");
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  // Persistence
  const updateGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem("monk_os_goals", JSON.stringify(newGoals));
  };

  const handleAddMilestone = () => {
    if (!milestoneInput.trim()) return;
    setTempMilestones([...tempMilestones, milestoneInput]);
    setMilestoneInput("");
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      category,
      progress: 0,
      milestones: tempMilestones.map(m => ({
        id: crypto.randomUUID(),
        title: m,
        completed: false
      }))
    };

    updateGoals([newGoal, ...goals]);
    if (user) {
      syncManager.save('tasks', 'INSERT', {
        id: newGoal.id,
        user_id: user.id,
        title: newGoal.title,
        category: newGoal.category,
        status: 'pending'
      });
    }
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setTitle("");
    setCategory("Career");
    setTempMilestones([]);
    setMilestoneInput("");
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    let finalProgress = 0;
    const newGoals = goals.map(g => {
      if (g.id !== goalId) return g;
      
      const newMilestones = g.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      
      const completedCount = newMilestones.filter(m => m.completed).length;
      const progress = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : 0;
      finalProgress = progress;
      
      return { ...g, milestones: newMilestones, progress };
    });
    
    updateGoals(newGoals);
    if (user) {
      syncManager.save('tasks', 'UPDATE', {
        id: goalId,
        status: finalProgress === 100 ? 'completed' : 'pending'
      });
    }
  };

  const deleteGoal = (id: string) => {
    if (confirm("Are you sure you want to abandon this vision?")) {
      updateGoals(goals.filter(g => g.id !== id));
      if (user) {
        syncManager.save('tasks', 'DELETE', { id });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 space-y-10 md:space-y-16 animate-in fade-in duration-700 pb-32">    

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10 text-center lg:text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 px-5 py-2 rounded-full border border-primary/10 shadow-sm mx-auto lg:mx-0">
             Vision Mapping
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold text-foreground tracking-tighter uppercase italic leading-tight">
            Identity Visions.
          </h1>
          <p className="text-text-secondary font-soft text-base md:text-xl max-w-2xl mx-auto lg:mx-0 opacity-80 leading-relaxed">
            Identity goals that give direction to your daily execution. Anchor your soul in a meaningful future.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-4 px-10 py-5 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.3em] rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 border border-white/10 w-full lg:w-auto"       
        >
          <Plus className="h-5 w-5 stroke-[2.5px]" /> Define New Vision
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12 pb-12">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={goal.id}
              className="monk-card p-6 md:p-12 border-2 border-border/50 hover:border-primary/30 transition-all flex flex-col group relative shadow-2xl hover:shadow-xl group"
            >
              <button
                onClick={() => deleteGoal(goal.id)}
                className="absolute top-6 right-6 p-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all active:scale-90"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Target className="h-6 w-6 stroke-[2.5px]" />
                    </div>
                    <div className="px-4 py-1.5 bg-secondary/50 dark:bg-white/5 rounded-full border border-border">
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em]">
                        {goal.category}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-black leading-tight tracking-tight text-text-primary italic">{goal.title}</h2>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-5xl md:text-6xl font-heading font-black text-primary tabular-nums tracking-tighter italic drop-shadow-sm">{goal.progress}%</span>
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-40">Sync Level</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-secondary/30 dark:bg-white/[0.03] rounded-full overflow-hidden mb-16 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all",
                    goal.progress === 100 ? "bg-monk-mint shadow-[0_0_15px_rgba(142,217,204,0.6)]" : "bg-primary shadow-[0_0_15px_rgba(217,167,167,0.4)]"
                  )}
                />
              </div>

              {/* Milestones */}
              <div className="space-y-8 flex-1">
                <div className="flex items-center justify-between mb-2 px-2">
                  <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] flex items-center gap-3 opacity-60">
                    <Flag className="h-3.5 w-3.5" /> Trajectory Milestones
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {goal.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                      className={cn(
                        "flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all duration-500 cursor-pointer group/item active:scale-95",
                        milestone.completed
                          ? "bg-monk-mint/[0.03] border-monk-mint/20 shadow-inner"
                          : "bg-card border-border hover:border-primary/40 hover:bg-secondary/50 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 shrink-0",
                        milestone.completed 
                          ? "bg-monk-mint text-zinc-900 scale-110 shadow-lg shadow-monk-mint/20" 
                          : "bg-secondary dark:bg-white/5 border border-border text-transparent group-hover/item:border-primary/50"
                      )}>
                        <CheckCircle2 className="h-6 w-6 stroke-[2.5px]" />
                      </div>
                      <span className={cn(
                        "text-base md:text-lg font-bold transition-all font-soft leading-tight",
                        milestone.completed ? "text-text-primary/40 line-through italic" : "text-text-primary"     
                      )}>
                        {milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(217,167,167,0.8)]" />
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">
                    {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length} Phases Synchronized
                  </span>
                </div>
                {goal.progress === 100 && (
                  <div className="px-4 py-2 bg-monk-mint/10 rounded-xl border border-monk-mint/20 flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-monk-mint" />
                    <span className="text-[10px] font-black text-monk-mint uppercase tracking-[0.2em]">Mastery Achieved</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State / Add Card */}
        {goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-10 bg-secondary/30 dark:bg-white/[0.01] rounded-[48px] border-2 border-dashed border-border px-8 group hover:border-primary/20 transition-colors"
          >
            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
              <Target className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-heading font-black text-foreground uppercase tracking-tight italic">The horizon is vast.</h3>   
              <p className="text-base md:text-xl text-text-secondary max-w-sm mx-auto font-soft leading-relaxed opacity-60">Define your first vision to begin the evolution. Your future self is waiting for initiation.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-5 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"  
            >
              Add Your First Vision
            </button>
          </motion.div>
        )}
      </div>

      {/* New Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl monk-card p-8 md:p-14 shadow-2xl border-2 border-primary/20 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />

              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tighter uppercase italic">Define Vision.</h2>
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Anchoring a New Trajectory</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="h-12 w-12 flex items-center justify-center hover:bg-secondary/50 rounded-xl transition-all text-muted-foreground hover:text-foreground active:scale-90"><X className="h-6 w-6" /></button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-8 md:space-y-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Vision Identity</label>
                    <input
                      autoFocus
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Become AI Engineer"
                      className="w-full px-6 py-5 rounded-[24px] bg-background border border-border focus:border-primary/50 focus:outline-none transition-all font-heading font-bold text-xl shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Domain Focus</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-6 py-5 rounded-[24px] bg-background border border-border focus:border-primary/50 focus:outline-none transition-all font-black uppercase text-xs tracking-widest cursor-pointer shadow-inner appearance-none"
                    >
                      <option>Career</option>
                      <option>Health</option>
                      <option>Spiritual</option>
                      <option>Wealth</option>
                      <option>Personal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Milestone Architecture</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={milestoneInput}
                      onChange={(e) => setMilestoneInput(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                      placeholder="Add a key milestone..."
                      className="flex-1 px-6 py-5 rounded-[24px] bg-background border border-border focus:border-primary/50 focus:outline-none transition-all font-soft text-lg shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="h-16 w-16 bg-primary text-primary-foreground rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center shrink-0"
                    >
                      <Plus className="h-8 w-8 stroke-[3px]" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2 max-h-[160px] overflow-y-auto no-scrollbar">
                    {tempMilestones.map((m, i) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={i}
                        className="flex items-center gap-4 px-6 py-3.5 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl border border-primary/20 shadow-sm transition-all hover:border-primary/50"
                      >
                        {m}
                        <button type="button" onClick={() => setTempMilestones(tempMilestones.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors active:scale-90 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-6 rounded-[28px] bg-primary text-primary-foreground font-black text-lg uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 border border-white/10"
                >
                  <Save className="h-6 w-6 stroke-[3px]" /> Anchor This Vision
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
