"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Target, 
  Zap, 
  Brain, 
  Dumbbell, 
  Heart,
  Flame,
  PieChart as PieChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  }, []);

  const calculateAnalytics = () => {
    // 1. Discipline (Habit Logs)
    const logs = JSON.parse(localStorage.getItem("monk_os_logs") || "{}");
    const habitCount = 4; // Mock standard
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyConsistency = last7Days.map(date => {
      let completed = 0;
      for (let i = 1; i <= habitCount; i++) {
        if (logs[`${date}-${i}`]) completed++;
      }
      return (completed / habitCount) * 100;
    });

    // 2. Focus (Deep Work)
    const focusHistory = JSON.parse(localStorage.getItem("monk_os_focus") || "[]");
    const focusTrend = last7Days.map(date => {
      const daySessions = focusHistory.filter((s: any) => s.timestamp.startsWith(date));
      const totalMinutes = daySessions.reduce((acc: number, curr: any) => acc + curr.duration, 0);
      return totalMinutes / 60; // Hours
    });
    const totalFocusHours = focusTrend.reduce((a, b) => a + b, 0);

    // 3. Wealth (Finance)
    const transactions = JSON.parse(localStorage.getItem("monk_os_finance") || "[]");
    const income = transactions.filter((t: any) => t.type === "credit").reduce((a: any, b: any) => a + b.amount, 0);
    const spent = transactions.filter((t: any) => t.type === "debit").reduce((a: any, b: any) => a + b.amount, 0);
    const savingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;

    // 4. Life Score Calculation
    const disciplineAvg = dailyConsistency.reduce((a, b) => a + b, 0) / 7;
    const focusAvg = (totalFocusHours / 28) * 100; // Assuming 4h/day goal
    const lifeScore = Math.round((disciplineAvg * 0.4) + (focusAvg * 0.3) + (savingsRate * 0.3));

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
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground italic">Identity Evolution</h1>
          <p className="text-muted-foreground mt-1">Numbers don't lie. Data is the proof of your growth.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-secondary/20 rounded-2xl">
          <button className="px-6 py-2 rounded-xl text-sm font-bold bg-card text-foreground shadow-sm">Weekly</button>
          <button className="px-6 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all">Monthly</button>
        </div>
      </div>

      {/* Top Level Metric - Life Score */}
      <section className="monk-card p-8 bg-primary/5 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <PieChartIcon className="h-40 w-40 text-primary" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Overall Evolution</span>
              <h2 className="text-7xl font-heading font-extrabold mt-2 tracking-tighter">Life Score: {metrics.lifeScore}</h2>
            </div>
            <p className="text-muted-foreground font-soft text-lg max-w-md">
              {metrics.lifeScore > 70 
                ? "Your discipline is exceptional. You are currently in the top 5% of your potential." 
                : "You are laying the foundation. Focus on consistency over intensity to raise your score."}
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-monk-mint/10 text-monk-mint rounded-xl text-sm font-bold border border-monk-mint/20">
                {metrics.disciplineScore}% Discipline
              </div>
              <div className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-bold border border-accent/20">
                {metrics.savingsMomentum}% Wealth
              </div>
            </div>
          </div>

          {/* Custom SVG Radar Chart */}
          <div className="flex items-center justify-center">
            <div className="relative h-64 w-64">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {/* Radar Grid */}
                <circle cx="50" cy="50" r="45" className="fill-none stroke-secondary/20 stroke-[0.5] border-dashed" />
                <circle cx="50" cy="50" r="30" className="fill-none stroke-secondary/20 stroke-[0.5]" />
                <circle cx="50" cy="50" r="15" className="fill-none stroke-secondary/20 stroke-[0.5]" />
                
                {/* Dynamic Polygon */}
                <motion.polygon 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  points={`${50},${50 - (metrics.disciplineScore * 0.4)} ${50 + (metrics.savingsMomentum * 0.4)},${50} ${50 + (metrics.focusHours * 2)},${50 + (metrics.focusHours * 2)} ${50 - (metrics.lifeScore * 0.4)},${50 + (metrics.lifeScore * 0.4)} ${50 - 40},${50}`}
                  className="fill-primary/20 stroke-primary stroke-2"
                />
              </svg>
              <RadarLabel label="Habits" top="-10%" left="50%" transform="translateX(-50%)" />
              <RadarLabel label="Wealth" top="50%" left="110%" transform="translateY(-50%)" />
              <RadarLabel label="Focus" top="95%" left="75%" transform="translateX(-50%)" />
              <RadarLabel label="Identity" top="95%" left="25%" transform="translateX(-50%)" />
              <RadarLabel label="Zen" top="50%" left="-10%" transform="translate(-100%, -50%)" />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Habit Completion Trend */}
        <section className="monk-card p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading font-bold flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent" />
              Discipline Trend
            </h3>
            <span className="text-xs font-bold text-accent">{metrics.disciplineScore}%</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-40">
            {metrics.dailyConsistency.map((val, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(5, val)}%` }}
                  className={cn(
                    "w-full rounded-t-xl transition-all",
                    i === 6 ? "bg-accent" : "bg-accent/20 group-hover:bg-accent/40"
                  )}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>7 Days Ago</span>
            <span>Today</span>
          </div>
        </section>

        {/* Deep Work Hours */}
        <section className="monk-card p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Focus Hours
            </h3>
            <span className="text-xs font-bold text-primary">{metrics.focusHours}h</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-40">
            {metrics.focusTrend.map((val, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, (val / 5) * 100)}%` }}
                  className={cn(
                    "w-full rounded-t-xl transition-all",
                    i === 6 ? "bg-primary" : "bg-primary/20 group-hover:bg-primary/40"
                  )}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>7 Days Ago</span>
            <span>Today</span>
          </div>
        </section>

        {/* Wealth Chart */}
        <section className="monk-card p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-monk-mint" />
              Wealth Score
            </h3>
            <span className="text-xs font-bold text-monk-mint">{metrics.savingsMomentum}%</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative h-32 w-full flex items-end gap-1">
               {/* Simple line chart visualization */}
               <svg viewBox="0 0 100 40" className="w-full overflow-visible">
                 <motion.path 
                    d="M 0 35 L 20 30 L 40 38 L 60 20 L 80 25 L 100 10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                    className="text-monk-mint opacity-20"
                 />
                 <motion.circle cx="100" cy="10" r="4" className="fill-monk-mint" />
               </svg>
            </div>
          </div>
          <p className="mt-4 text-[10px] font-bold text-monk-mint uppercase tracking-widest text-center py-2 bg-monk-mint/5 rounded-lg border border-monk-mint/10">
            {metrics.savingsMomentum > 40 ? "Stable Financial Trajectory" : "Conscious Spending Required"}
          </p>
        </section>

      </div>

      {/* Life Balance Radar Insights */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard label="Discipline" score={metrics.disciplineScore > 80 ? "Elite" : "Growing"} trend="Up" color="text-accent" />
        <InsightCard label="Learning" score={metrics.focusHours > 10 ? "Mastery" : "Stable"} trend="Flat" color="text-secondary" />
        <InsightCard label="Wealth" score={metrics.savingsMomentum > 50 ? "Stable" : "At Risk"} trend={metrics.savingsMomentum > 20 ? "Up" : "Down"} color="text-monk-mint" />
        <InsightCard label="Focus" score={metrics.focusHours > 5 ? "Focused" : "Scattered"} trend="Up" color="text-primary" />
      </section>
    </div>
  );
}

function RadarLabel({ label, top, left, transform }: { label: string, top: string, left: string, transform: string }) {
  return (
    <div 
      className="absolute text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
      style={{ top, left, transform }}
    >
      {label}
    </div>
  );
}

function InsightCard({ label, score, trend, color }: { label: string, score: string, trend: "Up" | "Down" | "Flat", color: string }) {
  return (
    <div className="monk-card p-6 space-y-2">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</div>
      <div className="flex items-center justify-between">
        <div className={cn("text-xl font-heading font-bold", color)}>{score}</div>
        <div className="text-xs">
          {trend === "Up" && <TrendingUp className="h-5 w-5 text-monk-mint" />}
          {trend === "Down" && <TrendingUp className="h-5 w-5 text-primary rotate-180" />}
          {trend === "Flat" && <Activity className="h-5 w-5 text-secondary" />}
        </div>
      </div>
    </div>
  );
}
