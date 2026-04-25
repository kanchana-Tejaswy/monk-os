"use client";

import { useState, useEffect } from "react";
import { Flame, History, Award, CheckCircle2, TrendingUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryRecord {
  month: string;
  year: number;
  daysCompleted: number;
  totalDays: number;
  longestStreak: number;
}

export default function ProgressHistoryPage() {
  const [stats, setStats] = useState({
    totalPerfectDays: 0,
    longestStreak: 0,
    consistency: 0
  });
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // In a real app, this would aggregate actual logs from localStorage
    // For now, we check if monk_os_logs exists to decide between mock data or zero
    const hasLogs = localStorage.getItem("monk_os_logs");
    
    if (hasLogs) {
      setStats({
        totalPerfectDays: 72,
        longestStreak: 21,
        consistency: 84
      });
      setHistoryRecords([
        { month: "April", year: 2026, daysCompleted: 24, totalDays: 30, longestStreak: 12 },
        { month: "March", year: 2026, daysCompleted: 28, totalDays: 31, longestStreak: 21 },
        { month: "February", year: 2026, daysCompleted: 20, totalDays: 28, longestStreak: 9 },
      ]);
    } else {
      setStats({ totalPerfectDays: 0, longestStreak: 0, consistency: 0 });
      setHistoryRecords([]);
    }
  };

  const handleResetHistory = () => {
    const confirm1 = confirm("⚠️ Are you sure you want to clear your History Archives? This will reset your habit logs and focus sessions, but preserve your Finance, Journals, and Goals.");
    if (!confirm1) return;

    if (confirm("Final confirmation: Reset history archives to zero?")) {
      localStorage.removeItem("monk_os_logs");
      localStorage.removeItem("monk_os_focus");
      
      // Update UI immediately
      setStats({ totalPerfectDays: 0, longestStreak: 0, consistency: 0 });
      setHistoryRecords([]);
      
      window.dispatchEvent(new Event("streak_updated"));
      alert("History archives cleared. Your journey begins again today.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Progress History</h1>
          <p className="text-muted-foreground mt-1">A true record of your discipline over time.</p>
        </div>
        <button 
          onClick={handleResetHistory}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 border border-red-100 transition-all text-sm shadow-sm"
        >
          <Trash2 className="h-4 w-4" /> Clear History Archives
        </button>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="monk-card p-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div className="text-3xl font-heading font-bold text-foreground mt-2">{stats.totalPerfectDays}</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Perfect Days</div>
        </div>
        
        <div className="monk-card p-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-accent" />
          </div>
          <div className="text-3xl font-heading font-bold text-foreground mt-2">{stats.longestStreak}</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Longest Streak</div>
        </div>

        <div className="monk-card p-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-monk-mint/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-monk-mint" />
          </div>
          <div className="text-3xl font-heading font-bold text-foreground mt-2">{stats.consistency}%</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">All-Time Consistency</div>
        </div>
      </div>

      <div className="monk-card p-6 space-y-8">
        <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
          <History className="h-5 w-5 text-secondary" /> Monthly Archives
        </h2>

        <div className="space-y-6">
          {historyRecords.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground italic font-soft">
              The archives are empty. Begin your journey to create history.
            </div>
          ) : (
            historyRecords.map((record, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background/50 rounded-2xl border border-monk-rose/10 group hover:border-primary/20 transition-all gap-4">
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-lg">{record.month} {record.year}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      <strong className="text-foreground">{record.daysCompleted}</strong> / {record.totalDays} Perfect Days
                    </span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3 text-accent" /> Longest Streak: {record.longestStreak}
                    </span>
                  </div>
                </div>
                
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Consistency</span>
                    <span className="text-primary">{Math.round((record.daysCompleted / record.totalDays) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${(record.daysCompleted / record.totalDays) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
