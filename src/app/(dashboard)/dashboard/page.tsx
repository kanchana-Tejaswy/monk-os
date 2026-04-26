"use client";

import { 
  Flame, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Heart, 
  BookText,
  Play,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Wallet,
  Target,
  ShieldAlert
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
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
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
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

  useEffect(() => {
    // 1. Load Data from LocalStorage
    const savedGoals = localStorage.getItem("monk_os_goals");
    const savedHabits = localStorage.getItem("monk_os_habits");
    const savedLogs = localStorage.getItem("monk_os_logs");
    const savedFocus = localStorage.getItem("monk_os_focus");
    const savedJournal = localStorage.getItem("monk_os_journal");
    const savedTx = localStorage.getItem("monk_os_finance");
    const savedIronWill = localStorage.getItem("monk_os_iron_will");

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
    setFocusSessions(fs);
    setJournalEntries(je);
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
    const streak = calculateStreak(l, h.map((hab: Habit) => hab.id), restartDate);

    const deepWorkMinutes = fs.filter((s: FocusSession) => s.timestamp.startsWith(todayStr)).reduce((acc: number, curr: FocusSession) => acc + curr.duration, 0);
    const habitsToday = h.filter((hab: Habit) => l[`${todayStr}-${hab.id}`]).length;
    const habitCompletionRate = h.length > 0 ? (habitsToday / h.length) : 0;
    const deepWorkRate = Math.min(deepWorkMinutes / 240, 1);
    const potential = Math.round((habitCompletionRate * 60) + (deepWorkRate * 40));

    // Life Score (Long term consistency)
    const streakScore = Math.min(streak / 30, 1) * 30;
    const totalGoalProgress = g.length > 0 ? g.reduce((acc: number, cur: any) => acc + cur.progress, 0) / g.length : 0;
    const goalScore = (totalGoalProgress / 100) * 40;
    
    let historyHabitSum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      historyHabitSum += h.length > 0 ? h.filter((hab: Habit) => l[`${ds}-${hab.id}`]).length / h.length : 0;
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
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 1. Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-xs">
            <Sparkles className="h-4 w-4" /> Identity Evolution Active
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter">
            Peace be with you, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">Monk.</span>
          </h1>
          <p className="text-muted-foreground font-soft text-lg">Today is a clean slate. {stats.potential}% of your potential is currently active.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[24px] border border-monk-rose/20 shadow-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (<div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-secondary/20 flex items-center justify-center text-[10px] font-bold">M{i}</div>))}
          </div>
          <div className="pr-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Peers</div>
            <div className="text-sm font-bold">3 Monks Online</div>
          </div>
        </div>
      </header>

      {/* 2. Aura Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AuraCard label="Life Score" value={stats.lifeScore.toString()} sub="Identity Strength" icon={Sparkles} color="text-accent" glow="shadow-accent/20" bg="bg-accent/10" />
        <AuraCard label="Current Streak" value={`${stats.streak} Days`} sub={stats.streak > 0 ? "Momentum High" : "Start Today"} icon={Flame} color="text-primary" glow="shadow-primary/20" bg="bg-primary/10" />
        <AuraCard label="Deep Work" value={formatDeepWork(stats.deepWorkToday)} sub="Goal: 4h" icon={Zap} color="text-secondary" glow="shadow-secondary/20" bg="bg-secondary/10" />
        <AuraCard label="Ledger Balance" value={formatCurrency(financeData.totalBalance)} sub="Total Capital" icon={Wallet} color="text-monk-mint" glow="shadow-monk-mint/20" bg="bg-monk-mint/10" />
      </div>

      {/* 3. Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          {/* Deep Work Portal */}
          <section className="relative overflow-hidden rounded-[32px] bg-[#2E2E2E] p-8 text-white shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-heading font-bold tracking-tight">Enter Flow State.</h2>
                <p className="text-white/60 font-soft max-w-sm">Focus sessions boost your Life Score and reinforce discipline.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Coding</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Academic</span>
                </div>
              </div>
              <Link href="/focus" className="h-24 w-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl group">
                <Play className="h-10 w-10 fill-current ml-1" />
              </Link>
            </div>
          </section>

          {/* Today's Habits */}
          <section className="monk-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1"><h2 className="text-2xl font-heading font-bold">Non-Negotiables</h2><p className="text-sm text-muted-foreground">Foundation of your identity today.</p></div>
              <Link href="/habits" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">Tracker <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habits.slice(0, 4).map((habit) => {
                const isCompleted = logs[`${new Date().toISOString().split('T')[0]}-${habit.id}`];
                return (
                  <div key={habit.id} className={cn("flex items-center justify-between p-5 rounded-[24px] border-2 transition-all", isCompleted ? "bg-monk-mint/5 border-monk-mint/20" : "bg-background border-monk-rose/10")}>
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", isCompleted ? "bg-monk-mint text-white" : "bg-secondary/20 text-muted-foreground")}>{isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}</div>
                      <div><div className="font-bold text-sm">{habit.title}</div><div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{habit.category}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Financial Snapshot */}
          <section className="monk-card p-8 bg-secondary/10 border-secondary/20">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-6">Financial Pulse</h3>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-heading font-bold">{formatCurrency(financeData.monthlySpent)}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase mt-1">Spent this month</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-monk-mint uppercase mb-1">Earned: {formatCurrency(financeData.monthlyEarned)}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase">{Math.round(100 - financeData.spendingProgress)}% Surplus</div>
                </div>
              </div>
              <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${financeData.spendingProgress}%` }} transition={{ duration: 1 }} className="h-full bg-secondary rounded-full" />
              </div>
              <Link href="/finance" className="block text-center py-3 bg-white/50 hover:bg-white rounded-xl text-xs font-bold transition-all border border-monk-rose/10">Manage Ledger</Link>
            </div>
          </section>

          {/* Iron Will Summary */}
          <section className="monk-card p-8 bg-primary/5 border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Iron Will</h3>
              <Link href="/iron-will"><ChevronRight className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></Link>
            </div>
            <div className="space-y-6">
              {ironWillChallenges.length > 0 ? ironWillChallenges.map((challenge) => {
                const days = calculateIronWillDays(challenge.startDate, challenge.lastResetDate);
                return (
                  <div key={challenge.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider">{challenge.title}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mastery Active</div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-heading font-black">{days}</span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase">Days</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Active Shields</p>
                  <Link href="/iron-will" className="text-[10px] font-bold text-primary uppercase hover:underline mt-1 block">Forge Discipline</Link>
                </div>
              )}
            </div>
          </section>

          {/* Active Visions */}
          <section className="monk-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Active Visions</h3>
              <Link href="/goals"><ChevronRight className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></Link>
            </div>
            <div className="space-y-6">
              {goals.length > 0 ? goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider"><span>{goal.title}</span><span className="text-primary">{goal.progress}%</span></div>
                  <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 1 }} className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(246,193,204,0.4)]" />
                  </div>
                </div>
              )) : <div className="py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">No Active Visions</div>}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

function AuraCard({ label, value, sub, icon: Icon, color, glow, bg }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className={cn("monk-card p-6 flex flex-col justify-between h-40 shadow-xl border border-monk-rose/10 relative overflow-hidden group", glow)}>
      <div className={cn("absolute -right-4 -top-4 p-8 rounded-full opacity-0 group-hover:opacity-10 transition-all", bg)}><Icon className="h-20 w-20" /></div>
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
        <div className={cn("p-2 rounded-xl", bg)}><Icon className={cn("h-5 w-5", color)} /></div>
      </div>
      <div className="relative z-10"><div className="text-2xl font-heading font-extrabold tracking-tight">{value}</div><div className={cn("text-[10px] font-bold mt-1 uppercase tracking-widest", color)}>{sub}</div></div>
    </motion.div>
  );
}
