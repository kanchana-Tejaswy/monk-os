"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { calculateStreak } from "@/lib/streak";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Compass,
  BarChart3, 
  CheckCircle2, 
  Zap,
  BookText, 
  Target, 
  Calendar as CalendarIcon, 
  History, 
  Settings,
  Flame,
  Wallet,
  ListTodo,
  RotateCcw,
  ShieldAlert,
  X
} from "lucide-react";

const navigation = [
  {
    group: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Ikigai", href: "/ikigai", icon: Compass },
    ]
  },
  {
    group: "PLAN",
    items: [
      { name: "Goals", href: "/goals", icon: Target },
      { name: "Calendar", href: "/calendar", icon: CalendarIcon },
      { name: "Todo List", href: "/todos", icon: ListTodo },
    ]
  },
  {
    group: "EXECUTION",
    items: [
      { name: "Deep Work", href: "/focus", icon: Zap },
      { name: "Habit Tracker", href: "/habits", icon: CheckCircle2 },
      { name: "Iron Will", href: "/iron-will", icon: ShieldAlert },
    ]
  },
  {
    group: "INSIGHTS",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Progress", href: "/history", icon: History },
    ]
  },
  {
    group: "REFLECTION",
    items: [
      { name: "Journal", href: "/journal", icon: BookText },
    ]
  },
  {
    group: "SYSTEM",
    items: [
      { name: "Finance", href: "/finance", icon: Wallet },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const updateStreak = () => {
      const savedLogs = localStorage.getItem("monk_os_logs");
      const restartDate = localStorage.getItem("monk_os_streak_restart");
      const logs = savedLogs ? JSON.parse(savedLogs) : {};
      
      const savedHabits = localStorage.getItem("monk_os_habits");
      const habitIds = savedHabits ? JSON.parse(savedHabits).map((h: { id: string }) => h.id) : ["1", "2", "3", "4"];
      
      const currentStreak = calculateStreak(logs, habitIds, restartDate);
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex-col glass-panel border-r border-border transition-transform duration-500 ease-out lg:static lg:flex lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-20 items-center justify-between px-6 shrink-0 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-110">
              <Flame className="h-6 w-6" />
            </div>
            <span className="text-xl font-heading font-black tracking-tighter text-foreground uppercase truncate italic">
              monk mode
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary dark:bg-white/5 rounded-xl lg:hidden shrink-0 transition-all duration-200"
          >
            <X className="h-5 w-5 text-text-secondary hover:text-text-primary" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar relative space-y-8">
          {/* Subtle nav background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/[0.03] rounded-full blur-[80px] pointer-events-none" />
          
          {navigation.map((group) => (
            <div key={group.group} className="space-y-2">
              <h3 className="px-4 text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.3em]">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={cn(
                        "group flex items-center rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-primary/10 text-primary shadow-sm shadow-primary/5" 
                          : "text-text-secondary hover:bg-secondary dark:hover:bg-white/[0.03] hover:text-text-primary"
                      )}
                    >
                      <item.icon className={cn(
                        "mr-4 h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10",
                        isActive ? "text-primary scale-110" : "text-text-secondary group-hover:text-text-primary"
                      )} />
                      <span className="truncate relative z-10 tracking-wide">{item.name}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="active-nav"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(217,167,167,0.6)] relative z-10"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-border bg-background transition-colors duration-500">
          <div className="rounded-[24px] bg-secondary/40 dark:bg-white/[0.02] border border-border p-5 relative group overflow-hidden transition-all duration-300 hover:bg-secondary/60 dark:hover:bg-white/[0.04]">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent/[0.05] rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Life Streak</span>
              <button 
                onClick={handleRestartStreak}
                className="opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-background dark:bg-[#111418] rounded-full hover:bg-red-500/10 hover:text-red-500 shadow-sm"
                title="Restart Streak"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
            <div className="text-3xl font-heading font-black flex items-center gap-2 relative z-10 text-foreground">
              {streak} <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mt-3">Days</span>
              <Flame className="h-6 w-6 text-accent drop-shadow-[0_0_8px_rgba(232,197,71,0.2)] ml-auto" />
            </div>
            <div className="mt-4 h-1.5 w-full bg-secondary/60 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-accent w-[80%] rounded-full shadow-[0_0_10px_rgba(232,197,71,0.3)]" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
