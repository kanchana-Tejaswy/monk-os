"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Brain, 
  Code, 
  BookOpen, 
  Wind,
  Settings2,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type FocusMode = "Study" | "Coding" | "Reading" | "Meditation";

const MODES: Record<FocusMode, { icon: any; color: string; bg: string }> = {
  Study: { icon: BookOpen, color: "text-secondary", bg: "bg-secondary/10" },
  Coding: { icon: Code, color: "text-primary", bg: "bg-primary/10" },
  Reading: { icon: Brain, color: "text-accent", bg: "bg-accent/10" },
  Meditation: { icon: Wind, color: "text-monk-mint", bg: "bg-monk-mint/10" },
};

export default function FocusPage() {
  const [mode, setMode] = useState<FocusMode>("Coding");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setSessionsCompleted(prev => {
        const newCount = prev + 1;
        // Save to focus history
        const savedFocus = localStorage.getItem("monk_os_focus");
        const focusHistory = savedFocus ? JSON.parse(savedFocus) : [];
        const newSession = {
          id: Math.random().toString(36).substr(2, 9),
          mode,
          duration: 25, // minutes
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("monk_os_focus", JSON.stringify([newSession, ...focusHistory]));
        return newCount;
      });
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-700">
      
      {/* Mode Selection */}
      {!isActive && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {(Object.keys(MODES) as FocusMode[]).map((m) => {
            const Config = MODES[m];
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 border-2",
                  mode === m 
                    ? cn("border-primary bg-primary/5 text-primary scale-105 shadow-sm") 
                    : "border-transparent bg-card text-muted-foreground hover:bg-secondary/30"
                )}
              >
                <Config.icon className="h-5 w-5" />
                {m}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        {/* Progress Circle (Subtle SVG) */}
        <svg className="w-80 h-80 -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="150"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-secondary/10"
          />
          <motion.circle
            cx="160"
            cy="160"
            r="150"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 150}
            animate={{ strokeDashoffset: (2 * Math.PI * 150) * (1 - timeLeft / (25 * 60)) }}
            transition={{ duration: 1, ease: "linear" }}
            className="text-primary"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <motion.div 
            key={timeLeft}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl font-heading font-bold tabular-nums tracking-tighter"
          >
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </motion.div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
            {isActive ? "Deep Work" : "Ready to Focus"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-secondary/20 text-muted-foreground hover:bg-secondary/40 transition-all"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={cn(
            "h-20 w-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl shadow-primary/20",
            isActive ? "bg-card text-primary border-2 border-primary" : "bg-primary text-primary-foreground"
          )}
        >
          {isActive ? (
            <Pause className="h-8 w-8 fill-current" />
          ) : (
            <Play className="h-8 w-8 fill-current ml-1" />
          )}
        </button>

        <button className="p-4 rounded-2xl bg-secondary/20 text-muted-foreground hover:bg-secondary/40 transition-all">
          <Settings2 className="h-6 w-6" />
        </button>
      </div>

      {/* Sessions Tracker */}
      <div className="flex items-center gap-2 px-6 py-3 bg-card rounded-2xl border border-monk-rose/10">
        <div className="flex -space-x-1">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-2.5 w-2.5 rounded-full border-2 border-card",
                i < sessionsCompleted ? "bg-monk-mint" : "bg-secondary/40"
              )} 
            />
          ))}
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">
          {sessionsCompleted}/4 Sessions Completed
        </span>
      </div>

      {/* Active Mode Label (Zen Style) */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-12 text-2xl font-heading font-light tracking-[0.5em] uppercase pointer-events-none"
          >
            {mode} Mode
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
