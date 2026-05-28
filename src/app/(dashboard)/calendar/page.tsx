"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ExternalLink, 
  ShieldCheck,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  Loader2
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

interface Habit {
  id: string;
  title: string;
  category: string;
  isNonNegotiable: boolean;
}

interface GoogleEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  
  const supabase = createClient();

  useEffect(() => {
    async function checkConnection() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        setIsConnected(true);
        fetchGoogleEvents(session.provider_token, selectedDate);
      }
    }
    
    function loadLocalData() {
      const savedHabits = localStorage.getItem("monk_os_habits");
      const savedLogs = localStorage.getItem("monk_os_logs");
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    }
    
    loadLocalData();
    checkConnection();

    window.addEventListener("streak_updated", loadLocalData);
    return () => window.removeEventListener("streak_updated", loadLocalData);
  }, [selectedDate]);

  const handleConnect = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
        redirectTo: `${window.location.origin}/auth/callback?next=/calendar`
      }
    });

    if (error) {
      console.error("Auth error:", error.message);
      alert("Failed to connect to Google.");
    }
  };

  const fetchGoogleEvents = async (token: string, date: Date) => {
    setIsLoadingEvents(true);
    const timeMin = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const timeMax = new Date(date.setHours(23, 59, 59, 999)).toISOString();

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.items) {
        setGoogleEvents(data.items);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const createGoogleEvent = async (summary: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.provider_token) return alert("Please reconnect your Google Calendar.");

    const now = new Date();
    const event = {
      summary,
      description: "Auto-synced from monk mode Discipline Engine.",
      start: { dateTime: now.toISOString() },
      end: { dateTime: new Date(now.getTime() + 30 * 60000).toISOString() },
    };

    try {
      await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );
      fetchGoogleEvents(session.provider_token, selectedDate);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selectDate = (day: number) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
  };

  const getDayStatus = (day: number) => {
    const d = new Date(year, month, day);
    const dateKey = d.toISOString().split('T')[0];
    const nnHabits = habits.filter(h => h.isNonNegotiable);
    if (nnHabits.length === 0) return 'none';
    
    const completedNN = nnHabits.filter(h => logs[`${dateKey}-${h.id}`]).length;
    if (completedNN === nnHabits.length) return 'perfect';
    if (completedNN > 0) return 'partial';
    return 'none';
  };

  const selectedDateKey = selectedDate.toISOString().split('T')[0];
  const selectedDayHabits = habits.map(h => ({
    ...h,
    completed: !!logs[`${selectedDateKey}-${h.id}`]
  }));

  const nnCompleted = selectedDayHabits.filter(h => h.isNonNegotiable && h.completed).length;
  const nnTotal = habits.filter(h => h.isNonNegotiable).length;
  const integrityScore = nnTotal > 0 ? Math.round((nnCompleted / nnTotal) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground italic">Life Timeline</h1>
          <p className="text-text-secondary font-soft mt-1">Your consistency is the only variable you control.</p>
        </div>
        
        {!isConnected ? (
          <button 
            onClick={handleConnect}
            className="flex items-center gap-2 px-6 py-3 bg-secondary/50 text-text-primary font-bold rounded-2xl hover:bg-secondary transition-all border border-border"
          >
            <CalendarIcon className="h-5 w-5" />
            Connect Google Calendar
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-monk-mint/10 text-monk-mint rounded-xl border border-monk-mint/20 text-sm font-bold">
            <ShieldCheck className="h-4 w-4" />
            Synced with Google
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Calendar Grid (Left) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="monk-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-black italic uppercase tracking-tight">
                {currentMonth.toLocaleString('default', { month: 'long' })} {year}
              </h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-secondary/50 dark:bg-white/5 rounded-xl transition-all">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-secondary/50 dark:bg-white/5 rounded-xl transition-all">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={i} className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Padding for start day */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              
              {/* Actual days */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                return (
                  <button 
                    key={day} 
                    onClick={() => selectDate(day)}
                    className={cn(
                      "aspect-square relative flex flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300 group hover:scale-105",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110 z-10" 
                        : isToday
                          ? "bg-secondary text-foreground border border-primary/20"
                          : "hover:bg-secondary/50 dark:hover:bg-white/[0.03]"
                    )}
                  >
                    <span className={cn(isSelected ? "text-white" : "text-foreground")}>{day}</span>
                    
                    {/* Status Dot */}
                    <div className="absolute bottom-2 flex gap-0.5">
                      {status === 'perfect' && (
                        <div className="h-1 w-1 rounded-full bg-monk-mint shadow-[0_0_5px_rgba(142,217,204,1)]" />
                      )}
                      {status === 'partial' && (
                        <div className="h-1 w-1 rounded-full bg-primary/40" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="monk-card p-6 border-l-4 border-l-monk-mint">
              <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Status Legend</div>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-monk-mint shadow-[0_0_8px_rgba(142,217,204,0.6)]" />
                  <span className="text-xs font-bold text-text-primary">Perfect Day (All NN)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                  <span className="text-xs font-bold text-text-secondary">Partial Progress</span>
                </div>
              </div>
            </div>
            
            <div className="monk-card p-6 border-l-4 border-l-primary">
              <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Selected Date</div>
              <div className="text-lg font-heading font-black italic mt-2">
                {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'short' })}
              </div>
              <div className="text-xs font-bold text-primary mt-1">
                Integrity: {integrityScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Day Details (Right) */}
        <div className="lg:col-span-5">
          <div className="monk-card p-8 min-h-[500px] flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-heading font-black italic uppercase tracking-tight">Daily Evidence</h2>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">
                  {formatDate(selectedDate)}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                integrityScore === 100 
                  ? "bg-monk-mint/10 border-monk-mint/20 text-monk-mint shadow-[0_0_15px_rgba(142,217,204,0.2)]" 
                  : "bg-secondary/30 border-border text-text-secondary"
              )}>
                <Target className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence mode="popLayout">
                {isLoadingEvents ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-bold uppercase tracking-widest">Synchronizing Timeline...</p>
                  </div>
                ) : (
                  <>
                    {/* Habit Logs */}
                    {selectedDayHabits.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Discipline Logs</h3>
                        {selectedDayHabits.map((habit) => (
                          <motion.div 
                            key={habit.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
                              habit.completed 
                                ? "bg-monk-mint/[0.03] border-monk-mint/20" 
                                : "bg-secondary/20 border-border/50"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                                habit.completed ? "bg-monk-mint text-white" : "bg-secondary text-text-secondary opacity-40"
                              )}>
                                {habit.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                              </div>
                              <div>
                                <div className={cn(
                                  "text-sm font-bold tracking-tight",
                                  habit.completed ? "text-foreground" : "text-text-secondary"
                                )}>
                                  {habit.title}
                                </div>
                                <div className="text-[9px] font-black text-text-secondary/50 uppercase tracking-widest">
                                  {habit.isNonNegotiable ? 'Non-Negotiable' : 'Maintenance'}
                                </div>
                              </div>
                            </div>
                            {habit.completed && habit.isNonNegotiable && (
                              <Flame className="h-4 w-4 text-orange-500 fill-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Google Events */}
                    {googleEvents.length > 0 && (
                      <div className="space-y-3 mt-8">
                        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 px-1">External Timeline</h3>
                        {googleEvents.map((event) => (
                          <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.03] flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <CalendarIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-sm font-bold tracking-tight text-foreground">
                                  {event.summary}
                                </div>
                                <div className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">
                                  {event.start.dateTime 
                                    ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'All Day Event'}
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-blue-500/30 group-hover:text-blue-500 transition-colors" />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {selectedDayHabits.length === 0 && googleEvents.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-30">
                        <CalendarIcon className="h-12 w-12" />
                        <p className="text-sm font-bold uppercase tracking-widest">No evidence recorded for this cycle</p>
                      </div>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quote of the Day at bottom of details */}
            <div className="mt-8 p-6 bg-secondary/10 dark:bg-white/[0.02] rounded-2xl border border-border italic text-xs text-text-secondary leading-relaxed font-soft">
              &quot;The successful man is the average man, focused.&quot; — Your discipline on {formatDate(selectedDate)} is the seed of your future self.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
