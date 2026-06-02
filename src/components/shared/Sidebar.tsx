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
  History, 
  Flame,
  Wallet,
  ListTodo,
  RotateCcw,
  ShieldAlert,
  X,
  LogOut,
  User
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/AuthContext";
import { syncManager } from "@/lib/sync/syncManager";

const navigation = [
  {
    group: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Account", href: "/account", icon: User },
    ]
  },
  {
    group: "EXECUTION",
    items: [
      { name: "Habit Tracker", href: "/habits", icon: CheckCircle2 },
      { name: "Deep Work", href: "/focus", icon: Zap },
      { name: "Iron Will", href: "/iron-will", icon: ShieldAlert },
    ]
  },
  {
    group: "PLAN",
    items: [
      { name: "Todo List", href: "/todos", icon: ListTodo },
      { name: "Goals", href: "/goals", icon: Target },
    ]
  },
  {
    group: "REFLECTION",
    items: [
      { name: "Journal", href: "/journal", icon: BookText },
      { name: "Ikigai", href: "/ikigai", icon: Compass },
    ]
  },
  {
    group: "INSIGHTS",
    items: [
      { name: "Progress", href: "/history", icon: History },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Finance", href: "/finance", icon: Wallet },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [streak, setStreak] = useState(0);
  const [integrityScore, setIntegrityScore] = useState(0);

  useEffect(() => {
    function updateStats() {
      const savedHabits = localStorage.getItem("monk_os_habits");
      const savedLogs = localStorage.getItem("monk_os_logs");
      const restartDate = localStorage.getItem("monk_os_streak_restart");

      if (!savedHabits || !savedLogs) {
        setStreak(0);
        setIntegrityScore(0);
        return;
      }

      try {
        const habits = JSON.parse(savedHabits);
        const logs = JSON.parse(savedLogs);
        
        // Streak calculation
        const nnHabits = habits.filter((h: { isNonNegotiable?: boolean, is_non_negotiable?: boolean }) => h.isNonNegotiable || h.is_non_negotiable);
        const nnHabitIds = nnHabits.map((h: { id: string }) => h.id);
        const currentStreak = calculateStreak(logs, nnHabitIds, restartDate);
        setStreak(currentStreak);

        // Integrity Score (Today's Progress)
        const todayStr = new Date().toISOString().split('T')[0];
        const nnCompletedToday = nnHabitIds.filter((id: string) => logs[`${todayStr}-${id}`]).length;
        const score = nnHabitIds.length > 0 ? (nnCompletedToday / nnHabitIds.length) * 100 : 0;
        setIntegrityScore(score);
      } catch (e) {
        console.error("Error parsing streak data:", e);
        setStreak(0);
        setIntegrityScore(0);
      }
    }

    updateStats();
    window.addEventListener("streak_updated", updateStats);
    return () => window.removeEventListener("streak_updated", updateStats);
  }, []);

  const handleRestartStreak = () => {
    if (confirm("Are you sure you want to restart your streak? This represents a fresh start on your identity evolution.")) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem("monk_os_streak_restart", today);
      
      // Cloud Sync
      if (user) {
        syncManager.save('streaks', 'UPSERT', {
          user_id: user.id,
          restart_date: today
        });
      }

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
        "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] lg:w-72 flex-col glass-panel border-r border-border transition-transform duration-500 ease-out lg:static lg:flex lg:translate-x-0 h-[100dvh] overflow-y-auto custom-scrollbar",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 lg:h-20 items-center justify-between px-4 lg:px-6 shrink-0 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 lg:gap-3 overflow-hidden">
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center relative bg-white dark:bg-white/10 rounded-xl transition-transform duration-300 hover:scale-110 flex-shrink-0 shadow-lg overflow-hidden">
              {streak > 0 && (
                <motion.div
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-orange-500 blur-md z-0"
                />
              )}
              <div className="relative z-10 w-full h-full p-1">
                <Image 
                  src="/monk-logo.jpeg" 
                  alt="Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>
            <span className="text-lg lg:text-xl font-heading font-black tracking-tighter text-foreground uppercase italic truncate">
              monk mode
            </span>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center justify-center h-11 w-11 hover:bg-secondary dark:hover:bg-white/5 rounded-xl lg:hidden shrink-0 transition-all duration-200"
          >
            <X className="h-6 w-6 text-text-secondary hover:text-text-primary" />
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 lg:px-4 lg:py-6 overflow-y-auto custom-scrollbar relative space-y-6 lg:space-y-8">
          {/* Subtle nav background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/[0.03] rounded-full blur-[80px] pointer-events-none" />
          
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1 lg:space-y-2">
              <h3 className="px-3 lg:px-4 text-[9px] lg:text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.2em] lg:tracking-[0.3em]">
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
                        "group flex items-center rounded-2xl px-3 py-3.5 lg:px-4 lg:py-3 text-sm font-bold transition-all duration-300 relative overflow-hidden active:scale-95 lg:active:scale-100",
                        isActive 
                          ? "bg-primary/10 text-primary shadow-sm shadow-primary/5" 
                          : "text-text-secondary hover:bg-secondary dark:hover:bg-white/[0.03] hover:text-text-primary"
                      )}
                    >
                      <item.icon className={cn(
                        "mr-3 lg:mr-4 h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10",
                        isActive ? "text-primary scale-110" : "text-text-secondary group-hover:text-text-primary"
                      )} />
                      <span className="truncate relative z-10 tracking-wide text-[15px] lg:text-sm">{item.name}</span>
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

        <div className="p-3 lg:p-4 border-t border-border bg-background transition-colors duration-500">
          <div className="rounded-[20px] bg-secondary/40 dark:bg-white/[0.02] border border-border p-3 lg:p-4 relative group overflow-hidden transition-all duration-300 hover:bg-secondary/60 dark:hover:bg-white/[0.04]">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent/[0.05] rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Life Streak</span>
              <button 
                onClick={handleRestartStreak}
                className="opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-background dark:bg-[#111418] rounded-full hover:bg-red-500/10 hover:text-red-500 shadow-sm"
                title="Restart Streak"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
            <div className="text-2xl font-heading font-black flex items-center gap-2 relative z-10 text-foreground">
              {streak} <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mt-2">Days</span>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl ml-auto transition-all duration-500",
                streak > 0 
                  ? "bg-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                  : "bg-zinc-500/5 text-zinc-500/10"
              )}>
                <Flame className={cn(
                  "h-5 w-5 transition-all duration-500",
                  streak > 0 ? "fill-orange-500 animate-pulse" : "fill-transparent"
                )} />
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-secondary/60 dark:bg-white/5 rounded-full overflow-hidden relative z-10" title={`Integrity Score: ${Math.round(integrityScore)}%`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${integrityScore}%` }}
                className="h-full bg-accent rounded-full shadow-[0_0_10px_rgba(232,197,71,0.3)]" 
              />
            </div>
            <div className="mt-1 flex justify-between items-center relative z-10">
              <span className="text-[8px] font-bold text-text-secondary uppercase tracking-[0.1em]">Integrity</span>
              <span className="text-[8px] font-black text-accent uppercase tracking-[0.1em]">{Math.round(integrityScore)}%</span>
            </div>
          </div>

          {/* Logout Option - Highly Accessible */}
          <button 
            onClick={() => {
              if (confirm("Terminate current session? Your data will remain synced to the cloud.")) {
                signOut();
              }
            }}
            className="mt-4 w-full flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 text-rose-600 dark:text-rose-500 border border-rose-500/10 font-black uppercase tracking-widest text-[9px] hover:bg-rose-500/10 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              <span>Terminate Session</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
