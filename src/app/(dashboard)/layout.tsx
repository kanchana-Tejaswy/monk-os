"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ProfileDrawer } from "@/components/shared/ProfileDrawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, User, Flame, Bell, CheckCircle2 } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import { calculateStreak } from "@/lib/streak";

interface Habit {
  id: string;
  isNonNegotiable?: boolean;
  is_non_negotiable?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll({ container: containerRef });
  const [hidden, setHidden] = useState(false);
  
  // Dashboard Metrics State
  const [streak, setStreak] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);
  const [deepWork, setDeepWork] = useState(0);

  useEffect(() => {
    function updateMetrics() {
      const savedHabits = localStorage.getItem("monk_os_habits");
      const savedLogs = localStorage.getItem("monk_os_logs");
      const savedFocus = localStorage.getItem("monk_os_focus");
      const restartDate = localStorage.getItem("monk_os_streak_restart");

      if (savedHabits && savedLogs) {
        try {
          const habits = JSON.parse(savedHabits);
          const logs = JSON.parse(savedLogs);
          const nnHabitIds = habits
            .filter((h: Habit) => h.isNonNegotiable || h.is_non_negotiable)
            .map((h: Habit) => h.id);

          // Update Streak
          const currentStreak = calculateStreak(logs, nnHabitIds, restartDate);
          setStreak(currentStreak);

          // Update Daily Score
          const today = new Date().toISOString().split('T')[0];
          const completedNN = nnHabitIds.filter((id: string) => logs[`${today}-${id}`]).length;
          setDailyScore(nnHabitIds.length > 0 ? Math.round((completedNN / nnHabitIds.length) * 100) : 0);
        } catch {
          setStreak(0);
          setDailyScore(0);
        }
      } else {
        setStreak(0);
        setDailyScore(0);
      }

      if (savedFocus) {
        try {
          const focusSessions = JSON.parse(savedFocus);
          const today = new Date().toISOString().split('T')[0];
          const todaySessions = focusSessions.filter((s: { timestamp?: string; completed_at?: string; duration?: number; duration_minutes?: number }) => (s.timestamp || s.completed_at || '').startsWith(today));
          const totalMinutes = todaySessions.reduce((acc: number, curr: { duration?: number; duration_minutes?: number }) => acc + (curr.duration || curr.duration_minutes || 0), 0);
          setDeepWork(Math.round((totalMinutes / 60) * 10) / 10);
        } catch {
          setDeepWork(0);
        }
      } else {
        setDeepWork(0);
      }
    }

    updateMetrics();
    window.addEventListener("streak_updated", updateMetrics);
    window.addEventListener("sync_complete", updateMetrics);
    return () => {
      window.removeEventListener("streak_updated", updateMetrics);
      window.removeEventListener("sync_complete", updateMetrics);
    };
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Calculate current date once to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-background text-foreground relative selection:bg-primary/30">
      {/* Premium subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        
        {/* PREMIUM SAAS TOP HEADER */}
        <motion.header 
          variants={{
            visible: { y: 0 },
            hidden: { y: "-100%" },
          }}
          animate={hidden ? "hidden" : "visible"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex h-[70px] md:h-[80px] items-center justify-between bg-background/80 backdrop-blur-xl fixed lg:sticky top-0 left-0 right-0 lg:left-auto lg:right-auto z-30 px-4 md:px-8 border-b border-border transition-colors duration-500 shadow-sm"
        >
          {/* LEFT SECTION */}
          <div className="flex items-center gap-4 flex-1 lg:flex-none">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center justify-center h-10 w-10 hover:bg-secondary/50 rounded-xl lg:hidden transition-all text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-10 w-10 relative bg-white dark:bg-white/10 rounded-xl overflow-hidden shadow-sm border border-black/5 dark:border-white/10 shrink-0 items-center justify-center">
                <Image 
                  src="/monk-logo.jpeg" 
                  alt="Monk Mode OS" 
                  fill 
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-heading font-black tracking-tight text-foreground uppercase">
                  MONK MODE OS
                </span>
                <span className="hidden md:block text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Personal Execution Operating System
                </span>
              </div>
            </div>
          </div>

          {/* CENTER SECTION */}
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center">
            {mounted && (
              <div className="text-xs font-bold text-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            )}
            <div className="mt-1 px-3 py-0.5 rounded-full bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Month 1: Foundation
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center justify-end gap-3 md:gap-4 flex-1 lg:flex-none">
            
            {/* Compact Metrics - Hidden on small mobile */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              <div className="flex flex-col items-end justify-center px-3 py-1 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-default">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Daily Score</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span className="text-xs font-bold text-foreground leading-none">{dailyScore}%</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-center px-3 py-1 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-default">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Ship Streak</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-foreground leading-none">{streak}</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-center px-3 py-1 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-default">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Deep Work</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-monk-mint animate-pulse" />
                  <span className="text-xs font-bold text-foreground leading-none">{deepWork}h</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-10 w-10 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border transition-colors duration-300">
                <ThemeToggle />
              </div>
              <button 
                className="flex items-center justify-center h-10 w-10 hover:bg-secondary/50 rounded-xl transition-all text-muted-foreground hover:text-foreground border border-border bg-secondary/30 relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </button>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center justify-center h-10 w-10 hover:bg-secondary/50 rounded-xl transition-all text-muted-foreground hover:text-foreground border border-border bg-secondary/30 overflow-hidden"
                title="Identity Profile"
              >
                <User className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.header>

        <main 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 pt-24 pb-12 md:px-10 md:py-12 custom-scrollbar scroll-smooth"
        >
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            {children}
          </div>
        </main>
      </div>

      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}

