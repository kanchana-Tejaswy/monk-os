"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Table as TableIcon,
  CheckCircle2,
  Calendar,
  Search,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Habit {
  id: string;
  title: string;
  category: string;
}

interface Reflection {
  habitId: string;
  habitTitle: string;
  content: string;
  timestamp: number;
  date: string;
}

export default function HistoryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [reflections, setReflections] = useState<Record<string, Reflection[]>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedHabits = localStorage.getItem("monk_os_habits");
    const savedReflections = localStorage.getItem("monk_os_reflections");
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedReflections) setReflections(JSON.parse(savedReflections));
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getReflectionForHabitAndDay = (habitId: string, day: number) => {
    const dateKey = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayReflections = reflections[dateKey] || [];
    return dayReflections.find(r => r.habitId === habitId);
  };

  const exportToCSV = () => {
    let csv = "Habit/Day," + Array.from({ length: daysInMonth }, (_, i) => i + 1).join(",") + "\n";
    
    habits.forEach(habit => {
      let row = `"${habit.title}",`;
      const rowData = Array.from({ length: daysInMonth }, (_, i) => {
        const ref = getReflectionForHabitAndDay(habit.id, i + 1);
        return `"${ref?.content.replace(/"/g, '""') || ""}"`;
      });
      csv += row + rowData.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `monk_mode_ledger_${monthName}_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHabits = habits.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-full space-y-5 md:space-y-8 animate-in fade-in duration-700 pb-8 md:pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
            <TableIcon className="h-4 w-4" /> Evidence of Mastery
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tighter text-foreground italic">Mastery Ledger</h1>
          <p className="text-muted-foreground font-soft text-sm md:text-base">Structured record of every action and reflection.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-primary/10 shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-secondary/50 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-4 font-black text-xs uppercase tracking-widest min-w-[140px] text-center">{monthName} {year}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-secondary/50 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter habits or categories..." 
          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-card border border-primary/10 focus:border-primary/40 focus:outline-none transition-all shadow-sm font-bold text-sm"
        />
      </div>

      {/* Spreadsheet View */}
      <div className="monk-card overflow-hidden border-2 border-primary/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary/10 border-b border-primary/10">
                <th className="sticky left-0 z-20 bg-card/90 backdrop-blur-md p-6 text-left border-r border-primary/10 min-w-[240px]">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Anchors</span>
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th key={i} className="p-4 text-center min-w-[120px] border-r border-primary/5 last:border-r-0">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{String(i + 1).padStart(2, '0')}</div>
                    <div className="text-[8px] font-bold text-primary/40 uppercase tracking-tighter">
                      {new Date(year, currentDate.getMonth(), i + 1).toLocaleString('default', { weekday: 'short' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHabits.map((habit, hIdx) => (
                <tr key={habit.id} className="border-b border-primary/5 last:border-b-0 group hover:bg-primary/[0.02] transition-colors">
                  <td className="sticky left-0 z-10 bg-card/90 backdrop-blur-md p-6 border-r border-primary/10 group-hover:bg-primary/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-foreground tracking-tight">{habit.title}</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{habit.category}</div>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const ref = getReflectionForHabitAndDay(habit.id, i + 1);
                    return (
                      <td key={i} className="p-4 align-top border-r border-primary/5 last:border-r-0 relative">
                        {ref ? (
                          <div className="space-y-2 animate-in fade-in duration-500">
                             <div className="text-[10px] font-medium leading-relaxed text-foreground/80 line-clamp-4 hover:line-clamp-none transition-all">
                               {ref.content}
                             </div>
                             <div className="h-1 w-full bg-monk-mint/30 rounded-full overflow-hidden">
                               <div className="h-full bg-monk-mint w-full" />
                             </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <ArrowUpRight className="h-6 w-6" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredHabits.length === 0 && (
                <tr>
                  <td colSpan={daysInMonth + 1} className="p-20 text-center text-muted-foreground font-bold italic opacity-50 uppercase tracking-widest text-sm">
                    No habits identified for record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <section className="p-10 rounded-[40px] bg-primary/5 border-2 border-primary/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
              <Calendar className="h-32 w-32" />
           </div>
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">Ledger Insight</h3>
           <p className="text-xl font-heading font-bold italic leading-relaxed text-foreground/80">
            "Your ledger is the unbiased mirror of your commitment. Every note is a brick in the foundation of your new identity. Do not look for perfection; look for presence."
           </p>
        </section>
        
        <div className="monk-card p-6 md:p-10 flex flex-col justify-center items-center text-center space-y-6">
           <div className="h-16 w-16 rounded-3xl bg-secondary/20 flex items-center justify-center">
              <Download className="h-8 w-8 text-secondary-foreground" />
           </div>
           <div className="space-y-2">
              <h4 className="text-xl font-heading font-black uppercase tracking-tighter">Physical Archive</h4>
              <p className="text-sm text-muted-foreground max-w-xs">Download your complete monthly mastery records as a CSV file for your personal spreadsheets.</p>
           </div>
           <button onClick={exportToCSV} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Download {monthName} Archive</button>
        </div>
      </div>
    </div>
  );
}
