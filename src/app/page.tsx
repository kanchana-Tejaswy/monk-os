"use client";

import Link from "next/link";
import { 
  Flame, 
  CheckCircle2, 
  Zap, 
  LayoutDashboard, 
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 overflow-x-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-monk-rose/20">
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
              <Flame className="h-6 w-6" />
            </div>
            <span className="text-2xl font-heading font-extrabold tracking-tight">monk os</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Philosophy</NavLink>
            <NavLink href="#system">The System</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
          </div>
          <div className="flex items-center gap-4">
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
      <main className="flex-1 w-full pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-monk-rose/30 shadow-sm text-xs font-bold uppercase tracking-widest text-foreground mx-auto"
          >
            <ShieldCheck className="h-4 w-4 text-monk-mint" /> Built for Deep Work & Self-Mastery
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-8xl font-heading font-extrabold tracking-tighter leading-[1.1]"
          >
            Don't Chase <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">Discipline.</span> <br className="hidden md:block" />
            Engineer It.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-soft max-w-2xl mx-auto leading-relaxed"
          >
            Replace your scattered habit trackers, journals, and planners with a single, peaceful digital ashram. Focus on what truly matters.
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
              Join 12,000+ builders
            </p>
          </motion.div>
        </div>

        {/* Abstract Dashboard Representation */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24 max-w-5xl mx-auto border-[8px] border-card/50 rounded-[40px] shadow-2xl bg-card overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="col-span-2 space-y-6">
                <div className="h-10 w-48 bg-secondary/30 rounded-xl animate-pulse" />
                <div className="h-40 w-full bg-primary/10 rounded-[32px] border border-primary/20 flex items-center justify-center">
                   <Flame className="h-16 w-16 text-primary opacity-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-monk-mint/10 rounded-[24px] border border-monk-mint/20" />
                  <div className="h-32 bg-accent/10 rounded-[24px] border border-accent/20" />
                </div>
             </div>
             <div className="space-y-6">
               <div className="h-full w-full bg-secondary/10 rounded-[32px] border border-secondary/20 flex flex-col items-center justify-center gap-4 p-8">
                  <Zap className="h-12 w-12 text-secondary opacity-50" />
                  <div className="h-4 w-24 bg-secondary/20 rounded-full" />
                  <div className="h-4 w-32 bg-secondary/20 rounded-full" />
               </div>
             </div>
          </div>
        </motion.div>
      </main>

      {/* The 48-Hour Integrity Section */}
      <section id="features" className="py-24 md:py-32 px-6 bg-secondary/5 border-y border-monk-rose/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="monk-card p-6 sm:p-10 bg-card shadow-xl space-y-6">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-monk-mint/10 border-2 border-monk-mint/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-monk-mint rounded-xl flex items-center justify-center text-white shadow-md shadow-monk-mint/30">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg">Morning Chanting</span>
                </div>
                <span className="text-[10px] font-bold text-monk-mint uppercase tracking-widest hidden sm:block">Verified</span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/10 border-2 border-secondary/20 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-secondary/30 rounded-xl flex items-center justify-center text-muted-foreground">
                    <Lock className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg text-muted-foreground">Deep Work: Coding</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Locked</span>
              </div>
              <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest pt-4">
                Yesterday was locked 4 hours ago.
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
              Typical habit apps allow you to "fake" your history. Not here. 
              <br/><br/>
              In <strong className="text-foreground">monk os</strong>, habit checkboxes permanently lock after 48 hours. No back-filling. No lying to yourself. If you missed a day, you own it. This is how real discipline is engineered.
            </p>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex flex-col">
                <span className="text-4xl font-heading font-extrabold text-monk-mint">100%</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Honest Tracking</span>
              </div>
              <div className="w-px h-12 bg-monk-rose/30" />
              <div className="flex flex-col">
                <span className="text-4xl font-heading font-extrabold text-primary">0</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Fake Streaks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Identity Domains */}
      <section id="system" className="py-24 md:py-32 bg-background px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24 space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight">Identity-Driven Domains.</h2>
            <p className="text-lg md:text-xl text-muted-foreground font-soft max-w-2xl mx-auto">
              We don't just track tasks. We track the evolution of your identity across four core domains.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
              color="text-monk-mint" 
              bg="bg-monk-mint/10" 
              borderColor="hover:border-monk-mint/30"
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

      {/* CTA Section */}
      <section className="py-32 md:py-40 px-6 text-center bg-foreground text-background">
        <div className="max-w-4xl mx-auto space-y-12">
          <Flame className="h-20 w-20 text-primary mx-auto animate-pulse" />
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-heading font-extrabold tracking-tighter">
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
      <footer className="bg-card py-16 px-6 border-t border-monk-rose/20">
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
        <div className="max-w-7xl mx-auto pt-8 border-t border-monk-rose/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
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

function DomainCard({ icon: Icon, title, desc, color, bg, borderColor }: any) {
  return (
    <div className={cn("monk-card p-8 md:p-10 border-2 border-transparent transition-all duration-300 h-full", borderColor)}>
      <div className={`h-16 w-16 rounded-[24px] flex items-center justify-center mb-8 ${bg}`}>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
      <h3 className="text-2xl font-heading font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground font-soft leading-relaxed text-lg">{desc}</p>
    </div>
  );
}
