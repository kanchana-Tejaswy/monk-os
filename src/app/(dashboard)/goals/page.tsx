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
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      progress: 0,
      milestones: tempMilestones.map(m => ({
        id: Math.random().toString(36).substr(2, 9),
        title: m,
        completed: false
      }))
    };

    updateGoals([newGoal, ...goals]);
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
    const newGoals = goals.map(g => {
      if (g.id !== goalId) return g;
      
      const newMilestones = g.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      
      const completedCount = newMilestones.filter(m => m.completed).length;
      const progress = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : 0;
      
      return { ...g, milestones: newMilestones, progress };
    });
    
    updateGoals(newGoals);
  };

  const deleteGoal = (id: string) => {
    if (confirm("Are you sure you want to abandon this vision?")) {
      updateGoals(goals.filter(g => g.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 space-y-12 animate-in fade-in duration-500 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tighter">Long-Term Visions</h1>
          <p className="text-muted-foreground font-soft text-lg max-w-2xl">Identity goals that give direction to your daily execution. Anchor your soul in a meaningful future.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-bold rounded-[24px] hover:scale-105 transition-all shadow-2xl shadow-primary/30 text-lg whitespace-nowrap"
        >
          <Plus className="h-6 w-6" /> Define New Vision
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={goal.id} 
              className="monk-card p-8 md:p-12 border-2 border-transparent hover:border-primary/20 transition-all flex flex-col group relative shadow-2xl hover:shadow-primary/5"
            >
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="absolute top-8 right-8 p-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
                      <Target className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-secondary/30 text-secondary-foreground rounded-full uppercase tracking-[0.2em]">
                      {goal.category}
                    </span>
                  </div>
                  <h2 className="text-3xl font-heading font-bold leading-tight tracking-tight">{goal.title}</h2>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-heading font-extrabold text-primary tabular-nums tracking-tighter">{goal.progress}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-secondary/20 rounded-full overflow-hidden mb-12">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all shadow-[0_0_15px_rgba(246,193,204,0.6)]",
                    goal.progress === 100 ? "bg-monk-mint shadow-monk-mint/60" : "bg-primary"
                  )} 
                />
              </div>

              {/* Milestones */}
              <div className="space-y-4 flex-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Flag className="h-4 w-4" /> Trajectory Milestones
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {goal.milestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                      className={cn(
                        "flex items-center gap-5 p-5 rounded-[24px] border-2 transition-all cursor-pointer group/item",
                        milestone.completed 
                          ? "bg-monk-mint/5 border-monk-mint/20 shadow-inner" 
                          : "bg-background border-monk-rose/10 hover:border-primary/40 hover:bg-white/50"
                      )}
                    >
                      {milestone.completed ? (
                        <div className="h-8 w-8 rounded-xl bg-monk-mint flex items-center justify-center text-white scale-110 shadow-lg shadow-monk-mint/30">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-xl border-2 border-muted-foreground/20 group-hover/item:border-primary transition-colors flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary/0 group-hover/item:bg-primary/20 transition-all" />
                        </div>
                      )}
                      <span className={cn(
                        "text-lg font-medium transition-all font-soft",
                        milestone.completed ? "text-foreground line-through opacity-50" : "text-foreground"
                      )}>
                        {milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-monk-rose/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {goal.milestones.filter(m => m.completed).length} of {goal.milestones.length} Phases Synchronized
                  </span>
                </div>
                {goal.progress === 100 && (
                  <span className="text-xs font-bold text-monk-mint uppercase flex items-center gap-2 px-3 py-1 bg-monk-mint/10 rounded-lg">
                    <Sparkles className="h-4 w-4" /> Mastery Level Achieved
                  </span>
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
            className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white/30 rounded-[40px] border-2 border-dashed border-secondary/30"
          >
            <div className="h-24 w-24 bg-secondary/20 rounded-full flex items-center justify-center">
              <Target className="h-12 w-12 text-secondary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-heading font-bold text-muted-foreground">The horizon is vast.</h3>
              <p className="text-lg text-muted-foreground max-w-sm mx-auto font-soft">Define your first vision to begin the evolution. Your future self awaits.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-secondary/20 hover:bg-secondary/30 rounded-2xl font-bold transition-all"
            >
              Add Your First Vision
            </button>
          </motion.div>
        )}
      </div>

      {/* New Goal Modal (Keep Modal Padding Consistent) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl monk-card p-10 md:p-14 shadow-2xl border-2 border-monk-rose/20 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="space-y-1">
                  <h2 className="text-4xl font-heading font-bold tracking-tighter">Define Vision</h2>
                  <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Anchoring a New Identity Trajectory</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-secondary/20 rounded-2xl transition-all"><X className="h-6 w-6" /></button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">Vision Title</label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Become AI Engineer"
                      className="w-full px-6 py-5 rounded-[24px] bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all font-heading font-bold text-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">Life Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-6 py-5 rounded-[24px] bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all font-bold text-lg cursor-pointer"
                    >
                      <option>Career</option>
                      <option>Health</option>
                      <option>Spiritual</option>
                      <option>Wealth</option>
                      <option>Personal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">Milestone Roadmap</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={milestoneInput}
                      onChange={(e) => setMilestoneInput(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                      placeholder="Add a key milestone..."
                      className="flex-1 px-6 py-5 rounded-[24px] bg-background border border-monk-rose/20 focus:border-primary/50 focus:outline-none transition-all font-soft text-lg"
                    />
                    <button 
                      type="button"
                      onClick={handleAddMilestone}
                      className="p-5 bg-secondary/20 text-foreground rounded-[24px] hover:bg-secondary/30 transition-all shadow-sm"
                    >
                      <Plus className="h-7 w-7" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    {tempMilestones.map((m, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={i} 
                        className="flex items-center gap-3 px-5 py-3 bg-primary/10 text-primary font-bold text-sm rounded-2xl border border-primary/20 shadow-sm"
                      >
                        {m}
                        <button type="button" onClick={() => setTempMilestones(tempMilestones.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-6 rounded-[28px] bg-primary text-primary-foreground font-bold text-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Anchor This Vision <ArrowRight className="h-7 w-7" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
