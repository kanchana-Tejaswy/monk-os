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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { syncManager } from "@/lib/sync/syncManager";
import { useAuth } from "@/lib/contexts/AuthContext";

interface IronWillChallenge {
  id: string;
  title: string;
  startDate: string;
  lastResetDate: string | null;
  history: { date: string; reason: string }[];
  personalBest: number;
}

export default function IronWillPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<IronWillChallenge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModalId, setHistoryModalId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("monk_os_iron_will");
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = parsed.map((c: IronWillChallenge) => ({
        ...c,
        personalBest: c.personalBest || 0,
        history: c.history || []
      }));
      setChallenges(migrated);
    } else {
      setChallenges([]);
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
      id: crypto.randomUUID(),
      title: newTitle,
      startDate: new Date().toISOString(),
      lastResetDate: null,
      history: [],
      personalBest: 0
    };
    save([nc, ...challenges]);
    if (user) {
      syncManager.save('iron_will_challenges', 'INSERT', {
        id: nc.id,
        user_id: user.id,
        title: nc.title,
        start_date: nc.startDate,
        personal_best: nc.personalBest
      });
    }
    setNewTitle("");
    setIsModalOpen(false);
  };

  const logRelapse = (id: string) => {
    const reason = prompt("Why was the streak broken? (Keep it honest, Monk)");
    if (reason === null) return;

    const updated = challenges.map(c => {
      if (c.id === id) {
        const currentStreak = calculateDays(c.startDate, c.lastResetDate);
        const now = new Date().toISOString();
        const updatedPb = Math.max(c.personalBest, currentStreak);
        
        if (user) {
          syncManager.save('iron_will_challenges', 'UPDATE', {
            id: c.id,
            last_reset_date: now,
            personal_best: updatedPb
          });
          syncManager.save('iron_will_logs', 'INSERT', {
            challenge_id: c.id,
            user_id: user.id,
            reason: reason || "No reason provided",
            occurred_at: now
          });
        }

        return {
          ...c,
          lastResetDate: now,
          history: [{ date: now, reason: reason || "No reason provided" }, ...c.history].slice(0, 50),
          personalBest: updatedPb
        };
      }
      return c;
    });
    save(updated);
  };

  const deleteChallenge = (id: string) => {
    if (confirm("Delete this Iron Will challenge?")) {
      save(challenges.filter(c => c.id !== id));
      if (user) {
        syncManager.save('iron_will_challenges', 'DELETE', { id });
      }
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
    <div className="max-w-5xl mx-auto space-y-10 md:space-y-16 animate-in fade-in duration-700 pb-24 md:pb-24 px-4 sm:px-0">   

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center lg:text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 px-5 py-2 rounded-full border border-primary/10 shadow-sm mx-auto lg:mx-0">
             Will Protocol
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-foreground tracking-tighter uppercase italic leading-tight flex items-center justify-center lg:justify-start gap-4">  
            <ShieldAlert className="h-10 w-10 md:h-12 md:w-12 text-primary" /> Iron Will.
          </h1>
          <p className="text-text-secondary font-soft text-base md:text-xl italic max-w-2xl mx-auto lg:mx-0 opacity-80">&quot;You are the master of your impulses, not their slave.&quot;</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.3em] rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 border border-white/10 w-full lg:w-auto"
        >
          <Plus className="h-5 w-5 stroke-[2.5px]" /> Start New Challenge
        </button>
      </div>

      {/* Intro Note */}
      <div className="bg-primary/5 border-2 border-primary/10 rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm group">
        <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-700">        
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-heading font-black uppercase tracking-tight italic text-text-primary">The Rule of the Shield.</h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed font-soft max-w-2xl">
            Iron Will is for habits you want to <strong className="text-primary uppercase tracking-widest">eliminate</strong>. Each day you resist, your shield grows stronger. 
            Logging a relapse resets your current streak but allows you to reflect and learn from failure.      
          </p>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-12">
        <AnimatePresence mode="popLayout">
          {challenges.map((c) => {
            const currentStreak = calculateDays(c.startDate, c.lastResetDate);
            const pb = Math.max(c.personalBest, currentStreak);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={c.id}
                className="monk-card p-8 md:p-12 group relative overflow-hidden flex flex-col justify-between min-h-[450px] shadow-2xl border-border/50 hover:border-primary/30 transition-all"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-all duration-1000 group-hover:rotate-12 pointer-events-none">
                   <div className="h-48 w-48 relative">
                     <Image src="/monk-logo.jpeg" alt="Logo Decor" fill className="object-contain" />
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-1.5 bg-secondary/50 dark:bg-white/5 rounded-full border border-border">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-60">Identity Shield</span>
                      </div>
                      {c.history.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-500/20 shadow-sm">
                          <Skull className="h-3.5 w-3.5" /> {c.history.length} Lessons
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteChallenge(c.id)}
                      className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-all active:scale-90"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-text-primary italic leading-tight uppercase">{c.title}.</h3>
                </div>

                <div className="py-10 relative z-10 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-7xl md:text-8xl font-heading font-black tracking-tighter text-text-primary italic drop-shadow-sm">{currentStreak}</span>
                    <span className="text-xl md:text-2xl font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Days</span>
                  </div>
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-accent/10 rounded-2xl border border-accent/20 shadow-sm">
                    <Trophy className="h-4 w-4 text-accent" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Personal Best: {pb} Days</span>
                  </div>
                </div>

                <div className="flex flex-col gap-8 relative z-10 pt-8 border-t border-border/50">
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <button
                        onClick={() => setHistoryModalId(c.id)}
                        className="flex items-center gap-3 text-[10px] font-black text-text-secondary hover:text-primary uppercase tracking-[0.3em] transition-all active:scale-95 group/history"
                      >
                         <div className="h-10 w-10 rounded-xl bg-secondary dark:bg-white/5 flex items-center justify-center group-hover/history:scale-110 transition-transform">
                           <History className="h-5 w-5" />
                         </div>
                         Witness History
                      </button>
                      <button
                        onClick={() => logRelapse(c.id)}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 h-14 bg-secondary dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] transition-all group/reset active:scale-95 border border-border/50 shadow-sm"        
                      >
                        <RotateCcw className="h-5 w-5 group-hover/reset:rotate-[-90deg] transition-transform duration-700" />
                        Log Failure
                      </button>
                   </div>

                   {c.history.length > 0 && (
                     <div className="p-5 bg-secondary/30 dark:bg-white/[0.02] rounded-2xl border border-border shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-rose-500/20" />
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-3 flex items-center gap-2 opacity-60">
                          <AlertCircle className="h-3.5 w-3.5" /> Latest Contemplation
                        </p>
                        <p className="text-sm italic text-text-primary/70 line-clamp-2 leading-relaxed font-soft">&quot;{c.history[0].reason}&quot;</p>
                     </div>
                   )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {challenges.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-10 bg-secondary/30 dark:bg-white/[0.01] rounded-[48px] border-2 border-dashed border-border px-8 group hover:border-primary/20 transition-colors"
          >
            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-heading font-black text-foreground uppercase tracking-tight italic">No Active Shields.</h3>   
              <p className="text-base md:text-xl text-text-secondary max-w-sm mx-auto font-soft leading-relaxed opacity-60">Forge your discipline by identifying and eliminating destructive patterns. Your evolution demands resistance.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-5 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"  
            >
              Initialize First Shield
            </button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Create Challenge Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md monk-card p-8 md:p-12 shadow-2xl border-2 border-primary/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-heading font-black tracking-tighter uppercase italic">New Shield.</h2>
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Forging Iron Discipline</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="h-12 w-12 flex items-center justify-center hover:bg-secondary/50 rounded-xl transition-all text-muted-foreground hover:text-foreground active:scale-90"><X className="h-6 w-6" /></button>
              </div>

              <form onSubmit={addChallenge} className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Impulse to Eliminate</label>
                  <input
                    autoFocus
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Excessive Stimulation"
                    className="w-full text-2xl font-heading font-black px-6 py-5 rounded-[24px] bg-background border border-border focus:border-primary/50 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="p-6 bg-secondary/30 dark:bg-white/[0.02] rounded-[32px] border border-border flex items-start gap-4 shadow-inner">
                  <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary leading-relaxed font-soft italic">
                    By starting this challenge, you commit to <strong className="text-text-primary">absolute abstinence</strong>. The system begins tracking your integrity immediately.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-6 rounded-[28px] bg-primary text-primary-foreground font-black text-lg uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all border border-white/10"
                >
                  Anchor The Will
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Relapse History Modal */}
        {historyModalId && viewingChallenge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg monk-card p-8 md:p-12 shadow-2xl border-2 border-primary/20 max-h-[85vh] flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

              <div className="flex items-center justify-between mb-10 relative z-10 shrink-0">
                <div className="space-y-2">
                  <h2 className="text-3xl font-heading font-black tracking-tighter uppercase italic">{viewingChallenge.title}.</h2>
                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Identity Friction Log</p>
                </div>
                <button onClick={() => setHistoryModalId(null)} className="h-12 w-12 flex items-center justify-center hover:bg-secondary/50 rounded-xl transition-all text-muted-foreground hover:text-foreground active:scale-90"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar relative z-10">
                {viewingChallenge.history.length === 0 ? (
                  <div className="py-24 text-center space-y-6 opacity-40">
                    <ShieldCheck className="h-20 w-20 text-primary mx-auto shadow-inner rounded-full p-4 bg-primary/5" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-heading font-black uppercase tracking-tight">The Shield is Unbroken.</h3>
                      <p className="text-sm font-bold uppercase tracking-widest">A perfect record of discipline.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 py-2">
                    {viewingChallenge.history.map((h, i) => (
                      <div key={i} className="relative pl-12 group/history">
                        <div className="absolute left-0 top-0 bottom-[-40px] w-0.5 bg-gradient-to-b from-rose-500/20 via-border to-transparent" />
                        <div className="absolute left-[-6px] top-1 h-3.5 w-3.5 rounded-full bg-background border-[3px] border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] group-hover/history:scale-125 transition-transform" />
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                            <Calendar className="h-3.5 w-3.5" /> 
                            {new Date(h.date).toLocaleDateString('default', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="p-5 bg-secondary/30 dark:bg-white/[0.02] rounded-2xl border border-border shadow-inner group-hover/history:border-rose-500/30 transition-colors">
                            <p className="text-base italic text-text-primary leading-relaxed font-soft">
                              &quot;{h.reason}&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-10 pt-10 border-t border-border relative z-10 shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatMini label="Total Lessons" value={viewingChallenge.history.length.toString()} color="text-rose-500" />
                  <StatMini label="Personal Best" value={`${Math.max(viewingChallenge.personalBest, calculateDays(viewingChallenge.startDate, viewingChallenge.lastResetDate))}D`} color="text-accent" />
                  <StatMini label="Start Date" value={new Date(viewingChallenge.startDate).toLocaleDateString('default', { month: 'short', day: 'numeric' })} />
                  <StatMini label="Active Sync" value={`${calculateDays(viewingChallenge.startDate, viewingChallenge.lastResetDate)}D`} color="text-primary" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatMini({ label, value, color = "text-text-primary" }: { label: string, value: string, color?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60 whitespace-nowrap">{label}</p>
      <p className={cn("text-lg font-heading font-black tracking-tight italic", color)}>{value}</p>
    </div>
  );
}
