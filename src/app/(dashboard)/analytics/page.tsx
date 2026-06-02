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
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 pb-8 md:pb-20 animate-in fade-in duration-700 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-foreground">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground italic tracking-tighter uppercase">Intelligence Layer</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Strategy & Trajectory
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-secondary dark:bg-white/5 rounded-2xl border border-border">
          <ViewButton active={viewType === "weekly"} onClick={() => setViewType("weekly")} label="7D" />
          <ViewButton active={viewType === "monthly"} onClick={() => setViewType("monthly")} label="30D" />
          <ViewButton active={viewType === "yearly"} onClick={() => setViewType("yearly")} label="12M" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20 md:py-40 space-y-8 bg-card rounded-[48px] border-2 border-dashed border-border text-center">
          <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
            <BarChart3 className="h-12 w-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-heading font-black tracking-tight text-foreground">Not enough data yet.</h2>
            <p className="text-muted-foreground max-w-sm mx-auto font-soft">Complete habits and focus sessions to unlock deep cognitive and discipline insights.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/habits" className="px-8 py-3 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg">Start Habits</Link>
            <Link href="/focus" className="px-8 py-3 bg-secondary text-text-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all">Begin Deep Work</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Life Score */}
          <section className="bg-card p-8 md:p-16 rounded-[48px] border-2 border-border relative overflow-hidden group shadow-2xl shadow-primary/5">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
              <ShieldCheck className="h-64 w-64 text-primary" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-foreground">
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] bg-primary/10 px-5 py-2 rounded-full border border-border">Integrated Life Score</span>
                  <h2 className="text-8xl md:text-9xl font-heading font-black tracking-tighter leading-none text-foreground">
                    {metrics.lifeScore}
                  </h2>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <MetricPill label={`${metrics.disciplineScore}% Discipline`} color="bg-primary/10 text-primary" />
                  <MetricPill label={`${metrics.savingsMomentum}% Wealth`} color="bg-emerald-500/10 text-emerald-500" />
                  <MetricPill label={`${metrics.focusHours}h Focus`} color="bg-secondary/50 text-foreground" />
                </div>
              </div>

              <div className="bg-secondary/20 dark:bg-white/[0.02] p-8 rounded-[32px] border border-border/50">
                 <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-6">Strategic Insights</h3>
                 <div className="space-y-4">
                    {metrics.insights.length > 0 ? metrics.insights.map((insight, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-background rounded-2xl border border-border">
                        <insight.icon className={cn("h-5 w-5 shrink-0", insight.color)} />
                        <p className="text-sm font-bold text-text-primary leading-relaxed">{insight.text}</p>
                      </div>
                    )) : (
                      <div className="py-8 text-center italic text-text-secondary text-sm">
                        Generate more data to unlock intelligence.
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </section>

          {/* Detailed Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrendSection title="Discipline Momentum" value={`${metrics.disciplineScore}%`} trend={metrics.consistencyTrend} color="bg-accent" icon={Flame} labels={metrics.labels} />
            <TrendSection title="Cognitive Depth" value={`${metrics.focusHours}h`} trend={metrics.focusTrend} color="bg-primary" icon={Zap} labels={metrics.labels} max={viewType === 'yearly' ? 100 : 6} />
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
    <section className="monk-card p-8 md:p-10">
      <div className="flex items-center justify-between mb-12">
        <h3 className="font-heading font-black text-xl flex items-center gap-3 uppercase tracking-tighter text-foreground">
          <Icon className={cn("h-6 w-6", color.replace('bg-', 'text-'))} />
          {title}
        </h3>
        <span className={cn("text-sm font-black px-4 py-1.5 rounded-xl border border-border", color.replace('bg-', 'text-'), color.replace('bg-', 'bg-') + '/10')}>{value}</span>
      </div>
      <div className="flex items-end justify-between gap-2 h-48">
        {trend.map((val: number, i: number) => (
          <div key={i} className="flex-1 group relative">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(100, (val/max)*100)}%` }}
              className={cn("w-full rounded-2xl transition-all duration-500", color, "opacity-20 group-hover:opacity-100")}
            />
            {i % Math.ceil(trend.length/7) === 0 && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-muted-foreground whitespace-nowrap">
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
    <button onClick={onClick} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", active ? "bg-primary text-primary-foreground shadow-xl" : "text-muted-foreground hover:text-foreground")}>
      {label}
    </button>
  );
}

function MetricPill({ label, color }: { label: string, color: string }) {
  return (
    <div className={cn("px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-border shadow-sm", color)}>
      {label}
    </div>
  );
}
