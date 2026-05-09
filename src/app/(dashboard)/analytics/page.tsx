"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  Flame,
  PieChart as PieChartIcon,
  ShieldCheck,
  Target,
  Brain,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FocusSession {
  timestamp: string;
  duration: number;
}

interface Transaction {
  type: "credit" | "debit";
  amount: number;
}

interface Habit {
  id: string;
  title: string;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({
    lifeScore: 0,
    disciplineScore: 0,
    focusHours: 0,
    savingsMomentum: 0,
    dailyConsistency: [0, 0, 0, 0, 0, 0, 0],
    focusTrend: [0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    calculateAnalytics();
    window.addEventListener("streak_updated", calculateAnalytics);
    return () => window.removeEventListener("streak_updated", calculateAnalytics);
  }, []);

  const calculateAnalytics = () => {
    // 1. Discipline (Real Habit Logs)
    const logs = JSON.parse(localStorage.getItem("monk_os_logs") || "{}");
    const habits: Habit[] = JSON.parse(localStorage.getItem("monk_os_habits") || "[]");
    
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyConsistency = last7Days.map(date => {
      if (habits.length === 0) return 0;
      let completed = 0;
      habits.forEach(h => {
        if (logs[`${date}-${h.id}`]) completed++;
      });
      return (completed / habits.length) * 100;
    });

    // 2. Focus (Deep Work)
    const focusHistory: FocusSession[] = JSON.parse(localStorage.getItem("monk_os_focus") || "[]");
    const focusTrend = last7Days.map(date => {
      const daySessions = focusHistory.filter((s: FocusSession) => s.timestamp.startsWith(date));
      const totalMinutes = daySessions.reduce((acc: number, curr: FocusSession) => acc + curr.duration, 0);
      return totalMinutes / 60; // Hours
    });
    const totalFocusHours = focusTrend.reduce((a, b) => a + b, 0);

    // 3. Wealth (Finance)
    const transactions: Transaction[] = JSON.parse(localStorage.getItem("monk_os_finance") || "[]");
    const income = transactions.filter((t: Transaction) => t.type === "credit").reduce((a: number, b: Transaction) => a + b.amount, 0);
    const spent = transactions.filter((t: Transaction) => t.type === "debit").reduce((a: number, b: Transaction) => a + b.amount, 0);
    const savingsRate = income > 0 ? Math.max(0, Math.round(((income - spent) / income) * 100)) : 0;

    // 4. Life Score Calculation (Balanced)
    const disciplineAvg = dailyConsistency.length > 0 ? dailyConsistency.reduce((a, b) => a + b, 0) / 7 : 0;
    const focusTarget = 28; // 4h per day target
    const focusScore = Math.min(100, (totalFocusHours / focusTarget) * 100);
    const lifeScore = Math.round((disciplineAvg * 0.4) + (focusScore * 0.3) + (Math.min(100, savingsRate) * 0.3));

    setMetrics({
      lifeScore: lifeScore || 0,
      disciplineScore: Math.round(disciplineAvg) || 0,
      focusHours: Math.round(totalFocusHours * 10) / 10,
      savingsMomentum: savingsRate,
      dailyConsistency,
      focusTrend
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black text-foreground italic tracking-tighter uppercase">Identity Evolution</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Hard Data. Zero Lies.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-secondary/20 dark:bg-white/5 rounded-2xl border border-primary/20">
          <button className="px-6 md:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-foreground text-background shadow-xl transition-all">Weekly View</button>
          <button className="px-6 md:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">Monthly View</button>
        </div>
      </div>

      {/* Top Level Metric - Life Score */}
      <section className="bg-card text-card-foreground p-8 md:p-16 rounded-[48px] relative overflow-hidden shadow-2xl shadow-primary/5 border-2 border-primary/10 group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.08] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <ShieldCheck className="h-64 w-64 text-primary" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] bg-primary/10 px-5 py-2 rounded-full border border-primary/20">Integrated Life Score</span>
              <h2 className="text-7xl md:text-8xl lg:text-9xl font-heading font-black mt-8 tracking-tighter leading-[0.8] text-foreground drop-shadow-sm">
                {metrics.lifeScore}
              </h2>
            </div>
            <p className="text-muted-foreground font-soft text-lg md:text-xl lg:text-2xl max-w-md mx-auto lg:mx-0 leading-relaxed italic">
              {metrics.lifeScore > 75 
                ? "Your discipline is elite. You are currently operating at peak human potential." 
                : metrics.lifeScore > 40 
                ? "Foundation is solid. Increase your focus intensity to break into mastery."
                : "The path begins with a single non-negotiable. Rebuild from zero."}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
              <MetricPill label={`${metrics.disciplineScore}% Discipline`} color="bg-primary/10 text-primary" border="border-primary/20" />
              <MetricPill label={`${metrics.savingsMomentum}% Savings`} color="bg-success/10 text-[#45b7a0] dark:text-success" border="border-success/20" />
              <MetricPill label={`${metrics.focusHours}h Focus`} color="bg-secondary/30 text-secondary-foreground" border="border-secondary/30" />
            </div>
          </div>

          {/* Custom SVG Radar Chart */}
          <div className="flex items-center justify-center pt-8 lg:pt-0">
            <div className="relative h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96">
              <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_30px_rgba(246,193,204,0.15)] overflow-visible">
                <circle cx="50" cy="50" r="45" className="fill-none stroke-foreground/5 stroke-[0.5]" />
                <circle cx="50" cy="50" r="30" className="fill-none stroke-foreground/5 stroke-[0.5]" />
                <circle cx="50" cy="50" r="15" className="fill-none stroke-foreground/5 stroke-[0.5]" />
                <line x1="50" y1="5" x2="50" y2="95" className="stroke-foreground/5 stroke-[0.5]" />
                <line x1="5" y1="50" x2="95" y2="50" className="stroke-foreground/5 stroke-[0.5]" />
                
                <motion.polygon 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  points={`${50},${50 - (metrics.disciplineScore * 0.4)} ${50 + (Math.min(100, metrics.savingsMomentum) * 0.4)},${50} ${50 + (Math.min(100, metrics.focusHours * 4) * 0.4)},${50 + (metrics.focusHours * 2)} ${50 - (metrics.lifeScore * 0.4)},${50 + (metrics.lifeScore * 0.4)} ${50 - 40},${50}`}
                  className="fill-primary/20 stroke-primary stroke-2"
                />
              </svg>
              <RadarLabel label="Discipline" top="-10%" left="50%" transform="translateX(-50%)" />
              <RadarLabel label="Wealth" top="50%" left="115%" transform="translateY(-50%)" />
              <RadarLabel label="Focus" top="105%" left="80%" transform="translateX(-50%)" />
              <RadarLabel label="Identity" top="105%" left="20%" transform="translateX(-50%)" />
              <RadarLabel label="Spirit" top="50%" left="-15%" transform="translateY(-50%)" />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Habit Completion Trend */}
        <section className="bg-card p-10 rounded-[40px] border-2 border-primary/10 flex flex-col shadow-xl shadow-accent/5">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-heading font-black text-xl flex items-center gap-3 uppercase tracking-tighter text-foreground">
              <Flame className="h-6 w-6 text-accent" />
              Momentum
            </h3>
            <span className="text-sm font-black text-accent bg-accent/10 px-4 py-1.5 rounded-xl border border-accent/20">{metrics.disciplineScore}%</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 h-48">
            {metrics.dailyConsistency.map((val, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(8, val)}%` }}
                  className={cn(
                    "w-full rounded-2xl transition-all duration-500",
                    i === 6 ? "bg-accent shadow-lg shadow-accent/20" : "bg-accent/20 group-hover:bg-accent/40"
                  )}
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
            <span>-7 Days</span>
            <span>Present</span>
          </div>
        </section>

        {/* Deep Work Hours */}
        <section className="bg-card p-10 rounded-[40px] border-2 border-primary/10 flex flex-col shadow-xl shadow-primary/5">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-heading font-black text-xl flex items-center gap-3 uppercase tracking-tighter text-foreground">
              <Zap className="h-6 w-6 text-primary" />
              Focus Depth
            </h3>
            <span className="text-sm font-black text-primary bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20">{metrics.focusHours}h</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 h-48">
            {metrics.focusTrend.map((val, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, (val / 6) * 100)}%` }}
                  className={cn(
                    "w-full rounded-2xl transition-all duration-500",
                    i === 6 ? "bg-primary shadow-lg shadow-primary/20" : "bg-primary/20 group-hover:bg-primary/40"
                  )}
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
            <span>-7 Days</span>
            <span>Present</span>
          </div>
        </section>

        {/* Wealth Chart */}
        <section className="bg-card p-10 rounded-[40px] border-2 border-primary/10 flex flex-col shadow-xl shadow-success/5">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-heading font-black text-xl flex items-center gap-3 uppercase tracking-tighter text-foreground">
              <TrendingUp className="h-6 w-6 text-success" />
              Capital
            </h3>
            <span className="text-sm font-black text-success bg-success/10 px-4 py-1.5 rounded-xl border border-success/20">{metrics.savingsMomentum}%</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative h-32 w-full flex items-end gap-1">
               <svg viewBox="0 0 100 40" className="w-full overflow-visible">
                 <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    d="M 0 35 L 20 30 L 40 38 L 60 20 L 80 25 L 100 10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-success"
                 />
                 <motion.circle cx="100" cy="10" r="5" className="fill-success shadow-lg shadow-success/20" />
               </svg>
            </div>
            <p className="mt-8 text-[10px] font-black text-success uppercase tracking-[0.3em] text-center py-4 px-6 bg-success/5 rounded-2xl border border-success/10 w-full italic">
              {metrics.savingsMomentum > 30 ? "Economic Mastery Active" : "Financial Defense Required"}
            </p>
          </div>
        </section>

      </div>

      {/* Insights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard label="Discipline" status={metrics.disciplineScore > 80 ? "ELITE" : "VOLATILE"} color="text-accent" bg="bg-accent/10" border="border-accent/10" />
        <InsightCard label="Cognition" status={metrics.focusHours > 15 ? "SHARP" : "DULLED"} color="text-primary" bg="bg-primary/10" border="border-primary/10" />
        <InsightCard label="Resilience" status={metrics.lifeScore > 60 ? "UNBREAKABLE" : "FRAGILE"} color="text-secondary-foreground" bg="bg-secondary/20" border="border-secondary/30" />
        <InsightCard label="Economy" status={metrics.savingsMomentum > 40 ? "PROPLUS" : "DEFICIT"} color="text-success" bg="bg-success/10" border="border-success/10" />
      </section>
    </div>
  );
}

function RadarLabel({ label, top, left, transform }: { label: string, top: string, left: string, transform: string }) {
  return (
    <div 
      className="absolute text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] whitespace-nowrap"
      style={{ top, left, transform }}
    >
      {label}
    </div>
  );
}

function MetricPill({ label, color, border }: { label: string, color: string, border: string }) {
  return (
    <div className={cn("px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all", color, border)}>
      {label}
    </div>
  );
}

function InsightCard({ label, status, color, bg, border }: { label: string, status: string, color: string, bg: string, border: string }) {
  return (
    <div className={cn("p-8 rounded-[32px] border-2 transition-all hover:scale-[1.02] bg-card text-card-foreground shadow-lg flex flex-col justify-between min-h-[140px]", border)}>
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-4">{label}</div>
      <div className="flex items-center justify-between mt-auto">
        <div className={cn("text-2xl font-heading font-black italic tracking-tighter", color)}>{status}</div>
        <div className={cn("h-3 w-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.1)]", bg.replace('/10', '').replace('/20', ''))} />
      </div>
    </div>
  );
}
