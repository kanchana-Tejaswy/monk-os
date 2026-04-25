"use client";

import { 
  Flame, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Heart, 
  BookText,
  Play,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 1. Header & Greeting */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-xs"
          >
            <Sparkles className="h-4 w-4" /> Identity Evolution Active
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter">
            Peace be with you, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">Monk.</span>
          </h1>
          <p className="text-muted-foreground font-soft text-lg">
            Today is a clean slate. 72% of your potential is currently active.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[24px] border border-monk-rose/20 shadow-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-secondary/20 flex items-center justify-center text-[10px] font-bold">
                M{i}
              </div>
            ))}
          </div>
          <div className="pr-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Peers</div>
            <div className="text-sm font-bold">3 Monks Online</div>
          </div>
        </div>
      </header>

      {/* 2. Primary Status Aura Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AuraCard 
          label="Life Score" 
          value="82" 
          sub="Elite" 
          icon={Sparkles} 
          color="text-accent" 
          glow="shadow-accent/20"
          bg="bg-accent/10"
        />
        <AuraCard 
          label="Current Streak" 
          value="12 Days" 
          sub="+2 Today" 
          icon={Flame} 
          color="text-primary" 
          glow="shadow-primary/20"
          bg="bg-primary/10"
        />
        <AuraCard 
          label="Deep Work" 
          value="3h 20m" 
          sub="Goal: 4h" 
          icon={Zap} 
          color="text-secondary" 
          glow="shadow-secondary/20"
          bg="bg-secondary/10"
        />
        <AuraCard 
          label="Net Balance" 
          value="₹12.4k" 
          sub="Stable" 
          icon={Wallet} 
          color="text-monk-mint" 
          glow="shadow-monk-mint/20"
          bg="bg-monk-mint/10"
        />
      </div>

      {/* 3. Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Habits & Missions */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Deep Work Portal */}
          <section className="relative overflow-hidden rounded-[32px] bg-[#2E2E2E] p-8 text-white shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-heading font-bold tracking-tight">Enter Flow State.</h2>
                <p className="text-white/60 font-soft max-w-sm">
                  Start a deep work session to categorize your effort and boost your Life Score.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Coding</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Reading</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Study</span>
                </div>
              </div>
              <Link href="/focus" className="h-24 w-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl group">
                <Play className="h-10 w-10 fill-current ml-1 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </section>

          {/* Today's Non-Negotiables */}
          <section className="monk-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-heading font-bold">Non-Negotiables</h2>
                <p className="text-sm text-muted-foreground">The foundation of your identity today.</p>
              </div>
              <Link href="/habits" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                View Tracker <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Morning Chanting", completed: true, time: "8:00 AM" },
                { title: "45m Workout", completed: false, time: "5:30 PM" },
                { title: "Deep Work: Coding", completed: true, time: "10:30 AM" },
                { title: "Daily Reflection", completed: false, time: "9:30 PM" },
              ].map((habit, i) => (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  key={i} 
                  className={cn(
                    "flex items-center justify-between p-5 rounded-[24px] border-2 transition-all",
                    habit.completed ? "bg-monk-mint/5 border-monk-mint/20" : "bg-background border-monk-rose/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      habit.completed ? "bg-monk-mint text-white" : "bg-secondary/20 text-muted-foreground"
                    )}>
                      {habit.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{habit.title}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{habit.time}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Mini Widgets */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Financial Snapshot */}
          <section className="monk-card p-8 bg-secondary/10 border-secondary/20">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-6">Financial Pulse</h3>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-heading font-bold">₹3,420</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase mt-1">Spent this month</div>
                </div>
                <div className="text-monk-mint font-bold text-sm flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> 12% Savings
                </div>
              </div>
              <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[65%] rounded-full shadow-[0_0_10px_rgba(232,223,245,0.5)]" />
              </div>
              <Link href="/finance" className="block text-center py-3 bg-white/50 hover:bg-white rounded-xl text-xs font-bold transition-all border border-monk-rose/10">
                Manage Money
              </Link>
            </div>
          </section>

          {/* Recent Reflection */}
          <section className="monk-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BookText className="h-24 w-24" />
            </div>
            <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Last Reflection</h3>
            <p className="font-soft text-lg leading-relaxed italic text-foreground/80">
              "Consistency beats intensity. The small repetitions are where the true self is forged..."
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Emotional Domain</span>
              </div>
              <Link href="/journal">
                <ChevronRight className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </section>

          {/* Vision Goals Progress */}
          <section className="monk-card p-8">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">Active Visions</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>AI Engineer</span>
                  <span className="text-primary">45%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%] rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>Physical Mastery</span>
                  <span className="text-monk-mint">80%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-monk-mint w-[80%] rounded-full" />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function AuraCard({ label, value, sub, icon: Icon, color, glow, bg }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "monk-card p-6 flex flex-col justify-between h-40 shadow-xl border border-monk-rose/10 relative overflow-hidden group",
        glow
      )}
    >
      <div className={cn("absolute -right-4 -top-4 p-8 rounded-full opacity-0 group-hover:opacity-10 transition-all", bg)}>
        <Icon className="h-20 w-20" />
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
        <div className={cn("p-2 rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl font-heading font-extrabold tracking-tight">{value}</div>
        <div className={cn("text-xs font-bold mt-1", color)}>{sub}</div>
      </div>
    </motion.div>
  );
}
