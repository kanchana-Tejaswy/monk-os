"use client";

import { 
  Flame, 
  Zap, 
  CheckCircle2, 
  Circle, 
  Play,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Wallet,
  X,
  History,
  Compass
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { calculateStreak } from "@/lib/streak";

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
}

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
}

interface Habit {
  id: string;
  title: string;
  category: string;
  isNonNegotiable: boolean;
}

interface FocusSession {
  id: string;
  mode: string;
  duration: number;
  timestamp: string;
}

interface JournalEntry {
  id: string;
  content: string;
  category: string;
  domain: string;
  date: string;
}

interface IronWillChallenge {
  id: string;
  title: string;
  startDate: string;
  lastResetDate: string | null;
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [ironWillChallenges, setIronWillChallenges] = useState<IronWillChallenge[]>([]);
  const [financeData, setFinanceData] = useState({
    totalBalance: 0,
    monthlySpent: 0,
    monthlyEarned: 0,
    spendingProgress: 0
  });

  const [stats, setStats] = useState({
    streak: 0,
    deepWorkToday: 0,
    lifeScore: 0,
    potential: 0,
    habitsCompletedToday: 0
  });

  const [ikigai, setIkigai] = useState<any>(null);

  useEffect(() => {
    // 1. Load Data from LocalStorage
    const savedGoals = localStorage.getItem("monk_os_goals");
    const savedHabits = localStorage.getItem("monk_os_habits");
    const savedLogs = localStorage.getItem("monk_os_logs");
    const savedFocus = localStorage.getItem("monk_os_focus");
    const savedJournal = localStorage.getItem("monk_os_journal");
    const savedTx = localStorage.getItem("monk_os_finance");
    const savedIronWill = localStorage.getItem("monk_os_iron_will");
    const savedIkigai = localStorage.getItem("monkos_ikigai_data");

    if (savedIkigai) {
      setIkigai(JSON.parse(savedIkigai));
    }

    const g = savedGoals ? JSON.parse(savedGoals) : [];
    const h = savedHabits ? JSON.parse(savedHabits) : [];
    const l = savedLogs ? JSON.parse(savedLogs) : {};
    const fs = savedFocus ? JSON.parse(savedFocus) : [];
    const je = savedJournal ? JSON.parse(savedJournal) : [];
    const iw = savedIronWill ? JSON.parse(savedIronWill) : [];
    const txs: Transaction[] = savedTx ? JSON.parse(savedTx) : [];

    setGoals(g.slice(0, 3));
    setHabits(h);
    setLogs(l);
    setIronWillChallenges(iw.slice(0, 2)); // Show top 2 challenges

    // --- Finance Calculations (Monthly focus) ---
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const totalBalance = txs.reduce((acc, curr) => curr.type === "credit" ? acc + curr.amount : acc - curr.amount, 0);
    const monthlyIncome = txs.filter(t => t.type === "credit" && t.date.startsWith(currentMonth)).reduce((acc, curr) => acc + curr.amount, 0);
    const monthlySpent = txs.filter(t => t.type === "debit" && t.date.startsWith(currentMonth)).reduce((acc, curr) => acc + curr.amount, 0);
    const progress = monthlyIncome > 0 ? Math.min((monthlySpent / monthlyIncome) * 100, 100) : (monthlySpent > 0 ? 100 : 0);

    setFinanceData({
      totalBalance,
      monthlySpent,
      monthlyEarned: monthlyIncome,
      spendingProgress: progress
    });

    // --- Identity Calculations ---
    const todayStr = new Date().toISOString().split('T')[0];
    const restartDate = localStorage.getItem("monk_os_streak_restart");
    const nonNegotiableHabits = h.filter((hab: Habit) => hab.isNonNegotiable);
    const streak = calculateStreak(l, nonNegotiableHabits.map((hab: Habit) => hab.id), restartDate);

    const deepWorkMinutes = fs.filter((s: FocusSession) => s.timestamp.startsWith(todayStr)).reduce((acc: number, curr: FocusSession) => acc + curr.duration, 0);
    const habitsToday = nonNegotiableHabits.filter((hab: Habit) => l[`${todayStr}-${hab.id}`]).length;
    const habitCompletionRate = nonNegotiableHabits.length > 0 ? (habitsToday / nonNegotiableHabits.length) : 0;
    const deepWorkRate = Math.min(deepWorkMinutes / 240, 1);
    const potential = Math.round((habitCompletionRate * 60) + (deepWorkRate * 40));

    // Life Score (Long term consistency)
    const streakScore = Math.min(streak / 30, 1) * 30;
    const totalGoalProgress = g.length > 0 ? g.reduce((acc: number, cur: Goal) => acc + cur.progress, 0) / g.length : 0;
    const goalScore = (totalGoalProgress / 100) * 40;
    
    let historyHabitSum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      historyHabitSum += nonNegotiableHabits.length > 0 ? nonNegotiableHabits.filter((hab: Habit) => l[`${ds}-${hab.id}`]).length / nonNegotiableHabits.length : 0;
    }
    const habitHistoryScore = (historyHabitSum / 7) * 20;

    const recentJournals = je.filter((j: JournalEntry) => {
      const jDate = new Date(j.date);
      const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return jDate >= sevenDaysAgo;
    }).length;
    const journalScore = Math.min(recentJournals / 3, 1) * 10;

    setStats({
      streak,
      deepWorkToday: deepWorkMinutes,
      lifeScore: Math.round(streakScore + goalScore + habitHistoryScore + journalScore) || 0,
      potential: potential || 0,
      habitsCompletedToday: habitsToday
    });

  }, []);

  const formatDeepWork = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateIronWillDays = (startDate: string, resetDate: string | null) => {
    const start = new Date(resetDate || startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 0. Onboarding Tutorial */}
      <OnboardingTutorial />
      
      {/* 1. Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
        <div className="space-y-3 md:space-y-4 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-bold uppercase tracking-[0.3em] text-[9px] md:text-xs">
            <Sparkles className="h-3.5 md:h-4 w-3.5 md:w-4" /> Identity Evolution Active
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tighter leading-tight">
            Peace be with you, <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">Monk.</span>
          </h1>
          <p className="text-text-secondary font-soft text-sm md:text-lg max-w-xl mx-auto lg:mx-0">
            Today is a clean slate. <span className="text-foreground font-bold">{stats.potential}%</span> of your potential is currently active.
          </p>
        </div>
      </header>

      {/* 2. Aura Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <AuraCard label="Life Score" value={stats.lifeScore.toString()} sub="Identity Strength" icon={Sparkles} color="text-accent" glow="shadow-accent/20" bg="bg-accent/10" />
        <AuraCard label="Current Streak" value={`${stats.streak} Days`} sub={stats.streak > 0 ? "Momentum High" : "Start Today"} icon={Flame} color="text-primary" glow="shadow-primary/20" bg="bg-primary/10" />
        <AuraCard label="Deep Work" value={formatDeepWork(stats.deepWorkToday)} sub="Goal: 4h" icon={Zap} color="text-secondary" glow="shadow-secondary/20" bg="bg-secondary/10" />
        <AuraCard label="Ledger Balance" value={formatCurrency(financeData.totalBalance)} sub="Total Capital" icon={Wallet} color="text-monk-mint" glow="shadow-monk-mint/20" bg="bg-monk-mint/10" />
      </div>

      {/* 3. Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {/* Deep Work Portal */}
          <section className="monk-card relative overflow-hidden p-6 md:p-10 transition-all duration-500">
            <div className="absolute top-0 right-0 h-64 md:h-80 w-64 md:w-80 bg-primary/10 dark:bg-primary/[0.05] rounded-full blur-[80px] md:blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-text-primary">Enter Flow State.</h2>
                <p className="text-text-secondary font-soft text-base md:text-lg max-w-sm leading-relaxed">
                  Focus sessions boost your Life Score and reinforce discipline.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-4 py-1.5 bg-zinc-100 dark:bg-secondary text-text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-border shadow-sm">Coding</span>
                  <span className="px-4 py-1.5 bg-zinc-100 dark:bg-secondary text-text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-border shadow-sm">Academic</span>
                </div>
              </div>
              <Link href="/focus" className="h-24 w-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl group shrink-0">
                <Play className="h-10 w-10 fill-current ml-1" />
              </Link>
            </div>
          </section>

          {/* Today's Habits */}
          <section className="monk-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-heading font-bold text-text-primary">Non-Negotiables</h2>
                <p className="text-sm text-text-secondary">Foundation of your identity today.</p>
              </div>
              <Link href="/habits" className="text-xs font-black text-primary uppercase tracking-widest hover:opacity-80 flex items-center gap-1 transition-all">
                Tracker <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habits.filter(h => h.isNonNegotiable).slice(0, 4).map((habit) => {
                const isCompleted = logs[`${new Date().toISOString().split('T')[0]}-${habit.id}`];
                return (
                  <div key={habit.id} className={cn(
                    "flex items-center justify-between p-5 rounded-[24px] border-2 transition-all", 
                    isCompleted 
                      ? "bg-monk-mint/10 border-monk-mint/30 dark:bg-monk-mint/5 dark:border-monk-mint/20" 
                      : "bg-zinc-50 dark:bg-background border-border"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all", 
                        isCompleted ? "bg-monk-mint text-white shadow-lg shadow-monk-mint/20" : "bg-white dark:bg-secondary/20 text-text-secondary shadow-sm border border-border"
                      )}>
                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text-primary">{habit.title}</div>
                        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">{habit.category}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {habits.filter(h => h.isNonNegotiable).length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-[24px] bg-zinc-50 dark:bg-secondary/20">
                  <p className="text-sm text-text-secondary italic">No non-negotiables set for today.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* Financial Snapshot */}
          <section className="monk-card p-8 shadow-sm transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Financial Pulse</h3>
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-heading font-black tracking-tight text-text-primary">{formatCurrency(financeData.monthlySpent)}</div>
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Spent this month</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-monk-mint uppercase tracking-widest mb-1">Earned: {formatCurrency(financeData.monthlyEarned)}</div>
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">{Math.round(100 - financeData.spendingProgress)}% Surplus</div>
                </div>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden border border-border">
                <motion.div initial={{ width: 0 }} animate={{ width: `${financeData.spendingProgress}%` }} transition={{ duration: 1 }} className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(246,193,204,0.3)]" />
              </div>
              <Link href="/finance" className="block text-center py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-zinc-900/10 dark:shadow-white/5">Manage Ledger</Link>
            </div>
          </section>

          {/* Iron Will Summary */}
          <section className="monk-card p-8 bg-white dark:bg-primary/5 border-border dark:border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Iron Will</h3>
              <Link href="/iron-will"><ChevronRight className="h-5 w-5 text-text-secondary hover:text-primary transition-colors" /></Link>
            </div>
            <div className="space-y-6">
              {ironWillChallenges.length > 0 ? ironWillChallenges.map((challenge) => {
                const days = calculateIronWillDays(challenge.startDate, challenge.lastResetDate);
                return (
                  <div key={challenge.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-wider text-text-primary">{challenge.title}</div>
                      <div className="text-[9px] font-bold text-text-secondary uppercase tracking-widest opacity-60">Mastery Active</div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-heading font-black text-text-primary">{days}</span>
                       <span className="text-[9px] font-bold text-text-secondary uppercase">Days</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">No Active Shields</p>
                  <Link href="/iron-will" className="text-[10px] font-bold text-primary uppercase hover:underline mt-2 block tracking-widest">Forge Discipline</Link>
                </div>
              )}
            </div>
          </section>

          {/* Ikigai Destiny */}
          <section className="monk-card p-8 bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all pointer-events-none">
              <Sparkles className="h-24 w-24 text-amber-500" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Life Direction</h3>
              <Link href="/ikigai"><ArrowRight className="h-4 w-4 text-amber-600" /></Link>
            </div>
            
            {ikigai ? (
              <div className="space-y-5">
                <p className="text-sm font-heading font-bold italic leading-relaxed text-zinc-800 dark:text-foreground/80">
                  "{ikigai.result?.ikigaiStatement || ikigai.dimensions?.skill?.answers?.[0] || 'Unmapped destiny'}"
                </p>
                <div className="flex flex-wrap gap-2">
                  {(ikigai.result?.strengths || ikigai.dimensions?.skill?.answers || []).slice(0, 3).map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-500 text-[9px] font-black uppercase rounded-md border border-amber-500/20">
                      {s}
                    </span>
                  ))}
                </div>
                <Link href="/ikigai" className="block text-center py-2.5 text-[9px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-500/10 rounded-xl border border-amber-500/10 transition-all">
                  Recalculate Ikigai
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Your purpose is unmapped</p>
                <Link href="/ikigai" className="inline-block px-5 py-2.5 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-amber-500/20">
                  Begin Discovery
                </Link>
              </div>
            )}
          </section>

          {/* Active Visions */}
          <section className="monk-card p-8 bg-white dark:bg-card border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Active Visions</h3>
              <Link href="/goals"><ChevronRight className="h-5 w-5 text-text-secondary hover:text-primary transition-colors" /></Link>
            </div>
            <div className="space-y-6">
              {goals.length > 0 ? goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-text-primary">{goal.title}</span>
                    <span className="text-primary">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 1 }} className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(246,193,204,0.4)]" />
                  </div>
                </div>
              )) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">No Active Visions</p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

interface AuraCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  glow: string;
  bg: string;
}

function AuraCard({ label, value, sub, icon: Icon, color, glow, bg }: AuraCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} className={cn("monk-card p-6 flex flex-col justify-between h-40 shadow-xl border border-border relative overflow-hidden group", glow)}>
      <div className={cn("absolute -right-4 -top-4 p-8 rounded-full opacity-0 group-hover:opacity-10 transition-all", bg)}><Icon className="h-20 w-20" /></div>
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
        <div className={cn("p-2 rounded-xl", bg)}><Icon className={cn("h-5 w-5", color)} /></div>
      </div>
      <div className="relative z-10"><div className="text-2xl font-heading font-extrabold tracking-tight">{value}</div><div className={cn("text-[10px] font-bold mt-1 uppercase tracking-widest", color)}>{sub}</div></div>
    </motion.div>
  );
}

// --- Onboarding Component ---

function OnboardingTutorial() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("monk_mode_tutorial_seen");
    if (!seen) {
      setTimeout(() => setShow(true), 1500); // Wait for dashboard to load
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("monk_mode_tutorial_seen", "true");
    setShow(false);
  };

  const steps = [
    {
      title: "Welcome to Monk Mode.",
      description: "You've entered a digital environment designed for total focus and self-mastery. This isn't a productivity app—it's a system for identity evolution.",
      icon: Flame,
      color: "text-primary",
      bg: "bg-primary/10",
      action: "Begin Initiation"
    },
    {
      title: "The Discipline Engine",
      description: "Define your 'Non-Negotiables'. These are the daily actions that define who you are. The Integrity Score tracks your loyalty to these promises.",
      icon: CheckCircle2,
      color: "text-monk-mint",
      bg: "bg-monk-mint/10",
      action: "Next Step"
    },
    {
      title: "Identity Compass",
      description: "Use the Ikigai tool to align what you love, what you're good at, and what the world needs. This provides the 'North Star' for your dashboard.",
      icon: Compass,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      action: "Next Step"
    },
    {
      title: "The Mastery Ledger",
      description: "Every reflection you write is recorded in your monthly ledger. It's the unbiased proof of your growth, exportable for your permanent records.",
      icon: History,
      color: "text-accent",
      bg: "bg-accent/10",
      action: "Enter Flow State"
    }
  ];

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl monk-card p-10 md:p-14 relative overflow-hidden border-2 border-primary/20 shadow-[0_0_100px_rgba(246,193,204,0.15)]"
          >
            {/* Background Glow */}
            <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] transition-colors duration-1000", steps[step].bg)} />

            <button onClick={handleClose} className="absolute top-6 right-6 p-2 hover:bg-secondary/30 rounded-full transition-all text-muted-foreground"><X className="h-5 w-5" /></button>

            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-6">
                <motion.div 
                  key={step}
                  initial={{ rotate: -20, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className={cn("h-16 w-16 md:h-20 md:w-20 rounded-[28px] flex items-center justify-center shadow-inner", steps[step].bg)}
                >
                  {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className={cn("h-8 w-8 md:h-10 md:w-10", steps[step].color)} />;
                  })()}
                </motion.div>
                <div className="space-y-1">
                   <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Orientation {step + 1}/{steps.length}</div>
                   <h2 className="text-3xl font-heading font-black tracking-tighter text-foreground italic">{steps[step].title}</h2>
                </div>
              </div>

              <p className="text-lg md:text-xl text-muted-foreground font-soft leading-relaxed">
                {steps[step].description}
              </p>

              <div className="flex items-center justify-between pt-6">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === step ? "w-8 bg-primary" : "w-2 bg-secondary/40")} />
                  ))}
                </div>
                <button 
                  onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleClose()}
                  className="px-8 py-4 bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10 flex items-center gap-2"
                >
                  {steps[step].action}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
