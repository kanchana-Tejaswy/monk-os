"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { calculateStreak } from "@/lib/streak";
import { 
  LayoutDashboard, 
  BarChart3, 
  CheckCircle2, 
  BookText, 
  Target, 
  Calendar as CalendarIcon, 
  History, 
  Settings,
  Flame,
  Wallet,
  ListTodo,
  RotateCcw
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Habit Tracker", href: "/habits", icon: CheckCircle2 },
  { name: "Journal", href: "/journal", icon: BookText },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Todo List", href: "/todos", icon: ListTodo },
  { name: "Progress", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const updateStreak = () => {
      const savedLogs = localStorage.getItem("monk_os_logs");
      const restartDate = localStorage.getItem("monk_os_streak_restart");
      const logs = savedLogs ? JSON.parse(savedLogs) : {};
      
      // In a real app, habit IDs would be fetched from a central store/API
      const currentStreak = calculateStreak(logs, ["1", "2", "3", "4"], restartDate);
      setStreak(currentStreak);
    };

    updateStreak();
    window.addEventListener("streak_updated", updateStreak);
    return () => window.removeEventListener("streak_updated", updateStreak);
  }, []);

  const handleRestartStreak = () => {
    if (confirm("Are you sure you want to restart your streak? This represents a fresh start on your identity evolution.")) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem("monk_os_streak_restart", today);
      window.dispatchEvent(new Event("streak_updated"));
      alert("Streak restarted. Begin anew, Monk.");
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-monk-rose/20 transition-all duration-300">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tight text-foreground">
            monk os
          </span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-monk-rose/10 bg-background/50">
        <div className="rounded-2xl bg-secondary/30 p-4 relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Streak</span>
            <button 
              onClick={handleRestartStreak}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background rounded-full hover:text-red-500"
              title="Restart Streak"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
          <div className="text-2xl font-heading font-bold flex items-center gap-2">
            {streak} Days
            <Flame className="h-5 w-5 text-accent animate-pulse" />
          </div>
          <div className="mt-2 h-1.5 w-full bg-background rounded-full overflow-hidden">
            <div className="h-full bg-accent w-[80%] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
