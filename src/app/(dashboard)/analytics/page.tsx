"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  Zap, 
  Flame,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Compass,
  Wallet,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { calculateLifeScore, LifeScoreData } from "@/lib/lifeScore";

type ViewType = "weekly" | "monthly" | "yearly";

export default function AnalyticsPage() {
  const [viewType, setViewType] = useState<ViewType>("weekly");
  const [data, setData] = useState<LifeScoreData>({
    habits: [],
    logs: {},
    focusSessions: [],
    financeTransactions: [],
    goals: [],
    tasks: [],
    ikigai: null,
    ironWill: [],
    journal: []
  });

  const [metrics, setMetrics] = useState({
    lifeScore: 0,
    disciplineScore: 0,
    focusHours: 0,
    savingsMomentum: 0,
    consistencyTrend: [] as number[],
    focusTrend: [] as number[],
    labels: [] as string[],
    insights: [] as { text: string; icon: React.ElementType; color: string }[]
  });

  const calculateAnalytics = useCallback(() => {
    const { habits, logs, focusSessions, financeTransactions, ikigai } = data;

    let daysToTrack = 7;
    if (viewType === "monthly") daysToTrack = 30;
    if (viewType === "yearly") daysToTrack = 365;

    const dates = Array.from({ length: daysToTrack }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysToTrack - 1 - i));
      return d.toISOString().split('T')[0];
    });

    // 1. Discipline Calculation
    const dailyConsistency = dates.map(date => {
      const nn = habits.filter(h => h.isNonNegotiable || h.is_non_negotiable);
      if (nn.length === 0) return 100;
      const completed = nn.filter(h => logs[`${date}-${h.id}`]).length;
      return (completed / nn.length) * 100;
    });

    // 2. Focus Calculation
    const dailyFocus = dates.map(date => {
      const daySessions = focusSessions.filter((s: { timestamp?: string; completed_at?: string }) => (s.timestamp || s.completed_at || '').startsWith(date));
      const totalMinutes = daySessions.reduce((acc: number, curr: { duration?: number; duration_minutes?: number }) => acc + (curr.duration || curr.duration_minutes || 0), 0);
      return totalMinutes / 60; // Hours
    });

    // 3. Wealth Calculation
    const startDate = dates[0];
    const rangeTransactions = financeTransactions.filter((t: { date?: string; created_at?: string }) => (t.date || t.created_at || '') >= startDate);
    const income = rangeTransactions.filter((t) => t.type === "credit").reduce((a: number, b) => a + Number(b.amount || 0), 0);
    const spent = rangeTransactions.filter((t) => t.type === "debit").reduce((a: number, b) => a + Number(b.amount || 0), 0);
    const calculatedSavingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : (spent > 0 ? 0 : 100);
    
    // 4. Integrated Life Score (Centralized)
    const currentScore = calculateLifeScore({ ...data, restartDate: typeof window !== 'undefined' ? localStorage.getItem("monk_os_streak_restart") : null });

    // 5. Grouping for UI
    let consistencyTrend = dailyConsistency;
    let focusTrend = dailyFocus;
    let labels = dates.map(d => d.split('-').slice(1).join('/'));

    if (viewType === "yearly") {
      const months: Record<string, { discipline: number[], focus: number[] }> = {};
      dates.forEach((date, i) => {
        const monthKey = date.slice(0, 7);
        if (!months[monthKey]) months[monthKey] = { discipline: [], focus: [] };
        months[monthKey].discipline.push(dailyConsistency[i]);
        months[monthKey].focus.push(dailyFocus[i]);
      });
      const monthKeys = Object.keys(months).sort();
      consistencyTrend = monthKeys.map(m => months[m].discipline.reduce((a, b) => a + b, 0) / months[m].discipline.length);
      focusTrend = monthKeys.map(m => months[m].focus.reduce((a, b) => a + b, 0));
      labels = monthKeys.map(m => new Date(m + "-01").toLocaleString('default', { month: 'short' }));
    }

    // 6. Insight Engine
    const generatedInsights = [];
    
    // Weekend vs Weekday
    const weekendCompletion = dates.map((d, i) => ({ date: d, score: dailyConsistency[i] }))
      .filter(item => [0, 6].includes(new Date(item.date).getDay()));
    const weekdayCompletion = dates.map((d, i) => ({ date: d, score: dailyConsistency[i] }))
      .filter(item => ![0, 6].includes(new Date(item.date).getDay()));
    
    const avgWeekend = weekendCompletion.reduce((a, b) => a + b.score, 0) / (weekendCompletion.length || 1);
    const avgWeekday = weekdayCompletion.reduce((a, b) => a + b.score, 0) / (weekdayCompletion.length || 1);
    
    if (avgWeekend < avgWeekday - 15) {
      generatedInsights.push({ text: "You miss habits mostly on weekends. Guard your routine.", icon: TrendingDown, color: "text-rose-500" });
    } else if (avgWeekend > avgWeekday + 5) {
      generatedInsights.push({ text: "Your weekend discipline is superior to your work week.", icon: Sparkles, color: "text-amber-500" });
    }

    // Focus Correlation
    const totalFocus = dailyFocus.reduce((a, b) => a + b, 0);
    if (totalFocus > 20 && currentScore.discipline > 70) {
      generatedInsights.push({ text: "Deep work sessions are strongly correlated with your habit completion.", icon: Zap, color: "text-primary" });
    }

    // Purpose Alignment
    if (ikigai?.ikigai_statement) {
      generatedInsights.push({ text: `You are ${currentScore.purpose}% aligned with your stated purpose.`, icon: Compass, color: "text-amber-600" });
    }

    // Finance vs Execution
    if (currentScore.finance > currentScore.execution + 20) {
      generatedInsights.push({ text: "Your financial discipline is stronger than your execution discipline.", icon: Wallet, color: "text-emerald-500" });
    }

    setMetrics({
      lifeScore: currentScore.current,
      disciplineScore: currentScore.discipline,
      focusHours: Math.round(totalFocus * 10) / 10,
      savingsMomentum: calculatedSavingsRate,
      consistencyTrend,
      focusTrend,
      labels,
      insights: generatedInsights
    });
  }, [data, viewType]);

  useEffect(() => {
    const safeParse = (key: string, def: string) => {
      try { return JSON.parse(localStorage.getItem(key) || def); } catch { return JSON.parse(def); }
    };

    setData({
      habits: safeParse("monk_os_habits", "[]"),
      logs: safeParse("monk_os_logs", "{}"),
      focusSessions: safeParse("monk_os_focus", "[]"),
      financeTransactions: safeParse("monk_os_finance", "[]"),
      goals: safeParse("monk_os_goals", "[]"),
      tasks: safeParse("monk_os_todos", "[]"),
      ikigai: safeParse("monkos_ikigai_evolution", "null"),
      ironWill: safeParse("monk_os_iron_will", "[]"),
      journal: safeParse("monk_os_journal", "[]")
    });

    const handleUpdate = () => {
       window.location.reload(); 
    };

    window.addEventListener("sync_complete", handleUpdate);
    return () => window.removeEventListener("sync_complete", handleUpdate);
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  const hasData = useMemo(() => {
    return data.habits.length > 0 || data.focusSessions.length > 0 || data.financeTransactions.length > 0;
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 md:space-y-16 pb-12 md:pb-24 animate-in fade-in duration-700 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-foreground">
        <div className="space-y-2 md:space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 px-4 py-1.5 rounded-full border border-primary/10">
            Cognitive Audit
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-foreground italic tracking-tighter uppercase leading-tight">
            Intelligence Layer.
          </h1>
          <p className="text-muted-foreground font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
            <BarChart3 className="h-4 w-4 text-primary" /> Strategy & Trajectory Analysis
          </p>
        </div>
        <div className="flex items-center justify-between lg:justify-end gap-2 p-1.5 bg-secondary/50 dark:bg-white/5 rounded-2xl border border-border w-full lg:w-auto">
          <ViewButton active={viewType === "weekly"} onClick={() => setViewType("weekly")} label="7D" />
          <ViewButton active={viewType === "monthly"} onClick={() => setViewType("monthly")} label="30D" />
          <ViewButton active={viewType === "yearly"} onClick={() => setViewType("yearly")} label="12M" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-24 md:py-40 space-y-10 bg-card rounded-[40px] md:rounded-[48px] border-2 border-dashed border-border text-center px-6 shadow-sm">
          <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20 shadow-inner">
            <BarChart3 className="h-12 w-12" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-heading font-black tracking-tight text-foreground uppercase italic">Insufficient Data.</h2>
            <p className="text-muted-foreground max-w-sm mx-auto font-soft text-base leading-relaxed">Complete habits and focus sessions to unlock deep cognitive and discipline insights.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link href="/habits" className="px-10 py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 active:scale-95 text-center">Start Habits</Link>
            <Link href="/focus" className="px-10 py-4 bg-secondary dark:bg-white/5 text-text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all active:scale-95 text-center">Begin Deep Work</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Life Score */}
          <section className="bg-card p-8 sm:p-12 md:p-16 rounded-[40px] md:rounded-[48px] border-2 border-border relative overflow-hidden group shadow-2xl shadow-primary/[0.03]">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-[2000ms]">
              <ShieldCheck className="h-64 w-64 text-primary" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center text-foreground"> 
              <div className="space-y-10 text-center lg:text-left">
                <div className="space-y-6">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] bg-primary/10 px-6 py-2.5 rounded-full border border-primary/10 inline-block shadow-sm">Integrated Score</span>
                  <h2 className="text-7xl md:text-9xl font-heading font-black tracking-tighter leading-none text-foreground italic drop-shadow-sm">
                    {metrics.lifeScore}
                  </h2>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <MetricPill label={`${metrics.disciplineScore}% Discipline`} color="bg-primary/10 text-primary border-primary/20" />
                  <MetricPill label={`${metrics.savingsMomentum}% Wealth`} color="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" />
                  <MetricPill label={`${metrics.focusHours}h Focus`} color="bg-secondary/50 dark:bg-white/5 text-foreground border-border" /> 
                </div>
              </div>

              <div className="bg-secondary/30 dark:bg-white/[0.02] p-8 md:p-10 rounded-[32px] border border-border shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                 <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] mb-8 opacity-60">Strategic Intelligence</h3>
                 <div className="space-y-5">
                    {metrics.insights.length > 0 ? metrics.insights.map((insight, i) => (
                      <div key={i} className="flex gap-5 p-5 bg-card/80 backdrop-blur-sm rounded-2xl border border-border group/insight transition-all hover:border-primary/30 shadow-sm">   
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/insight:scale-110", insight.color.replace('text-', 'bg-') + '/10')}>
                          <insight.icon className={cn("h-5 w-5", insight.color)} />
                        </div>
                        <p className="text-sm font-bold text-text-primary leading-relaxed mt-0.5">{insight.text}</p>   
                      </div>
                    )) : (
                      <div className="py-12 text-center italic text-text-secondary text-base opacity-40 font-soft">
                        Synthesizing history to unlock insights...
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </section>

          {/* Detailed Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 pb-12">
            <TrendSection title="Discipline Stream" value={`${metrics.disciplineScore}%`} trend={metrics.consistencyTrend} color="bg-accent" icon={Flame} labels={metrics.labels} />
            <TrendSection title="Cognitive Flow" value={`${metrics.focusHours}h`} trend={metrics.focusTrend} color="bg-primary" icon={Zap} labels={metrics.labels} max={viewType === 'yearly' ? 100 : 6} />
          </div>
        </>
      )}
    </div>
  );
}

interface TrendSectionProps {
  title: string;
  value: string;
  trend: number[];
  color: string;
  icon: React.ElementType;
  labels: string[];
  max?: number;
}

function TrendSection({ title, value, trend, color, icon: Icon, labels, max = 100 }: TrendSectionProps) {       
  return (
    <section className="monk-card p-6 md:p-10 shadow-sm border-border hover:shadow-xl transition-all duration-700">
      <div className="flex items-center justify-between mb-16">
        <h3 className="font-heading font-black text-xl md:text-2xl flex items-center gap-4 uppercase tracking-tighter text-foreground italic">
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shadow-inner", color.replace('bg-', 'bg-') + '/10')}>
            <Icon className={cn("h-6 w-6", color.replace('bg-', 'text-'))} />
          </div>
          {title}
        </h3>
        <div className={cn("px-5 py-2 rounded-2xl border text-base font-black tracking-tight", color.replace('bg-', 'text-'), color.replace('bg-', 'bg-') + '/10', color.replace('bg-', 'border-') + '/20')}>
          {value}
        </div>
      </div>
      <div className="flex items-end justify-between gap-1.5 sm:gap-2 md:gap-3 h-56 px-2">
        {trend.map((val: number, i: number) => (
          <div key={i} className="flex-1 group relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(5, (val/max)*100)}%` }}
              className={cn("w-full rounded-full transition-all duration-[1000ms] ease-out", color, "opacity-20 group-hover:opacity-100 group-hover:shadow-lg", color === 'bg-primary' ? 'group-hover:shadow-primary/40' : 'group-hover:shadow-accent/40')}
            />
            {i % Math.ceil(trend.length/7) === 0 && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                 {labels[i]}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ViewButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {      
  return (
    <button onClick={onClick} className={cn("flex-1 lg:flex-none h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center border border-transparent", active ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 border-white/10 scale-[1.02]" : "text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95")}>
      {label}
    </button>
  );
}

function MetricPill({ label, color }: { label: string, color: string }) {
  return (
    <div className={cn("px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border shadow-sm transition-all hover:scale-105", color)}>
      {label}
    </div>
  );
}
