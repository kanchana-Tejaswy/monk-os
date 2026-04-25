"use client";

import Link from "next/link";
import { Flame, CheckCircle2, Sparkles, Zap, Target, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FFF8FA] font-sans text-[#2E2E2E] selection:bg-primary/30">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Origin</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#F6C1CC] flex items-center justify-center rounded-xl text-[#2E2E2E] shadow-lg shadow-primary/20">
            <Flame className="h-5 w-5" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tight">monk os</span>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-4 text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-secondary-foreground text-xs font-bold uppercase tracking-widest"
        >
          <Sparkles className="h-3 w-3" /> Choose Your Path
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-heading font-extrabold tracking-tighter"
        >
          Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">Evolution.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground font-soft max-w-2xl mx-auto"
        >
          Discipline isn't cheap. But the cost of regret is higher. Choose the tier that matches your commitment.
        </motion.p>
      </section>

      {/* Pricing Grid */}
      <section className="py-12 px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="monk-card p-10 border-2 border-monk-rose/10 hover:border-primary/20 transition-all flex flex-col h-full bg-white"
          >
            <div className="space-y-4 mb-8">
              <h3 className="text-2xl font-heading font-bold text-muted-foreground">Initiate</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-heading font-extrabold text-foreground">₹0</span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest pb-1">/ Forever</span>
              </div>
              <p className="text-sm text-muted-foreground font-soft">The foundation of discipline. Everything you need to start building habits.</p>
            </div>

            <div className="space-y-4 flex-1">
              <PricingFeature text="3 Non-Negotiable Habits" />
              <PricingFeature text="Basic Pomodoro Timer" />
              <PricingFeature text="7-Day History Logs" />
              <PricingFeature text="Standard Journal" />
            </div>

            <Link href="/login" className="mt-10 w-full py-4 rounded-[20px] bg-secondary/20 text-foreground font-bold text-lg hover:bg-secondary/30 transition-all flex justify-center border border-secondary/30">
              Start Free
            </Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="monk-card p-12 border-2 border-primary shadow-2xl shadow-primary/20 flex flex-col h-full bg-primary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Flame className="h-32 w-32 text-primary" />
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full">
              Recommended
            </div>

            <div className="space-y-4 mb-8 relative z-10">
              <h3 className="text-3xl font-heading font-bold text-primary">Mastery</h3>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-heading font-extrabold text-foreground">₹499</span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest pb-2">/ Month</span>
              </div>
              <p className="text-sm text-foreground font-soft">For those who take their identity evolution seriously. Unlocks advanced analytics and infinite tracking.</p>
            </div>

            <div className="space-y-4 flex-1 relative z-10">
              <PricingFeature text="Unlimited Non-Negotiables" highlight />
              <PricingFeature text="Google Calendar Auto-Sync" highlight />
              <PricingFeature text="Advanced Life Score Analytics" highlight />
              <PricingFeature text="Debt & Bill Automation" highlight />
              <PricingFeature text="Vision Board & Milestones" highlight />
            </div>

            <Link href="/login" className="mt-10 w-full py-5 rounded-[24px] bg-primary text-primary-foreground font-bold text-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center shadow-xl shadow-primary/30 relative z-10">
              Unlock Mastery
            </Link>
          </motion.div>

        </div>

        {/* FAQ / Trust */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-accent" /> Cancel Anytime. No questions asked.
          </p>
        </motion.div>
      </section>
    </div>
  );
}

function PricingFeature({ text, highlight }: { text: string, highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
        highlight ? "bg-primary/20 text-primary" : "bg-secondary/30 text-muted-foreground"
      )}>
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <span className={cn(
        "font-medium",
        highlight ? "text-foreground font-bold" : "text-muted-foreground"
      )}>{text}</span>
    </div>
  );
}
