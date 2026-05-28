"use client";

import React, { useState, useEffect } from "react";
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
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";


export default function LandingPage() {
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
      
      {/* Navbar */}
      <motion.nav 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 w-full z-50 bg-white/90 dark:bg-[#0B0D10]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-[#1F242B] transition-colors duration-300"
      >
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 relative bg-white dark:bg-white/10 rounded-2xl overflow-hidden shadow-lg p-1.5 flex items-center justify-center border border-black/5 dark:border-white/10">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-heading font-extrabold tracking-tight text-zinc-900 dark:text-white">monk mode</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#manifesto">Manifesto</NavLink>
            <NavLink href="#system">The System</NavLink>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Login
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full hover:scale-105 transition-all shadow-xl hover:shadow-primary/20"
            >
              Start Monk Mode
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="flex-1 w-full pt-24 md:pt-40 pb-16 md:pb-20 px-4 md:px-8 relative bg-white dark:bg-[#0B0D10]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] md:h-[600px] bg-gradient-to-b from-primary/20 dark:from-primary/10 to-transparent -z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-zinc-50 dark:bg-[#111418] border border-zinc-200 dark:border-[#1F242B] shadow-sm text-[9px] md:text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mx-auto"
          >
            <ShieldCheck className="h-3 md:h-3.5 w-3 md:w-3.5 text-emerald-500" /> Built for Deep Work & Self-Mastery
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight leading-[1.1] flex flex-col items-center text-zinc-900 dark:text-white"
          >
            <span className="block">Stop Chasing</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#E8C547] dark:via-accent to-emerald-500 dark:to-success italic drop-shadow-sm py-1 md:py-2">
              Motivation.
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold tracking-tighter mt-4 md:mt-6 opacity-90 text-zinc-700 dark:text-zinc-300">
              Build Systems That Create Discipline.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 font-soft max-w-2xl mx-auto leading-relaxed px-2 md:px-0"
          >
            Motivation gets you started. Environment keeps you going. Replace scattered habits with a single, uncompromising digital battlefield.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 md:pt-8"
          >
            <Link 
              href="/login" 
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-[16px] md:rounded-[20px] text-base md:text-lg hover:scale-105 transition-all shadow-2xl shadow-zinc-900/10 dark:shadow-primary/20"
            >
              Enter Monk Mode <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[10px] md:text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
              Join the disciplined few
            </p>
          </motion.div>
        </div>
      </main>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-20 md:py-40 px-6 bg-zinc-50 dark:bg-[#0F1115] text-zinc-900 dark:text-zinc-100 border-y border-zinc-200 dark:border-[#1F242B] transition-colors duration-500 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 dark:from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 relative z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tighter uppercase leading-tight text-zinc-900 dark:text-white">
            You vs. You. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary italic drop-shadow-sm">
              The Ultimate Battleground.
            </span>
          </h2>
          <p className="text-base md:text-xl font-soft text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            This isn&apos;t for everyone. Typical apps let you lie to yourself by back-filling history. Not here. In monk mode, the only opponent is the version of you that wants to quit.
          </p>
          <div className="inline-block border border-primary/30 dark:border-primary/20 rounded-2xl p-6 md:p-8 bg-white dark:bg-white/5 backdrop-blur-sm shadow-xl shadow-zinc-200/50 dark:shadow-none">
            <p className="text-base md:text-xl font-heading font-bold text-primary uppercase tracking-widest text-center">
              &quot;Discipline is choosing between what you want now, and what you want most.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* The 48-Hour Integrity Section */}
      <section className="py-20 md:py-40 px-6 bg-white dark:bg-[#0B0D10] transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-32 items-center">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] -z-10" />
            <div className="bg-white dark:bg-[#111418] p-5 sm:p-12 rounded-[24px] md:rounded-[32px] border border-zinc-200 dark:border-[#1F242B] shadow-2xl shadow-zinc-200/50 dark:shadow-black/40 space-y-6 md:space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
              >
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="h-10 md:h-14 w-10 md:w-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="h-5 md:h-7 w-5 md:w-7" />
                  </div>
                  <span className="font-bold text-base md:text-xl text-zinc-900 dark:text-white">Morning Chanting</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Verified</span>
                  <span className="text-[9px] md:text-[10px] font-bold text-emerald-500/60 dark:text-emerald-500/40 uppercase">05:30 AM</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-zinc-50 dark:bg-[#1A1E24] border border-zinc-200 dark:border-[#1F242B] opacity-70 grayscale-[0.2]"
              >
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="h-10 md:h-14 w-10 md:w-14 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-500">
                    <Lock className="h-5 md:h-7 w-5 md:w-7" />
                  </div>
                  <span className="font-bold text-base md:text-xl text-zinc-600 dark:text-zinc-400">Deep Work: Coding</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] md:text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Locked</span>
                  <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase">Missed</span>
                </div>
              </motion.div>

              <div className="flex items-center justify-center gap-3 pt-4 md:pt-6 border-t border-zinc-100 dark:border-[#1F242B]">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-center text-[10px] md:text-xs font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em]">
                  Integrity window closed 4h ago
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8 order-1 lg:order-2 text-center lg:text-left">
            <div className="h-12 md:h-16 w-12 md:w-16 bg-primary/10 dark:bg-accent/10 flex items-center justify-center rounded-[16px] md:rounded-[20px] text-primary dark:text-accent mx-auto lg:mx-0">
              <Lock className="h-6 md:h-8 w-6 md:w-8" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-heading font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white">
              The 48-Hour <br/>Integrity Rule.
            </h2>
            <p className="text-base md:text-xl text-zinc-600 dark:text-zinc-400 font-soft leading-relaxed max-w-xl mx-auto lg:mx-0">
              If you miss a day, you own it. 
              <br className="hidden md:block"/><br className="hidden md:block"/>
              In <strong className="text-zinc-900 dark:text-white">monk mode</strong>, logs permanently lock after 48 hours. No back-filling. No lying to yourself. Real discipline requires real consequences.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-8 md:gap-12 pt-4">
              <div className="flex flex-col">
                <span className="text-3xl md:text-5xl font-heading font-extrabold text-emerald-600 dark:text-emerald-500">100%</span>
                <span className="text-[10px] md:text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Honest Tracking</span>
              </div>
              <div className="w-px h-12 md:h-16 bg-zinc-200 dark:bg-[#1F242B]" />
              <div className="flex flex-col">
                <span className="text-3xl md:text-5xl font-heading font-extrabold text-primary">0</span>
                <span className="text-[10px] md:text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Fake Streaks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Identity Domains */}
      <section id="system" className="py-20 md:py-40 bg-zinc-50 dark:bg-[#0F1115] px-4 md:px-8 border-y border-zinc-200 dark:border-[#1F242B] transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24 space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-heading font-extrabold tracking-tight text-zinc-900 dark:text-white">Identity-Driven Domains.</h2>
            <p className="text-base md:text-xl text-zinc-600 dark:text-zinc-400 font-soft max-w-2xl mx-auto">
              Life is holistic. We don&apos;t just track tasks; we track the evolution of your identity across four core pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <DomainCard 
              icon={Brain} 
              title="Academic" 
              desc="Deep focus on lectures, records, and exam revision." 
              color="text-indigo-600 dark:text-indigo-400" 
              bg="bg-indigo-50 dark:bg-indigo-500/10" 
              borderColor="border-zinc-200 dark:border-indigo-500/20"
            />
            <DomainCard 
              icon={Dumbbell} 
              title="Physical" 
              desc="Mastery over your vessel through workout discipline." 
              color="text-emerald-600 dark:text-emerald-400" 
              bg="bg-emerald-50 dark:bg-emerald-500/10" 
              borderColor="border-zinc-200 dark:border-emerald-500/20"
            />
            <DomainCard 
              icon={Heart} 
              title="Emotional" 
              desc="Daily gratitude and reflection in the Digital Ashram." 
              color="text-rose-600 dark:text-rose-400" 
              bg="bg-rose-50 dark:bg-rose-500/10" 
              borderColor="border-zinc-200 dark:border-rose-500/20"
            />
            <DomainCard 
              icon={TrendingUp} 
              title="Financial" 
              desc="Money discipline through conscious spending logs." 
              color="text-amber-600 dark:text-amber-400" 
              bg="bg-amber-50 dark:bg-accent/10" 
              borderColor="border-zinc-200 dark:border-amber-500/20"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-48 px-6 text-center bg-white dark:bg-[#0B0D10] text-zinc-900 dark:text-zinc-100 border-t border-zinc-200 dark:border-[#1F242B] transition-colors duration-500">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <div className="h-24 md:h-32 w-24 md:w-32 relative mx-auto bg-white dark:bg-white/10 rounded-3xl overflow-hidden shadow-2xl animate-pulse p-4 border border-black/5 dark:border-white/10 flex items-center justify-center">
            <div className="relative h-full w-full">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl md:text-6xl lg:text-8xl font-heading font-extrabold tracking-tighter uppercase leading-tight text-zinc-900 dark:text-white">
            Your Best Life is <br/>A Click Away.
          </h2>
          <p className="text-base md:text-2xl text-zinc-600 dark:text-zinc-400 font-soft max-w-2xl mx-auto leading-relaxed">
            Stop living by accident. Start engineering your evolution with monk mode today.
          </p>
          <div className="pt-8 md:pt-12">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-3 md:gap-4 px-10 md:px-14 py-5 md:py-7 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-[24px] md:rounded-[32px] text-lg md:text-2xl hover:scale-105 transition-transform shadow-2xl shadow-zinc-900/20 dark:shadow-primary/30 w-full sm:w-auto"
            >
              Enter the Battleground
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-[#0F1115] py-16 md:py-20 px-6 border-t border-zinc-200 dark:border-[#1F242B]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-12 md:mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6 md:space-y-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-12 w-12 relative bg-white dark:bg-white/10 rounded-xl overflow-hidden p-1.5 border border-black/5 dark:border-white/10">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-heading font-bold tracking-tight text-zinc-900 dark:text-white">monk mode</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 font-soft max-w-sm mx-auto md:mx-0 leading-relaxed text-base md:text-lg">
              Engineering the environment where self-mastery becomes automatic. Built for the disciplined few.
            </p>
          </div>
          <div className="space-y-6 md:space-y-8 text-center md:text-left">
            <h4 className="font-bold uppercase tracking-widest text-xs text-zinc-400 dark:text-zinc-500">System</h4>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/habits" className="hover:text-primary transition-colors">Habit Tracker</Link></li>
              <li><Link href="/focus" className="hover:text-primary transition-colors">Deep Work</Link></li>
            </ul>
          </div>
          <div className="space-y-6 md:space-y-8 text-center md:text-left">
            <h4 className="font-bold uppercase tracking-widest text-xs text-zinc-400 dark:text-zinc-500">Connect</h4>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 md:pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center md:text-left">
          <span>© 2026 monk mode. All rights reserved.</span>
          <span>Peace is the Ultimate Productivity.</span>
        </div>
      </footer>

    </div>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]">
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
    <div className={cn("p-8 md:p-10 rounded-[32px] border transition-all duration-500 h-full flex flex-col items-center text-center bg-white dark:bg-[#111418] shadow-xl shadow-zinc-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-2", borderColor)}>
      <div className={`h-16 w-16 rounded-[24px] flex items-center justify-center mb-8 shrink-0 ${bg}`}>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
      <h3 className="text-2xl font-heading font-bold mb-4 text-zinc-900 dark:text-white">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 font-soft leading-relaxed text-base">{desc}</p>
    </div>
  );
}
