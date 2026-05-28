"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Plus, 
  X, 
  RotateCcw, 
  ShieldCheck, 
  Trophy,
  History,
  AlertCircle,
  Skull,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface IronWillChallenge {
  id: string;
  title: string;
  startDate: string;
  lastResetDate: string | null;
  history: { date: string; reason: string }[];
  personalBest: number;
}

export default function IronWillPage() {
  const [challenges, setChallenges] = useState<IronWillChallenge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModalId, setHistoryModalId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("monk_os_iron_will");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data if personalBest is missing
      const migrated = parsed.map((c: any) => ({
        ...c,
        personalBest: c.personalBest || 0,
        history: c.history || []
      }));
      setChallenges(migrated);
    } else {
      const defaults: IronWillChallenge[] = [
        { id: "1", title: "No Processed Sugar", startDate: new Date().toISOString(), lastResetDate: null, history: [], personalBest: 0 },
        { id: "2", title: "No Social Media Scrolling", startDate: new Date().toISOString(), lastResetDate: null, history: [], personalBest: 0 }
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
      history: [],
      personalBest: 0
    };
    save([nc, ...challenges]);
    setNewTitle("");
    setIsModalOpen(false);
  };

  const logRelapse = (id: string) => {
    const reason = prompt("Why was the streak broken? (Keep it honest, Monk)");
    if (reason === null) return;

    const updated = challenges.map(c => {
      if (c.id === id) {
        const currentStreak = calculateDays(c.startDate, c.lastResetDate);
        return {
          ...c,
          lastResetDate: new Date().toISOString(),
          history: [{ date: new Date().toISOString(), reason: reason || "No reason provided" }, ...c.history].slice(0, 50),
          personalBest: Math.max(c.personalBest, currentStreak)
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
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  };

  const viewingChallenge = challenges.find(c => c.id === historyModalId);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-bold text-foreground flex items-center gap-3">
            <ShieldAlert className="h-10 w-10 text-primary" /> Iron Will
          </h1>
          <p className="text-muted-foreground font-soft text-lg italic">&quot;You are the master of your impulses, not their slave.&quot;</p>
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
            Iron Will is for habits you want to **eliminate**. Each day you resist, your shield grows stronger. 
            Logging a relapse resets your current streak but allows you to reflect and learn from failure.
          </p>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {challenges.map((c) => {
            const currentStreak = calculateDays(c.startDate, c.lastResetDate);
            const pb = Math.max(c.personalBest, currentStreak);

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={c.id} 
                className="monk-card p-8 group relative overflow-hidden flex flex-col justify-between min-h-[400px]"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <div className="h-40 w-40 relative">
                     <Image src="/logo.png" alt="Logo Decor" fill className="object-contain" />
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Unbreakable Streak</span>
                      {c.history.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          <Skull className="h-3 w-3" /> {c.history.length} {c.history.length === 1 ? 'Relapse' : 'Relapses'}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteChallenge(c.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold tracking-tight">{c.title}</h3>
                </div>

                <div className="py-6 relative z-10 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-heading font-black tracking-tighter text-foreground">{currentStreak}</span>
                    <span className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Days</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Trophy className="h-3 w-3 text-accent" /> Personal Best: {pb} Days
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                   <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setHistoryModalId(c.id)}
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                      >
                         <History className="h-4 w-4 text-primary" /> Relapse Log
                      </button>
                      <button 
                        onClick={() => logRelapse(c.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-red-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all group/reset"
                      >
                        <RotateCcw className="h-4 w-4 group-hover/reset:rotate-[-90deg] transition-transform duration-500" />
                        Log Relapse
                      </button>
                   </div>
                   
                   {c.history.length > 0 && (
                     <div className="pt-4 border-t border-monk-rose/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Latest Lesson
                        </p>
                        <p className="text-xs italic text-muted-foreground/80 line-clamp-2">&quot;{c.history[0].reason}&quot;</p>
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

      {/* Modals */}
      <AnimatePresence>
        {/* Create Challenge Modal */}
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
                    By starting this, you commit to a long-term elimination. The streak starts now.
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

        {/* Relapse History Modal */}
        {historyModalId && viewingChallenge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg monk-card p-10 shadow-2xl border-2 border-primary/20 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h2 className="text-2xl font-heading font-bold">{viewingChallenge.title}</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Relapse History Log</p>
                </div>
                <button onClick={() => setHistoryModalId(null)} className="p-2 hover:bg-secondary/20 rounded-full transition-all"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                {viewingChallenge.history.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShieldCheck className="h-12 w-12 text-primary mx-auto opacity-20" />
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">A perfect record. The shield is unbroken.</p>
                  </div>
                ) : (
                  viewingChallenge.history.map((h, i) => (
                    <div key={i} className="relative pl-8 border-l-2 border-red-500/20 py-1">
                      <div className="absolute left-[-9px] top-2 h-4 w-4 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
                        <Calendar className="h-3 w-3" /> {new Date(h.date).toLocaleDateString()} at {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-sm italic text-muted-foreground bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                        &quot;{h.reason}&quot;
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-secondary/10 shrink-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Failures</p>
                    <p className="text-xl font-heading font-bold text-red-500">{viewingChallenge.history.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personal Best</p>
                    <p className="text-xl font-heading font-bold text-accent">{Math.max(viewingChallenge.personalBest, calculateDays(viewingChallenge.startDate, viewingChallenge.lastResetDate))} Days</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date</p>
                    <p className="text-sm font-bold">{new Date(viewingChallenge.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Streak</p>
                    <p className="text-sm font-bold">{calculateDays(viewingChallenge.startDate, viewingChallenge.lastResetDate)} Days</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
