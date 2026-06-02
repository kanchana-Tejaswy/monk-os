"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Brain,
  TrendingUp,
  Heart,
  Dumbbell,
  Flame
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0D10] font-sans text-zinc-900 dark:text-zinc-100 selection:bg-primary/30 overflow-x-hidden flex flex-col transition-colors duration-500">
      
      {/* Navbar - Ultra Tight for Mobile */}
      <motion.nav 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 w-full z-50 bg-white/70 dark:bg-[#0B0D10]/70 backdrop-blur-xl border-b border-zinc-200/40 dark:border-white/5 transition-colors duration-300"
      >
        <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 relative bg-white dark:bg-white/10 rounded-lg overflow-hidden shadow-sm p-1 flex items-center justify-center border border-black/5 dark:border-white/10 shrink-0">
              <Image 
                src="/monk-logo.jpeg" 
                alt="Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="text-lg md:text-xl font-heading font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">monk mode</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#manifesto">Manifesto</NavLink>
            <NavLink href="#system">The System</NavLink>
          </div>
          <div className="flex items-center gap-3">
            <Link href={user ? "/dashboard" : "/login"} className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              {user ? "Dashboard" : "Login"}
            </Link>
            <Link 
              href={user ? "/dashboard" : "/login"} 
              className="text-[10px] font-black bg-zinc-900 dark:bg-white text-white dark:text-black px-4 h-9 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-primary/20 uppercase tracking-widest min-w-[80px] flex items-center justify-center"
            >
              {user ? "Resume" : "Initiate"}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Full Viewport Ownership */}
      <main className="min-h-[100dvh] flex flex-col items-center justify-center w-full pt-20 md:pt-40 pb-20 md:pb-32 px-4 md:px-8 relative bg-white dark:bg-[#0B0D10]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] md:h-[600px] bg-gradient-to-b from-primary/10 dark:from-primary/5 to-transparent -z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center justify-center flex-1 space-y-8 md:space-y-16 relative z-10 w-full">
          <div className="space-y-6 md:space-y-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50/50 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 shadow-sm text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mx-auto backdrop-blur-sm"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Identity Evolution Active
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter leading-[0.9] flex flex-col items-center text-zinc-900 dark:text-white"
            >
              <span className="block">Stop Chasing</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#E8C547] dark:via-accent to-emerald-500 dark:to-success italic py-1 md:py-2">
                Motivation.
              </span>
            </motion.h1>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.1 }}
               className="space-y-5 md:space-y-10"
            >
              <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold tracking-tight opacity-90 text-zinc-700 dark:text-zinc-300 max-w-[260px] md:max-w-none mx-auto leading-tight">
                Build Systems <br className="sm:hidden" /> That Create Discipline.
              </h2>
              <p className="text-xs md:text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 font-soft max-w-[280px] md:max-w-xl mx-auto leading-relaxed">
                Replace scattered habits with a single, uncompromising digital battlefield.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-8 md:gap-12 w-full pt-8"
          >
            <Link 
              href={user ? "/dashboard" : "/login"} 
              className="group w-full max-w-[240px] sm:w-auto flex items-center justify-center gap-3 px-8 h-14 md:h-16 bg-zinc-900 dark:bg-white text-white dark:text-black font-black md:font-bold rounded-2xl md:rounded-[20px] text-sm md:text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-primary/20"
            >
              {user ? "Resume Monk Mode" : "Enter Monk Mode"} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 opacity-30 group-hover:opacity-100 transition-opacity">
               <FeatureBadge icon={CheckCircle2} label="Habits" />
               <FeatureBadge icon={Brain} label="Focus" />
               <FeatureBadge icon={Flame} label="Will" />
               <FeatureBadge icon={TrendingUp} label="Metrics" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Manifesto Section - Chapter 2 */}
      <section id="manifesto" className="min-h-[100dvh] flex flex-col justify-center py-32 md:py-48 px-6 bg-zinc-50 dark:bg-[#0F1115] text-zinc-900 dark:text-zinc-100 border-y border-zinc-200/40 dark:border-white/5 transition-colors duration-500 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 dark:from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-20 relative z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tighter uppercase leading-tight text-zinc-900 dark:text-white">
            You vs. You. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary italic drop-shadow-sm">
              The Battleground.
            </span>
          </h2>
          <p className="text-base md:text-xl font-soft text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[300px] md:max-w-xl mx-auto">
            The only opponent is the version of you that wants to quit.
          </p>
          <div className="inline-block border border-primary/20 dark:border-white/5 rounded-2xl p-8 md:p-14 bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm dark:shadow-none mx-2 md:mx-0">
            <p className="text-xs md:text-xl font-heading font-bold text-primary uppercase tracking-[0.25em] text-center max-w-[260px] md:max-w-none leading-relaxed">
              &quot;Discipline is choosing between what you want now, and what you want most.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* The 48-Hour Integrity Section - Chapter 3 */}
      <section className="py-24 md:py-48 px-4 md:px-6 bg-white dark:bg-[#0B0D10] transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 lg:gap-32 items-center">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-[3rem] -z-10" />
            <div className="bg-white/50 dark:bg-[#111418] p-5 sm:p-12 rounded-[24px] md:rounded-[32px] border border-zinc-200/60 dark:border-white/5 shadow-2xl shadow-zinc-200/20 dark:shadow-black/40 space-y-4 md:space-y-8 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm"
              >
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="h-8 md:h-14 w-8 md:w-14 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-900 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-4 md:h-7 w-4 md:w-7" />
                  </div>
                  <span className="font-bold text-xs md:text-xl text-zinc-900 dark:text-white">Morning Ritual</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Verified</span>
                  <span className="text-[7px] md:text-[10px] font-bold text-emerald-500/40 uppercase">05:30 AM</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 opacity-50 grayscale"
              >
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="h-8 md:h-14 w-8 md:w-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-500">
                    <Lock className="h-4 md:h-7 w-4 md:w-7" />
                  </div>
                  <span className="font-bold text-xs md:text-xl text-zinc-600 dark:text-zinc-400">Deep Work Session</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] md:text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Locked</span>
                  <span className="text-[7px] md:text-[10px] font-bold text-zinc-400 uppercase">Missed</span>
                </div>
              </motion.div>

              <div className="flex items-center justify-center gap-2 pt-4 border-t border-zinc-100 dark:border-white/5">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <p className="text-center text-[8px] md:text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">
                  Integrity window closed
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-8 order-1 lg:order-2 text-center lg:text-left px-2">
            <div className="h-10 w-10 md:h-16 md:w-16 bg-primary/10 dark:bg-accent/10 flex items-center justify-center rounded-xl text-primary dark:text-accent mx-auto lg:mx-0 shadow-sm border border-primary/10">
              <Lock className="h-5 md:h-8 w-5 md:w-8" />
            </div>
            <h2 className="text-2xl md:text-5xl lg:text-7xl font-heading font-extrabold tracking-tight leading-[1] text-zinc-900 dark:text-white">
              The 48-Hour <br/>Integrity Rule.
            </h2>
            <p className="text-xs md:text-xl text-zinc-500 dark:text-zinc-400 font-soft leading-relaxed max-w-[260px] md:max-w-xl mx-auto lg:mx-0">
              No back-filling. No lying. Logs lock after 48 hours. Real discipline has real consequences.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-2">
              <div className="flex flex-col">
                <span className="text-2xl md:text-5xl font-heading font-extrabold text-emerald-600">100%</span>
                <span className="text-[8px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Truthful</span>
              </div>
              <div className="w-px h-8 md:h-16 bg-zinc-200 dark:bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl md:text-5xl font-heading font-extrabold text-primary">0</span>
                <span className="text-[8px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Fake Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Identity Domains - Chapter 4 */}
      <section id="system" className="py-24 md:py-48 bg-zinc-50 dark:bg-[#0F1115] px-4 md:px-8 border-y border-zinc-200/40 dark:border-white/5 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24 space-y-4 md:space-y-8">
            <h2 className="text-2xl md:text-5xl lg:text-7xl font-heading font-extrabold tracking-tight text-zinc-900 dark:text-white">Evolution Pillars.</h2>
            <p className="text-sm md:text-xl text-zinc-500 dark:text-zinc-400 font-soft max-w-[240px] md:max-w-xl mx-auto leading-relaxed">
              We track the evolution of your identity across four core domains.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <DomainCard 
              icon={Brain} 
              title="Academic" 
              desc="Deep focus on lectures, records, and revision." 
              color="text-indigo-600 dark:text-indigo-400" 
              bg="bg-indigo-50 dark:bg-indigo-500/10" 
              borderColor="border-zinc-200/40 dark:border-white/5"
            />
            <DomainCard 
              icon={Dumbbell} 
              title="Physical" 
              desc="Mastery over your vessel through discipline." 
              color="text-emerald-600 dark:text-emerald-400" 
              bg="bg-emerald-50 dark:bg-emerald-500/10" 
              borderColor="border-zinc-200/40 dark:border-white/5"
            />
            <DomainCard 
              icon={Heart} 
              title="Emotional" 
              desc="Daily gratitude in the Digital Ashram." 
              color="text-rose-600 dark:text-rose-400" 
              bg="bg-rose-50 dark:bg-rose-500/10" 
              borderColor="border-zinc-200/40 dark:border-white/5"
            />
            <DomainCard 
              icon={TrendingUp} 
              title="Financial" 
              desc="Money discipline through conscious logs." 
              color="text-amber-600 dark:text-amber-400" 
              bg="bg-amber-50 dark:bg-accent/10" 
              borderColor="border-zinc-200/40 dark:border-white/5"
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Chapter 5 */}
      <section className="py-24 md:py-48 px-6 text-center bg-white dark:bg-[#0B0D10] text-zinc-900 dark:text-zinc-100 border-t border-zinc-200/40 dark:border-white/5 transition-colors duration-500">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-16">
          <div className="h-12 w-12 md:h-32 w-12 md:w-32 relative mx-auto bg-white dark:bg-white/10 rounded-xl md:rounded-3xl overflow-hidden shadow-lg p-1.5 md:p-4 border border-black/5 dark:border-white/10 flex items-center justify-center">
            <Image 
              src="/monk-logo.jpeg" 
              alt="Logo" 
              fill 
              className="object-contain opacity-80"
            />
          </div>
          <h2 className="text-2xl md:text-6xl lg:text-8xl font-heading font-extrabold tracking-tighter uppercase leading-tight text-zinc-900 dark:text-white px-4">
            Your Best Life is <br className="hidden sm:block" />A Click Away.
          </h2>
          <p className="text-base md:text-2xl text-zinc-500 dark:text-zinc-400 font-soft max-w-[280px] md:max-w-xl mx-auto leading-relaxed">
            Stop living by accident. Start engineering your evolution today.
          </p>
          <div className="pt-6 md:pt-16">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-3 px-8 h-14 md:h-20 bg-zinc-900 dark:bg-white text-white dark:text-black font-black md:font-bold rounded-2xl md:rounded-[32px] text-sm md:text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-zinc-900/20 dark:shadow-primary/30 w-full max-w-[240px] sm:w-auto"
            >
              Enter Battleground
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-[#0F1115] py-24 md:py-32 px-6 border-t border-zinc-200/40 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 w-full mb-20 md:mb-32">
            <div className="md:col-span-5 space-y-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="h-10 w-10 relative bg-white dark:bg-white/10 rounded-xl overflow-hidden p-1.5 border border-black/5 dark:border-white/10 shadow-sm">
                  <Image 
                    src="/monk-logo.jpeg" 
                    alt="Logo" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <span className="text-xl md:text-2xl font-heading font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">monk mode</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-soft max-w-sm mx-auto md:mx-0 leading-relaxed text-sm md:text-lg">
                Engineering the environment where self-mastery becomes automatic. Built for the disciplined few.
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-6 md:space-y-8">
                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500">System</h4>
                <ul className="space-y-4 text-xs md:text-base font-bold text-zinc-600 dark:text-zinc-300">
                  <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                  <li><Link href="/habits" className="hover:text-primary transition-colors">Habit Tracker</Link></li>
                  <li><Link href="/focus" className="hover:text-primary transition-colors">Deep Work</Link></li>
                </ul>
              </div>
              <div className="space-y-6 md:space-y-8">
                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500">Company</h4>
                <ul className="space-y-4 text-xs md:text-base font-bold text-zinc-600 dark:text-zinc-300">
                  <li><Link href="#manifesto" className="hover:text-primary transition-colors">Manifesto</Link></li>
                  <li><Link href="#system" className="hover:text-primary transition-colors">The System</Link></li>
                  <li><Link href="/login" className="hover:text-primary transition-colors">Privacy</Link></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1 space-y-6 md:space-y-8">
                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500">Connect</h4>
                <ul className="flex md:flex-col justify-center md:justify-start gap-8 md:gap-4 text-xs md:text-base font-bold text-zinc-600 dark:text-zinc-300">
                  <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">YouTube</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="w-full pt-10 md:pt-16 border-t border-zinc-200/40 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] md:text-xs font-black text-zinc-400 uppercase tracking-[0.25em] text-center">
            <span className="opacity-80">
              © 2026 monk mode. falcon 7 <span className="text-primary/60 lowercase font-serif italic mx-1">x</span> K. Tejaswy.
            </span>
            <div className="flex items-center gap-2 opacity-50 italic">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <span>Peace is the Ultimate Productivity.</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]">
      {children}
    </Link>
  );
}

function FeatureBadge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
      <Icon className="h-3 w-3" />
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
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
    <div className={cn("p-6 md:p-10 rounded-[24px] md:rounded-[32px] border transition-all duration-500 h-full flex flex-col items-center text-center bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1", borderColor)}>
      <div className={`h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shrink-0 ${bg}`}>
        <Icon className={`h-6 w-6 md:h-8 md:w-8 ${color}`} />
      </div>
      <h3 className="text-base md:text-2xl font-heading font-bold mb-2 md:mb-4 text-zinc-900 dark:text-white">{title}</h3>
      <p className="text-[10px] md:text-base text-zinc-500 dark:text-zinc-400 font-soft leading-relaxed">{desc}</p>
    </div>
  );
}
