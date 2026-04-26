"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Flame, 
  Plus, 
  X, 
  RotateCcw, 
  ShieldCheck, 
  Trophy,
  History,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface IronWillChallenge {
  id: string;
  title: string;
  startDate: string;
  lastResetDate: string | null;
  history: { date: string; reason: string }[];
}

export default function IronWillPage() {
  const [challenges, setChallenges] = useState<IronWillChallenge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("monk_os_iron_will");
    if (saved) {
      setChallenges(JSON.parse(saved));
    } else {
      const defaults: IronWillChallenge[] = [
        { id: "1", title: "No Processed Sugar", startDate: new Date().toISOString(), lastResetDate: null, history: [] },
        { id: "2", title: "No Social Media Scrolling", startDate: new Date().toISOString(), lastResetDate: null, history: [] }
      ];
      setChallenges(defaults);
      localStorage.setItem("monk_os_iron_will", JSON.stringify(defaults));
    }
  }, []);

  const save = (data: IronWillChallenge[]) => {
    setChallenges(data);
    localStorage.setItem("monk_os_iron_will", JSON.stringify(data));
  };

  const addChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const nc: IronWillChallenge = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      startDate: new Date().toISOString(),
      lastResetDate: null,
      history: []
    };
    save([nc, ...challenges]);
    setNewTitle("");
    setIsModalOpen(false);
  };

  const resetStreak = (id: string) => {
    const reason = prompt("Why was the streak broken? (Keep it honest, Monk)");
    if (reason === null) return;

    const updated = challenges.map(c => {
      if (c.id === id) {
        return {
          ...c,
          lastResetDate: new Date().toISOString(),
          history: [{ date: new Date().toISOString(), reason: reason || "No reason provided" }, ...c.history].slice(0, 10)
        };
      }
      return c;
    });
    save(updated);
  };

  const deleteChallenge = (id: string) => {
    if (confirm("Delete this Iron Will challenge?")) {
      save(challenges.filter(c => c.id !== id));
    }
  };

  const calculateDays = (startDate: string, resetDate: string | null) => {
    const start = new Date(resetDate || startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-bold text-foreground flex items-center gap-3">
            <ShieldAlert className="h-10 w-10 text-primary" /> Iron Will
          </h1>
          <p className="text-muted-foreground font-soft text-lg italic">"You are the master of your impulses, not their slave."</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
        >
          <Plus className="h-5 w-5" /> Start New Challenge
        </button>
      </div>

      {/* Intro Note */}
      <div className="bg-primary/5 border-2 border-primary/10 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">The Rule of the Shield</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Iron Will is for habits you want to **eliminate**. Unlike the Habit Tracker where you check off tasks, here the timer only stops if you fail. Each day you resist, your shield grows stronger.
          </p>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {challenges.map((c) => {
            const days = calculateDays(c.startDate, c.lastResetDate);
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={c.id} 
                className="monk-card p-8 group relative overflow-hidden flex flex-col justify-between min-h-[300px]"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Flame className="h-40 w-40" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Unbreakable Streak</span>
                    <button 
                      onClick={() => deleteChallenge(c.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold tracking-tight">{c.title}</h3>
                </div>

                <div className="py-8 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-heading font-black tracking-tighter text-foreground">{days}</span>
                    <span className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Days</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                         <History className="h-4 w-4" /> Last Break: {c.lastResetDate ? new Date(c.lastResetDate).toLocaleDateString() : 'Never'}
                      </div>
                      <button 
                        onClick={() => resetStreak(c.id)}
                        className="p-3 bg-secondary/10 hover:bg-red-500 hover:text-white rounded-xl transition-all group/reset"
                        title="I Failed (Reset Streak)"
                      >
                        <RotateCcw className="h-5 w-5 group-hover/reset:rotate-[-90deg] transition-transform duration-500" />
                      </button>
                   </div>
                   
                   {c.history.length > 0 && (
                     <div className="pt-4 border-t border-monk-rose/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Lessons from Failure
                        </p>
                        <p className="text-xs italic text-muted-foreground/80">"{c.history[0].reason}"</p>
                     </div>
                   )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {challenges.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 border-2 border-dashed border-secondary/20 rounded-[40px]">
            <Trophy className="h-16 w-16 text-muted-foreground/20 mx-auto" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest">No Active Shields. Forge your discipline.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md monk-card p-10 shadow-2xl border-2 border-primary/20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold">New Iron Will</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary/20 rounded-full transition-all"><X /></button>
              </div>

              <form onSubmit={addChallenge} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">The Impulse to Slay</label>
                  <input 
                    autoFocus
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. No Sugar, No Junk Food, No Smoking"
                    className="w-full text-xl font-heading font-bold px-0 py-4 bg-transparent border-b-2 border-monk-rose/20 focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                
                <div className="p-4 bg-secondary/10 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-secondary mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed font-soft">
                    By starting this, you commit to a lifelong or long-term elimination. The streak starts now.
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all shadow-primary/20"
                >
                  Anchor the Will
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
