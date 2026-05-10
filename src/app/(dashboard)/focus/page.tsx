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
  History,
  Trash2,
  X,
  Plus,
  Check,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FocusSession {
  id: string;
  mode: string;
  duration: number;
  timestamp: string;
}

interface CustomMode {
  name: string;
  color: string;
  bg: string;
}

const DEFAULT_MODES: Record<string, CustomMode> = {
  Study: { color: "text-secondary", bg: "bg-secondary dark:bg-secondary/10" },
  Coding: { color: "text-primary", bg: "bg-primary/10" },
  Reading: { color: "text-accent", bg: "bg-accent/10" },
  Meditation: { color: "text-monk-mint", bg: "bg-monk-mint/10" },
};

export default function FocusPage() {
  const [mode, setMode] = useState<string>("Coding");
  const [customModes, setCustomModes] = useState<Record<string, CustomMode>>(DEFAULT_MODES);
  const [targetDuration, setTargetDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [newModeName, setNewModeName] = useState("");
  const [isAddingMode, setIsAddMode] = useState(false);

  useEffect(() => {
    const savedLogs = localStorage.getItem("monk_os_focus");
    if (savedLogs) setHistory(JSON.parse(savedLogs));

    const savedModes = localStorage.getItem("monk_os_custom_modes");
    if (savedModes) setCustomModes({ ...DEFAULT_MODES, ...JSON.parse(savedModes) });

    const savedDuration = localStorage.getItem("monk_os_focus_duration");
    if (savedDuration) {
      const d = parseInt(savedDuration);
      setTargetDuration(d);
      setTimeLeft(d * 60);
    }
  }, []);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(targetDuration * 60);
  }, [targetDuration]);

  const updateDuration = (mins: number) => {
    const val = Math.max(1, Math.min(120, mins));
    setTargetDuration(val);
    if (!isActive) setTimeLeft(val * 60);
    localStorage.setItem("monk_os_focus_duration", val.toString());
  };

  const addCustomMode = () => {
    if (!newModeName.trim()) return;
    const newModes = {
      ...customModes,
      [newModeName]: { color: "text-primary", bg: "bg-primary/10" }
    };
    setCustomModes(newModes);
    localStorage.setItem("monk_os_custom_modes", JSON.stringify(newModes));
    setNewModeName("");
    setIsAddMode(false);
  };

  const deleteLog = (id: string) => {
    const newHistory = history.filter(s => s.id !== id);
    setHistory(newHistory);
    localStorage.setItem("monk_os_focus", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("monk_os_focus");
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const newSession: FocusSession = {
        id: Math.random().toString(36).substr(2, 9),
        mode,
        duration: targetDuration,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [newSession, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("monk_os_focus", JSON.stringify(updatedHistory));
      setSessionsCompleted(prev => prev + 1);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, history, targetDuration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-10rem)] py-8 md:py-12 flex flex-col items-center justify-center space-y-8 md:space-y-12 animate-in fade-in zoom-in duration-700 relative">
      
      {/* Top Header Actions */}
      <div className="absolute top-0 right-0 p-4 md:p-0 flex gap-3 md:gap-4">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-card border border-border rounded-xl text-text-secondary hover:text-primary transition-all shadow-sm"
          title="Focus Settings"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button 
          onClick={() => setShowLogs(true)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all shadow-sm"
        >
          <History className="h-4 w-4" /> View Logs
        </button>
      </div>

      {/* Mode Selection */}
      {!isActive && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 px-4 max-w-2xl"
        >
          {Object.keys(customModes).map((m) => {
            const Config = customModes[m];
            const Icon = (DEFAULT_MODES[m] as any)?.icon || Zap;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all duration-300 border-2",
                  mode === m 
                    ? cn("border-primary bg-primary/5 text-primary scale-105 shadow-sm") 
                    : "border-transparent bg-card text-text-secondary hover:bg-secondary dark:bg-secondary/30"
                )}
              >
                <Icon className="h-4 md:h-5 w-4 md:w-5" />
                <span className="text-sm md:text-base">{m}</span>
              </button>
            );
          })}
          
          {isAddingMode ? (
            <div className="flex items-center gap-2 bg-card border-2 border-primary/30 p-1 px-3 rounded-xl md:rounded-2xl animate-in zoom-in duration-300">
               <input 
                 autoFocus
                 value={newModeName}
                 onChange={(e) => setNewModeName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && addCustomMode()}
                 placeholder="Mode Name..."
                 className="bg-transparent border-none focus:ring-0 text-sm font-bold w-24 md:w-32"
               />
               <button onClick={addCustomMode} className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"><Check className="h-4 w-4" /></button>
               <button onClick={() => setIsAddMode(false)} className="p-1 text-text-secondary hover:bg-secondary rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddMode(true)}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold border-2 border-dashed border-border text-text-secondary hover:border-primary/40 hover:text-primary transition-all"
            >
              <Plus className="h-4 w-4" /> <span className="text-sm md:text-base">Custom</span>
            </button>
          )}
        </motion.div>
      )}

      {/* Timer Display */}
      <div className="relative flex items-center justify-center scale-90 md:scale-100">
        <svg className="w-64 h-64 md:w-80 md:h-80 -rotate-90">
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary/10" />
          <motion.circle
            cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray="942"
            animate={{ strokeDashoffset: 942 * (1 - timeLeft / (targetDuration * 60)) }}
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
            className="text-5xl md:text-7xl font-heading font-bold tabular-nums tracking-tighter"
          >
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </motion.div>
          <div className="text-xs md:text-sm font-bold text-text-secondary uppercase tracking-[0.2em] mt-2 text-center">
            {isActive ? "Deep Work" : "Ready to Focus"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={resetTimer}
          className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-secondary dark:bg-secondary/20 text-text-secondary hover:bg-secondary dark:bg-secondary/40 transition-all"
        >
          <RotateCcw className="h-5 md:h-6 w-5 md:w-6" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={cn(
            "h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl shadow-primary/20",
            isActive ? "bg-card text-primary border-2 border-primary" : "bg-primary text-primary-foreground"
          )}
        >
          {isActive ? <Pause className="h-6 md:h-8 w-6 md:w-8 fill-current" /> : <Play className="h-6 md:h-8 w-6 md:w-8 fill-current ml-1" />}
        </button>

        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-secondary dark:bg-secondary/20 text-text-secondary hover:bg-secondary dark:bg-secondary/40 transition-all"
        >
          <Settings2 className="h-5 md:h-6 w-5 md:w-6" />
        </button>
      </div>

      {/* Sessions Tracker */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-card rounded-xl md:rounded-2xl border border-border">
        <div className="flex -space-x-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={cn("h-2 md:h-2.5 w-2 md:w-2.5 rounded-full border-2 border-card", i < sessionsCompleted ? "bg-monk-mint" : "bg-secondary dark:bg-secondary/40")} />
          ))}
        </div>
        <span className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-wider ml-2">
          {sessionsCompleted}/4 Sessions Completed
        </span>
      </div>

      {/* Active Mode Label */}
      <AnimatePresence>
        {isActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="fixed bottom-12 text-2xl font-heading font-light tracking-[0.5em] uppercase pointer-events-none">
            {mode} Mode
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logs Drawer */}
      <AnimatePresence>
        {showLogs && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogs(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col p-8 md:p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><History className="h-5 w-5" /></div><h2 className="text-2xl font-heading font-black tracking-tighter uppercase italic">Focus Logs</h2></div>
                <button onClick={() => setShowLogs(false)} className="p-2 hover:bg-secondary rounded-full transition-all text-text-secondary"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {history.length > 0 ? history.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-5 rounded-[24px] bg-secondary/30 border border-border group transition-all hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-card shadow-sm text-primary"><Zap className="h-5 w-5" /></div>
                      <div>
                        <div className="font-bold text-sm text-text-primary">{session.mode}</div>
                        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                          {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration}m
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteLog(session.id)} className="p-2 text-text-secondary/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )) : <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30"><History className="h-16 w-16" /><p className="text-sm font-bold uppercase tracking-[0.2em]">No history yet</p></div>}
              </div>
              {history.length > 0 && <button onClick={clearHistory} className="mt-8 w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all hover:scale-[1.02] active:scale-95">Clear All History</button>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col p-8 md:p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Settings2 className="h-5 w-5" /></div><h2 className="text-2xl font-heading font-black tracking-tighter uppercase italic">Timer Settings</h2></div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-secondary rounded-full transition-all text-text-secondary"><X /></button>
              </div>
              
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary">Focus Duration</label>
                    <span className="text-2xl font-heading font-black text-primary">{targetDuration} min</span>
                  </div>
                  <input 
                    type="range" min="1" max="120" value={targetDuration}
                    onChange={(e) => updateDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 25, 45, 60].map(val => (
                      <button 
                        key={val} 
                        onClick={() => updateDuration(val)}
                        className={cn("py-2 rounded-xl text-[10px] font-black border transition-all", targetDuration === val ? "bg-primary/10 border-primary text-primary" : "bg-secondary/50 border-border text-text-secondary hover:border-primary/30")}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-10 border-t border-border space-y-6">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary">Active System</h3>
                   <div className="p-5 rounded-[24px] bg-secondary/30 border border-border">
                      <p className="text-sm font-soft text-text-secondary leading-relaxed">Adjust your focus duration to match your deep work capacity. Changes will apply after the next reset.</p>
                   </div>
                </div>
              </div>

              <button onClick={() => setShowSettings(false)} className="mt-auto w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">Save & Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
