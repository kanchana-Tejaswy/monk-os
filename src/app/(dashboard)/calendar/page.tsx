"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, ExternalLink, ShieldCheck } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

// Mock data to simulate Google Calendar Sync
const SYNCED_EVENTS = [
  { id: "1", title: "College Lectures", time: "09:00 AM - 01:00 PM", type: "event" },
  { id: "2", title: "Workout Completed", time: "05:30 PM", type: "habit_sync" },
  { id: "3", title: "Deep Work: Coding", time: "07:00 PM - 09:00 PM", type: "focus_sync" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    // In production: Redirect to Google OAuth for Calendar Scopes
    setIsConnected(true);
  };

  const nextDay = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  const prevDay = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Life Timeline</h1>
          <p className="text-muted-foreground mt-1">Your entire history and future in one view.</p>
        </div>
        
        {!isConnected ? (
          <button 
            onClick={handleConnect}
            className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-100 transition-all border border-blue-200"
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
        
        {/* Calendar Navigation (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="monk-card p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevDay} className="p-2 hover:bg-secondary/50 rounded-xl transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="font-heading font-bold">{formatDate(currentDate)}</h2>
              <button onClick={nextDay} className="p-2 hover:bg-secondary/50 rounded-xl transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Mini Month View Placeholder */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-[10px] font-bold text-muted-foreground">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all",
                    i + 1 === currentDate.getDate() ? "bg-primary text-primary-foreground font-bold shadow-md" : "hover:bg-secondary/50"
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          
          {/* Integration Info */}
          <div className="p-6 bg-secondary/10 rounded-[20px] border border-secondary/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-secondary" />
              How Sync Works
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you complete a **Non-Negotiable Habit** or finish a **Deep Work Session**, monk os automatically creates an event in your Google Calendar. Your calendar becomes a true history of your discipline.
            </p>
          </div>
        </div>

        {/* Day Timeline View (Right) */}
        <div className="lg:col-span-8">
          <div className="monk-card p-6 min-h-[500px] relative">
            
            {!isConnected && (
              <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-[20px]">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-heading font-bold text-muted-foreground mb-2">Calendar Disconnected</h3>
                <p className="text-sm text-muted-foreground max-w-sm text-center">Connect your Google account to view your daily timeline and sync your monk os data.</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-bold">Today&apos;s Schedule</h2>
              <button className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all">
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-secondary/20">
              {SYNCED_EVENTS.map((event, i) => (
                <div key={i} className="flex gap-6 relative group">
                  <div className={cn(
                    "h-8 w-8 rounded-full border-4 border-card z-10 flex-shrink-0 flex items-center justify-center",
                    event.type === 'habit_sync' ? 'bg-monk-mint/20 border-monk-mint' : 
                    event.type === 'focus_sync' ? 'bg-primary/20 border-primary' : 
                    'bg-secondary/20 border-secondary'
                  )}>
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      event.type === 'habit_sync' ? 'bg-monk-mint' : 
                      event.type === 'focus_sync' ? 'bg-primary' : 
                      'bg-secondary'
                    )} />
                  </div>
                  
                  <div className="flex-1 bg-background/50 p-4 rounded-2xl border border-monk-rose/10 group-hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{event.time}</div>
                        <div className="font-bold text-foreground">{event.title}</div>
                      </div>
                      {(event.type === 'habit_sync' || event.type === 'focus_sync') && (
                        <div className="p-1.5 bg-card rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer" title="View in Google Calendar">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    {event.type === 'habit_sync' && (
                      <div className="mt-2 text-[10px] font-bold text-monk-mint uppercase tracking-wider bg-monk-mint/10 w-fit px-2 py-0.5 rounded-md">
                        Auto-Synced Habit
                      </div>
                    )}
                    {event.type === 'focus_sync' && (
                      <div className="mt-2 text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 w-fit px-2 py-0.5 rounded-md">
                        Deep Work Session
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
