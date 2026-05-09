"use client";

import { useState, useEffect } from "react";
import { Flame, History, Award, TrendingUp, Trash2, CheckCircle2, Clock, BookText } from "lucide-react";
import { calculateAllTimeStats } from "@/lib/streak";
import { cn, formatDate } from "@/lib/utils";

interface HistoryRecord {
  month: string;
  year: number;
  daysCompleted: number;
  totalDays: number;
  longestStreak: number;
}

interface Reflection {
  habitId: string;
  habitTitle: string;
  content: string;
  timestamp: number;
  date: string;
}

export default function ProgressHistoryPage() {
  const [stats, setStats] = useState({
    totalPerfectDays: 0,
    longestStreak: 0,
    consistency: 0
  });
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [allReflections, setReflections] = useState<Record<string, Reflection[]>>({});

  useEffect(() => {
    loadData();
    window.addEventListener("streak_updated", loadData);
    return () => window.removeEventListener("streak_updated", loadData);
  }, []);

  const loadData = () => {
    const savedLogs = localStorage.getItem("monk_os_logs");
    const savedHabits = localStorage.getItem("monk_os_habits");
    const savedReflections = localStorage.getItem("monk_os_reflections");
    
    if (savedLogs && savedHabits) {
      const logs = JSON.parse(savedLogs);
      const habits = JSON.parse(savedHabits);
      const habitIds = habits.map((h: { id: string }) => h.id);
      
      const allTimeStats = calculateAllTimeStats(logs, habitIds);
      
      setStats({
        totalPerfectDays: allTimeStats.totalPerfectDays,
        longestStreak: allTimeStats.longestStreak,
        consistency: allTimeStats.consistency
      });
      setHistoryRecords(allTimeStats.monthlyHistory);
    }

    if (savedReflections) {
      setReflections(JSON.parse(savedReflections));
    }
  };

  const getMonthReflections = (month: string, year: number) => {
    // month is "April", year is 2026
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    return Object.entries(allReflections)
      .filter(([date]) => date.startsWith(prefix))
      .sort((a, b) => b[0].localeCompare(a[0]));
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

      {/* Daily Evidence / Reflections Section */}
      <div className="monk-card p-8 space-y-8">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" /> Daily Evidence
        </h2>

        <div className="space-y-10">
          {Object.keys(allReflections).length === 0 ? (
            <div className="text-center py-10 bg-secondary/10 rounded-3xl border-2 border-dashed border-monk-rose/20">
              <p className="text-sm text-muted-foreground italic">No evidence recorded yet. Complete habits to leave a trail of mastery.</p>
            </div>
          ) : (
            Object.entries(allReflections)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, dayReflections]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-monk-rose/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground bg-background px-4 py-1 rounded-full border border-monk-rose/10">
                      {formatDate(new Date(date))}
                    </span>
                    <div className="h-px flex-1 bg-monk-rose/20" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayReflections.map((ref, idx) => (
                      <div key={idx} className="bg-zinc-950 text-white p-6 rounded-[32px] border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-2 w-2 rounded-full bg-monk-mint animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {ref.habitTitle}
                          </span>
                          <span className="text-[8px] font-bold text-white/20 uppercase ml-auto">
                            <Clock className="h-2 w-2 inline mr-1" />
                            {new Date(ref.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="font-soft text-sm leading-relaxed text-white/80">
                          {ref.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
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
