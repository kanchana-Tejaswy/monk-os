"use client";

import Link from "next/link";
import { 
  Flame, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Brain,
  TrendingUp,
  Heart,
  Dumbbell
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { RedeemCodeSection } from "@/components/pricing/RedeemCodeSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 overflow-x-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/10 transition-colors duration-300">
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
              <Flame className="h-6 w-6" />
            </div>
            <span className="text-2xl font-heading font-extrabold tracking-tight">monk os</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#manifesto">Manifesto</NavLink>
            <NavLink href="#system">The System</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-bold bg-foreground text-background px-6 py-3 rounded-full hover:scale-105 transition-all shadow-xl hover:shadow-primary/20"
            >
              Start Monk Mode
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full pt-24 pb-16 px-4 md:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border shadow-sm text-xs font-bold uppercase tracking-widest text-foreground mx-auto"
          >
            <ShieldCheck className="h-4 w-4 text-success" /> Built for Deep Work & Self-Mastery
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl sm:text-7xl md:text-9xl font-heading font-black tracking-tight leading-[0.9] flex flex-col items-center"
          >
            <span className="block">Stop Chasing</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C1CC] via-[#E8C547] to-[#C7EDE6] italic drop-shadow-sm">
              Motivation.
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tighter mt-4 opacity-90">
              Build Systems That Create Discipline.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-soft max-w-2xl mx-auto leading-relaxed"
          >
            Motivation gets you started. Environment keeps you going. Replace scattered habits with a single, uncompromising digital battlefield.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          >
            <Link 
              href="/login" 
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-bold rounded-[24px] text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/30"
            >
              Enter Monk Mode <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Join the disciplined few
            </p>
          </motion.div>
        </div>
      </main>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-24 md:py-32 px-6 bg-foreground text-background border-y border-border/10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-foreground to-foreground opacity-50 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-extrabold tracking-tighter uppercase leading-tight">
            You vs. You. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C1CC] via-[#E8C547] to-[#F6C1CC] italic drop-shadow-[0_0_15px_rgba(246,193,204,0.3)]">
              The Ultimate Battleground.
            </span>
          </h2>
          <p className="text-xl md:text-2xl font-soft opacity-80 leading-relaxed max-w-3xl mx-auto">
            This isn&apos;t for everyone. Typical apps let you lie to yourself by back-filling history. Not here. In monk os, the only opponent is the version of you that wants to quit.
          </p>
          <div className="inline-block border border-primary/30 rounded-2xl p-6 bg-background/5 backdrop-blur-sm">
            <p className="text-lg font-heading font-bold text-primary uppercase tracking-widest">
              &quot;Discipline is choosing between what you want now, and what you want most.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* The 48-Hour Integrity Section */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="space-y-8 order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] -z-10" />
            <div className="monk-card p-6 sm:p-10 bg-card shadow-xl space-y-6 relative border border-border">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-success rounded-xl flex items-center justify-center text-[#121212] shadow-md shadow-success/30">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg text-foreground">Morning Chanting</span>
                </div>
                <span className="text-[10px] font-bold text-success uppercase tracking-widest hidden sm:block">Verified</span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/10 border border-secondary/20 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-secondary/30 rounded-xl flex items-center justify-center text-muted-foreground">
                    <Lock className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg text-muted-foreground">Deep Work: Coding</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Locked</span>
              </div>
              <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest pt-4">
                Yesterday was locked 4 hours ago. No edits allowed.
              </p>
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <div className="h-16 w-16 bg-accent/20 flex items-center justify-center rounded-[20px] text-accent">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-tight">
              The 48-Hour <br/>Integrity Rule.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-soft leading-relaxed">
              If you miss a day, you own it. 
              <br/><br/>
              In <strong className="text-foreground">monk os</strong>, logs permanently lock after 48 hours. No back-filling. No lying to yourself. Real discipline requires real consequences.
            </p>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex flex-col">
                <span className="text-4xl font-heading font-extrabold text-success">100%</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Honest Tracking</span>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex flex-col">
                <span className="text-4xl font-heading font-extrabold text-primary">0</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Fake Streaks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Identity Domains */}
      <section id="system" className="py-20 md:py-28 bg-secondary/5 px-4 md:px-8 border-y border-border/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight">Identity-Driven Domains.</h2>
            <p className="text-lg md:text-xl text-muted-foreground font-soft max-w-2xl mx-auto">
              Life is holistic. We don&apos;t just track tasks; we track the evolution of your identity across four core pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <DomainCard 
              icon={Brain} 
              title="Academic" 
              desc="Deep focus on lectures, records, and exam revision." 
              color="text-secondary" 
              bg="bg-secondary/10" 
              borderColor="hover:border-secondary/30"
            />
            <DomainCard 
              icon={Dumbbell} 
              title="Physical" 
              desc="Mastery over your vessel through workout discipline." 
              color="text-success" 
              bg="bg-success/10" 
              borderColor="hover:border-success/30"
            />
            <DomainCard 
              icon={Heart} 
              title="Emotional" 
              desc="Daily gratitude and reflection in the Digital Ashram." 
              color="text-primary" 
              bg="bg-primary/10" 
              borderColor="hover:border-primary/30"
            />
            <DomainCard 
              icon={TrendingUp} 
              title="Financial" 
              desc="Money discipline through conscious spending logs." 
              color="text-accent" 
              bg="bg-accent/10" 
              borderColor="hover:border-accent/30"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section (Free vs Premium) */}
      <section id="pricing" className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight">Invest in Your Evolution.</h2>
            <p className="text-lg md:text-xl text-muted-foreground font-soft max-w-2xl mx-auto">
              Discipline isn&apos;t cheap. But the cost of regret is higher. Choose the tier that matches your commitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="monk-card p-10 border border-border hover:border-primary/30 transition-all flex flex-col bg-card relative z-10">
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-heading font-bold text-muted-foreground uppercase tracking-widest">Initiate</h3>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-heading font-extrabold text-foreground">Free</span>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest pb-1">/ Forever</span>
                </div>
                <p className="text-sm text-muted-foreground font-soft">The foundation of discipline. Everything you need to start building habits.</p>
              </div>

              <div className="space-y-4 flex-1">
                <PricingFeature text="4 Non-Negotiable Habits" />
                <PricingFeature text="Basic Streak Tracking" />
                <PricingFeature text="Track Daily Expenses & Spending" />
                <PricingFeature text="Manage up to 3 Goals" />
                <PricingFeature text="Normal Dashboard Access" />
              </div>

              <Link href="/login" className="mt-10 w-full py-4 rounded-[20px] bg-secondary/20 text-foreground font-bold text-lg hover:bg-secondary/30 transition-all flex justify-center border border-secondary/30">
                Start the Path
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="monk-card p-10 md:p-12 border-2 border-primary shadow-2xl shadow-primary/10 flex flex-col h-full bg-primary/5 relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Flame className="h-32 w-32 text-primary" />
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full">
                Required for Mastery
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <h3 className="text-3xl font-heading font-bold text-primary uppercase tracking-widest">Mastery</h3>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-heading font-extrabold text-foreground">₹499</span>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest pb-2">/ Month</span>
                </div>
                <p className="text-sm text-foreground font-soft">For those who take their identity evolution seriously. Unlocks advanced analytics and infinite tracking.</p>
              </div>

              <div className="space-y-4 flex-1 relative z-10">
                <PricingFeature text="Debt & Bill Management System" highlight />
                <PricingFeature text="Unlimited Guidance & Tasks via Gmail" highlight />
                <PricingFeature text="Direct Email Guidance Messages" highlight />
                <PricingFeature text="Unlimited Non-Negotiables" highlight />
                <PricingFeature text="Unlimited Goal Management" highlight />
                <PricingFeature text="Google Calendar Auto-Sync" highlight />
                <PricingFeature text="Advanced Life Score Analytics" highlight />
              </div>

              <Link href="/login" className="mt-10 w-full py-5 rounded-[24px] bg-primary text-primary-foreground font-bold text-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center shadow-xl shadow-primary/30 relative z-10">
                Unlock Mastery
              </Link>
            </div>
          </div>

          <RedeemCodeSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-40 px-6 text-center bg-foreground text-background border-t border-border/10">
        <div className="max-w-4xl mx-auto space-y-12">
          <Flame className="h-20 w-20 text-primary mx-auto animate-pulse" />
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-heading font-extrabold tracking-tighter uppercase leading-tight">
            Your Best Life is <br/>A Click Away.
          </h2>
          <p className="text-lg md:text-xl text-background/70 font-soft max-w-2xl mx-auto leading-relaxed">
            Stop living by accident. Start engineering your evolution with monk os today.
          </p>
          <div className="pt-10">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-3 px-12 py-6 bg-primary text-primary-foreground font-bold rounded-[32px] text-2xl hover:scale-105 transition-transform shadow-2xl shadow-primary/20 w-full sm:w-auto"
            >
              Enter the Ashram
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-16 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-xl text-primary-foreground">
                <Flame className="h-5 w-5" />
              </div>
              <span className="text-2xl font-heading font-bold tracking-tight">monk os</span>
            </div>
            <p className="text-muted-foreground font-soft max-w-sm leading-relaxed text-lg">
              Engineering the environment where self-mastery becomes automatic. Built for the disciplined few.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-xs text-foreground/50">System</h4>
            <ul className="space-y-4 text-base font-medium text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/habits" className="hover:text-primary transition-colors">Habit Tracker</Link></li>
              <li><Link href="/focus" className="hover:text-primary transition-colors">Deep Work</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-xs text-foreground/50">Connect</h4>
            <ul className="space-y-4 text-base font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <span>© 2026 monk os. All rights reserved.</span>
          <span>Peace is the Ultimate Productivity.</span>
        </div>
      </footer>

    </div>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
      {children}
    </Link>
  );
}

interface DomainCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  bg: string;
  borderColor: string;
}

function DomainCard({ icon: Icon, title, desc, color, bg, borderColor }: DomainCardProps) {
  return (
    <div className={cn("monk-card p-6 md:p-8 border border-transparent transition-all duration-300 h-full flex flex-col items-center text-center", borderColor)}>
      <div className={`h-14 w-14 rounded-[20px] flex items-center justify-center mb-6 shrink-0 ${bg}`}>
        <Icon className={`h-7 w-7 ${color}`} />
      </div>
      <h3 className="text-xl font-heading font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground font-soft leading-relaxed text-sm md:text-base">{desc}</p>
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
