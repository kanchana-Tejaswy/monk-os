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
  X,
  History,
  Compass,
  BookText,
  ListTodo,
  Target,
  BarChart3
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { calculateLifeScore } from "@/lib/lifeScore";

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
}

interface Habit {
  id: string;
  title: string;
  category: string;
  isNonNegotiable: boolean;
}

interface IronWillChallenge {
  id: string;
  title: string;
  startDate: string;
  lastResetDate: string | null;
}

interface Transaction {
  type: "credit" | "debit";
  amount: number | string;
  date?: string;
  created_at?: string;
}

interface FocusSession {
  timestamp?: string;
  completed_at?: string;
  duration?: number;
  duration_minutes?: number;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  status?: string;
  due_date?: string;
  date?: string;
  priority?: string;
}

interface JournalEntry {
  id: string;
  content: string;
  created_at?: string;
  date?: string;
}

interface IkigaiData {
  love_answers?: string[];
  good_at_answers?: string[];
  world_needs_answers?: string[];
  paid_for_answers?: string[];
  ikigai_statement?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [ironWillChallenges, setIronWillChallenges] = useState<IronWillChallenge[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [ikigai, setIkigai] = useState<IkigaiData | null>(null);
  const [dbStatus, setDbStatus] = useState<"connecting" | "connected" | "error">("connecting");

  const todayStr = new Date().toISOString().split('T')[0];

  // --- Centralized Life Score ---
  const lifeScore = useMemo(() => {
    return calculateLifeScore({
      habits,
      logs,
      focusSessions,
      financeTransactions: transactions,
      goals,
      tasks,
      ikigai,
      ironWill: ironWillChallenges,
      journal,
      restartDate: typeof window !== 'undefined' ? localStorage.getItem("monk_os_streak_restart") : null
    });
  }, [habits, logs, focusSessions, transactions, goals, tasks, ikigai, ironWillChallenges, journal]);

  // --- Derived Metrics ---
  const todayFocusMinutes = useMemo(() => 
    focusSessions
      .filter(s => (s.timestamp || s.completed_at || '').startsWith(todayStr))
      .reduce((acc, curr) => acc + (curr.duration || curr.duration_minutes || 0), 0)
  , [focusSessions, todayStr]);

  const weekFocusHours = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const mins = focusSessions
      .filter(s => (s.timestamp || s.completed_at || '') >= weekAgoStr)
      .reduce((acc, curr) => acc + (curr.duration || curr.duration_minutes || 0), 0);
    return Math.round((mins / 60) * 10) / 10;
  }, [focusSessions]);

  const financeMetrics = useMemo(() => {
    const currentMonth = todayStr.slice(0, 7);
    const monthTxs = transactions.filter(t => (t.date || t.created_at || '').startsWith(currentMonth));
    const totalBalance = transactions.reduce((acc, curr) => curr.type === "credit" ? acc + Number(curr.amount) : acc - Number(curr.amount), 0);
    const income = monthTxs.filter(t => t.type === 'credit').reduce((a, b) => a + Number(b.amount || 0), 0);
    const spent = monthTxs.filter(t => t.type === 'debit').reduce((a, b) => a + Number(b.amount || 0), 0);
    const savingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : (spent > 0 ? 0 : 100);
    return { totalBalance, monthlySpent: spent, monthlyEarned: income, savingsRate };
  }, [transactions, todayStr]);

  const priorityTasks = useMemo(() => 
    tasks
      .filter(t => !(t.status === 'completed' || t.completed))
      .filter(t => (t.due_date || t.date || '').startsWith(todayStr))
      .slice(0, 3)
  , [tasks, todayStr]);

  const journalStats = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const thisWeek = journal.filter(e => (e.date || e.created_at || '') >= weekAgoStr);
    return { count: thisWeek.length, last: journal[0]?.content || "No recent reflections." };
  }, [journal]);

  useEffect(() => {
    const supabase = createClient();
    
    async function initializeDashboard() {
      const safeParse = (key: string, def: string) => {
         try { return JSON.parse(localStorage.getItem(key) || def); } catch { return JSON.parse(def); }
      };
      
      setHabits(safeParse("monk_os_habits", "[]"));
      setLogs(safeParse("monk_os_logs", "{}"));
      setTransactions(safeParse("monk_os_finance", "[]"));
      setFocusSessions(safeParse("monk_os_focus", "[]"));
      setIronWillChallenges(safeParse("monk_os_iron_will", "[]"));
      setGoals(safeParse("monk_os_goals", "[]"));
      setTasks(safeParse("monk_os_todos", "[]"));
      setJournal(safeParse("monk_os_journal", "[]"));
      setIkigai(safeParse("monkos_ikigai_evolution", "null"));

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const results = await Promise.allSettled([
          supabase.from('habits').select('*'),
          supabase.from('habit_logs').select('*'),
          supabase.from('tasks').select('*'),
          supabase.from('focus_sessions').select('*'),
          supabase.from('finances').select('*'),
          supabase.from('iron_will_challenges').select('*'),
          supabase.from('ikigai_data').select('*').single(),
          supabase.from('goals').select('*'),
          supabase.from('journal_entries').select('*').order('created_at', { ascending: false })
        ]);

        if (results[0].status === 'fulfilled' && results[0].value.data) {
           setHabits(results[0].value.data.map((h: { id: string; title: string; category: string; is_non_negotiable: boolean }) => ({ 
             id: h.id, 
             title: h.title, 
             category: h.category, 
             isNonNegotiable: h.is_non_negotiable 
           })));
        }
        if (results[1].status === 'fulfilled' && results[1].value.data) {
          const l: Record<string, boolean> = {};
          results[1].value.data.forEach((log: { completed_at: string; habit_id: string }) => {
            const date = new Date(log.completed_at).toISOString().split('T')[0];
            l[`${date}-${log.habit_id}`] = true;
          });
          setLogs(l);
        }
        if (results[2].status === 'fulfilled' && results[2].value.data) setTasks(results[2].value.data);
        if (results[3].status === 'fulfilled' && results[3].value.data) setFocusSessions(results[3].value.data);
        if (results[4].status === 'fulfilled' && results[4].value.data) setTransactions(results[4].value.data);
        if (results[5].status === 'fulfilled' && results[5].value.data) setIronWillChallenges(results[5].value.data);
        if (results[6].status === 'fulfilled' && results[6].value.data) setIkigai(results[6].value.data);
        if (results[7].status === 'fulfilled' && results[7].value.data) setGoals(results[7].value.data);
        if (results[8].status === 'fulfilled' && results[8].value.data) setJournal(results[8].value.data);

        setDbStatus("connected");
      } catch (error) {
        console.error("Dashboard Background Sync Error:", error);
        setDbStatus("error");
      }
    }

    initializeDashboard();
    window.addEventListener("sync_complete", initializeDashboard);
    return () => window.removeEventListener("sync_complete", initializeDashboard);
  }, []);

  const hasData = useMemo(() => {
    return habits.length > 0 || goals.length > 0 || tasks.length > 0 || journal.length > 0 || ikigai !== null;
  }, [habits, goals, tasks, journal, ikigai]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-12 md:pb-20 animate-in fade-in duration-700">
      <OnboardingTutorial />
      
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
        <div className="space-y-4 md:space-y-5 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-[9px] md:text-xs">
              <Sparkles className="h-3.5 md:h-4 w-3.5 md:w-4" /> System Intelligence Online
            </div>
            <SyncStatusBadge status={dbStatus} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tighter leading-[1.1] text-foreground">
            Welcome, <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">
              {user?.user_metadata?.full_name?.split(' ')[0] || "Monk"}.
            </span>
          </h1>
          <p className="text-text-secondary font-soft text-sm md:text-lg max-w-xl mx-auto lg:mx-0">
            {hasData 
              ? `Current integrity alignment is ${lifeScore.current}%. Initiate focus protocols to elevate your score.`
              : "Your journey starts with a single action. Define your identity to begin."}
          </p>
        </div>
      </header>

      {!hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-4 md:px-0">
          <EmptyLaunchCard 
            title="Create First Habit" 
            desc="Forge your discipline through non-negotiable actions." 
            icon={CheckCircle2} 
            link="/habits" 
            color="text-primary"
          />
          <EmptyLaunchCard 
            title="Set First Goal" 
            desc="Anchor your soul in a meaningful future vision." 
            icon={Target} 
            link="/goals" 
            color="text-accent"
          />
          <EmptyLaunchCard 
            title="Discover Ikigai" 
            desc="Align your passion, mission, and vocation." 
            icon={Compass} 
            link="/ikigai" 
            color="text-amber-500"
          />
        </div>
      ) : (
        <>
          {/* Mobile-optimized metrics scroll */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 -mx-4 md:mx-0 md:px-0 md:pb-0 lg:grid lg:grid-cols-4 lg:gap-6 hide-scrollbar">
            <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center flex-1">
              <AuraCard label="Life Score" value={lifeScore.current.toString()} sub="Identity Evolution" icon={BarChart3} color="text-accent" glow="shadow-accent/20" bg="bg-accent/10" />
            </div>
            <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center flex-1">
              <AuraCard label="Discipline" value={`${lifeScore.discipline}%`} sub="Habit Adherence" icon={Flame} color="text-primary" glow="shadow-primary/20" bg="bg-primary/10" />
            </div>
            <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center flex-1">
              <AuraCard label="Focus" value={`${lifeScore.focus}%`} sub="Today&apos;s Depth" icon={Zap} color="text-secondary" glow="shadow-secondary/20" bg="bg-secondary/10" />
            </div>
            <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center flex-1">
              <AuraCard label="Execution" value={`${lifeScore.execution}%`} sub="Visions Realized" icon={Target} color="text-monk-mint" glow="shadow-monk-mint/20" bg="bg-monk-mint/10" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mt-4 md:mt-0 px-4 md:px-0">
            <div className="lg:col-span-8 space-y-6 md:space-y-10">
              <section className="monk-card relative overflow-hidden p-6 md:p-10">
                <div className="absolute top-0 right-0 h-40 md:h-80 w-40 md:w-80 bg-primary/10 dark:bg-primary/[0.05] rounded-full blur-[60px] md:blur-[100px] -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                  <div className="space-y-3 md:space-y-5 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-text-primary">Flow Sequence.</h2>
                    <p className="text-text-secondary font-soft text-base md:text-lg max-w-sm">
                      {todayFocusMinutes > 0 
                        ? `You&apos;ve banked ${Math.round(todayFocusMinutes/60*10)/10}h of deep work today.`
                        : "No focus recorded today. Begin initiation to unlock potential."}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2.5 md:gap-3">
                      <span className="px-4 py-2 bg-zinc-100 dark:bg-secondary text-text-primary rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">{weekFocusHours}h This Week</span>
                      <span className="px-4 py-2 bg-zinc-100 dark:bg-secondary text-text-primary rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">Intensity: High</span>
                    </div>
                  </div>
                  <Link href="/focus" className="h-20 w-20 md:h-24 md:w-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl group shrink-0 active:scale-95">
                    <Play className="h-8 w-8 md:h-10 md:w-10 fill-current ml-1" />
                  </Link>
                </div>
              </section>

              <section className="monk-card p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-text-primary">Non-Negotiables</h2>
                    <p className="text-xs md:text-sm text-text-secondary">Foundation of your identity today.</p>
                  </div>
                  <Link href="/habits" className="h-10 px-4 rounded-xl bg-primary/5 text-[11px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 flex items-center gap-1.5 transition-all">
                    Tracker <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {habits.filter(h => h.isNonNegotiable).slice(0, 4).map((habit) => {
                    const isCompleted = logs[`${todayStr}-${habit.id}`];
                    return (
                      <div key={habit.id} className={cn(
                        "flex items-center justify-between p-5 rounded-[24px] border-2 transition-all", 
                        isCompleted 
                          ? "bg-monk-mint/10 border-monk-mint/30 dark:bg-monk-mint/5 dark:border-monk-mint/20" 
                          : "bg-zinc-50 dark:bg-background border-border"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all shrink-0", 
                            isCompleted ? "bg-monk-mint text-zinc-900 shadow-lg shadow-monk-mint/20" : "bg-white dark:bg-secondary/20 text-text-secondary shadow-sm border border-border"
                          )}>
                            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                          </div>
                          <div>
                            <div className="font-bold text-[15px] text-text-primary line-clamp-1">{habit.title}</div>
                            <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">{habit.category}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {habits.filter(h => h.isNonNegotiable).length === 0 && <EmptyWidget msg="No non-negotiables set." link="/habits" action="Define Identity" />}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <section className="monk-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] flex items-center gap-2"><ListTodo className="h-3 w-3" /> Today&apos;s Priority</h3>
                    <Link href="/todos" className="h-9 w-9 flex items-center justify-center rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"><ChevronRight className="h-4 w-4 text-text-secondary" /></Link>
                  </div>
                  <div className="space-y-4">
                    {priorityTasks.length > 0 ? priorityTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-4 p-4 bg-secondary/20 dark:bg-white/[0.02] rounded-2xl border border-border/50">
                        <Circle className="h-4 w-4 text-text-secondary shrink-0" />
                        <span className="text-sm font-bold text-text-primary truncate">{t.title}</span>
                      </div>
                    )) : <EmptyWidget msg="No pending tasks today." link="/todos" action="Plan Day" compact />}
                  </div>
                </section>

                <section className="monk-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] flex items-center gap-2"><Target className="h-3 w-3" /> Active Visions</h3>
                    <Link href="/goals" className="h-9 w-9 flex items-center justify-center rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"><ChevronRight className="h-4 w-4 text-text-secondary" /></Link>
                  </div>
                  <div className="space-y-5">
                    {goals.slice(0, 2).map(g => (
                      <div key={g.id} className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-text-primary truncate mr-2">{g.title}</span>
                          <span className="text-primary">{g.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(217,167,167,0.4)]" />
                        </div>
                      </div>
                    ))}
                    {goals.length === 0 && <EmptyWidget msg="No active visions." link="/goals" action="Create Vision" compact />}
                  </div>
                </section>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6 md:space-y-10">
              <section className="monk-card p-6 md:p-8 bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 pointer-events-none">
                  <Compass className="h-16 w-16 md:h-24 md:w-24 text-amber-500" />
                </div>
                <div className="flex items-center justify-between mb-5 md:mb-6 relative z-10">
                  <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Identity Compass</h3>
                  <Link href="/ikigai" className="h-9 w-9 flex items-center justify-center rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"><ArrowRight className="h-4 w-4 text-amber-600" /></Link>
                </div>
                {ikigai ? (
                  <div className="space-y-5 relative z-10">
                    <p className="text-sm font-heading font-bold italic leading-relaxed text-zinc-800 dark:text-foreground/80">
                      &quot;{ikigai.ikigai_statement || 'Unmapped destiny'}&quot;
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest">Alignment Score</div>
                      <div className="text-xs font-black text-amber-600">{lifeScore.purpose}%</div>
                    </div>
                    <div className="h-1.5 w-full bg-amber-200 dark:bg-amber-500/20 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${lifeScore.purpose}%` }} className="h-full bg-amber-500 rounded-full" />
                    </div>
                  </div>
                ) : <EmptyWidget msg="Purpose unmapped." link="/ikigai" action="Begin Discovery" compact color="text-amber-600" />}
              </section>

              <section className="monk-card p-6 md:p-8 bg-zinc-900 text-white dark:bg-zinc-800/50 border-zinc-800 shadow-xl">
                <div className="flex items-center justify-between mb-5 md:mb-6">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2"><BookText className="h-3 w-3" /> Mastery Ledger</h3>
                  <Link href="/journal"><History className="h-4 w-4 text-white/40 hover:text-white transition-colors" /></Link>
                </div>
                <div className="space-y-5">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-sm text-white/70 italic line-clamp-3 leading-relaxed">
                      &quot;{journalStats.last}&quot;
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Reflections This Week</span>
                    <span className="text-white">{journalStats.count}</span>
                  </div>
                </div>
              </section>

              <section className="monk-card p-6 md:p-8 transition-all duration-500">
                <div className="flex items-center justify-between mb-5 md:mb-6">
                  <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Financial Pulse</h3>
                  <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", financeMetrics.savingsRate > 20 ? "bg-emerald-500" : "bg-red-500")} />
                </div>
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-heading font-black tracking-tight text-text-primary">{formatCurrency(financeMetrics.totalBalance)}</div>
                      <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1.5">Total Capital</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-black text-monk-mint uppercase tracking-widest">{financeMetrics.savingsRate}% Surplus</div>
                    </div>
                  </div>
                  <Link href="/finance" className="block text-center py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg">Manage Ledger</Link>
                </div>
              </section>

              <section className="monk-card p-6 md:p-8 bg-white dark:bg-primary/5 border-border dark:border-primary/10">
                <div className="flex items-center justify-between mb-5 md:mb-6">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Iron Will</h3>
                  <Link href="/iron-will" className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"><ChevronRight className="h-4 w-4 text-text-secondary hover:text-primary transition-colors" /></Link>
                </div>
                <div className="space-y-5">
                  {ironWillChallenges.length > 0 ? ironWillChallenges.slice(0, 2).map((challenge) => {
                    const start = new Date(challenge.lastResetDate || challenge.startDate);
                    const diff = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={challenge.id} className="flex items-center justify-between">
                        <div className="text-[11px] font-black uppercase tracking-wider text-text-primary line-clamp-1 pr-2">{challenge.title}</div>
                        <div className="flex items-center gap-2 shrink-0">
                           <span className="text-2xl font-heading font-black text-text-primary">{diff}</span>
                           <span className="text-[9px] font-bold text-text-secondary uppercase mt-1">Days</span>
                        </div>
                      </div>
                    );
                  }) : <EmptyWidget msg="No active shields." link="/iron-will" action="Forge Discipline" compact />}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
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
    <motion.div whileHover={{ y: -5 }} className={cn("monk-card p-5 md:p-6 flex flex-col justify-between h-auto min-h-[9rem] md:h-40 border border-border relative overflow-hidden group shadow-sm transition-all", glow)}>
      <div className={cn("absolute -right-2 md:-right-4 -top-2 md:-top-4 p-6 md:p-8 rounded-full opacity-0 group-hover:opacity-10 transition-all", bg)}><Icon className="h-16 w-16 md:h-20 md:w-20" /></div>
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
        <div className={cn("p-2 rounded-xl", bg)}><Icon className={cn("h-4.5 w-4.5 md:h-5 w-5", color)} /></div>
      </div>
      <div className="relative z-10">
        <div className="text-2xl md:text-2xl font-heading font-extrabold tracking-tight text-foreground">{value}</div>
        <div className={cn("text-[9px] md:text-[10px] font-bold mt-1 uppercase tracking-widest line-clamp-1", color)}>{sub}</div>
      </div>
    </motion.div>
  );
}

function SyncStatusBadge({ status }: { status: string }) {
  const config = {
    connected: { bg: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500", text: "Cloud Sync Active" },
    error: { bg: "bg-red-500/10 text-red-500", dot: "bg-red-500", text: "Sync Error" },
    connecting: { bg: "bg-zinc-500/10 text-zinc-500", dot: "bg-zinc-500", text: "Connecting..." }
  };
  const s = config[status as keyof typeof config] || config.connecting;
  return (
    <div className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5", s.bg)}>
      <div className={cn("h-1.5 w-1.5 rounded-full", s.dot, status === "connected" && "animate-pulse")} />
      {s.text}
    </div>
  );
}

interface EmptyWidgetProps {
  msg: string;
  link: string;
  action: string;
  compact?: boolean;
  color?: string;
}

function EmptyWidget({ msg, link, action, compact, color = "text-text-secondary" }: EmptyWidgetProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-[24px] bg-zinc-50/50 dark:bg-white/[0.01]", compact && "py-5")}>
      <p className={cn("text-xs font-bold uppercase tracking-widest mb-4 italic", color)}>{msg}</p>
      <Link href={link} className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-secondary dark:bg-white/5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">{action}</Link>
    </div>
  );
}

function EmptyLaunchCard({ title, desc, icon: Icon, link, color }: { title: string; desc: string; icon: React.ElementType; link: string; color: string }) {
  return (
    <Link href={link} className="group">
      <div className="monk-card p-10 h-full flex flex-col items-center text-center space-y-5 border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all">
        <div className={cn("p-5 rounded-2xl bg-secondary/50 group-hover:bg-primary/10 transition-colors", color)}>
          <Icon className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h3 className="font-heading font-black text-2xl tracking-tight text-foreground">{title}</h3>
          <p className="text-base text-text-secondary font-soft leading-relaxed">{desc}</p>
        </div>
        <div className="pt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all">
          Initialize <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function OnboardingTutorial() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("monk_mode_tutorial_seen");
    if (!seen) {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("monk_mode_tutorial_seen", "true");
    setShow(false);
  };

  const steps = [
    { title: "Welcome to Monk Mode.", description: "A system for identity evolution.", icon: Flame, color: "text-primary", bg: "bg-primary/10", action: "Begin Initiation" },
    { title: "The Discipline Engine", description: "Define your 'Non-Negotiables'.", icon: CheckCircle2, color: "text-monk-mint", bg: "bg-monk-mint/10", action: "Next Step" },
    { title: "Identity Compass", description: "Align purpose with action.", icon: Compass, color: "text-amber-500", bg: "bg-amber-500/10", action: "Next Step" },
    { title: "The Mastery Ledger", description: "Record your growth.", icon: History, color: "text-accent", bg: "bg-accent/10", action: "Enter Flow State" }
  ];

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md text-foreground">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-xl monk-card p-8 md:p-12 relative overflow-hidden border-2 border-primary/20">
            <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px]", steps[step].bg)} />
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-muted-foreground"><X className="h-6 w-6" /></button>
            <div className="relative z-10 space-y-6 md:space-y-8">
              <div className="flex items-center gap-5 md:gap-8">
                <div className={cn("h-16 w-16 md:h-20 md:w-20 rounded-[24px] md:rounded-[32px] flex items-center justify-center shrink-0", steps[step].bg)}>
                  {(() => { const Icon = steps[step].icon; return <Icon className={cn("h-8 w-8 md:h-10 md:w-10", steps[step].color)} />; })()}
                </div>
                <div>
                   <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Orientation {step + 1}/{steps.length}</div>
                   <h2 className="text-2xl md:text-3xl font-heading font-black italic">{steps[step].title}</h2>
                </div>
              </div>
              <p className="text-base md:text-xl text-muted-foreground font-soft leading-relaxed">{steps[step].description}</p>
              <div className="flex items-center justify-between pt-6 md:pt-8">
                <div className="flex gap-2">{steps.map((_, i) => <div key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-10 bg-primary" : "w-2.5 bg-secondary/40")} />)}</div>
                <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleClose()} className="px-6 py-4 md:px-10 md:py-5 bg-primary text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-[20px] flex items-center gap-2.5 shadow-lg shadow-primary/20 active:scale-95 transition-all">{steps[step].action}<ArrowRight className="h-4 w-4 md:h-5 w-5" /></button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
