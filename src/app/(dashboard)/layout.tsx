"use client";

import { useState, useRef } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, Flame } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll({ container: containerRef });
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-background text-foreground relative selection:bg-primary/30">
      {/* Premium subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top Header with Glassmorphism and Smart Scroll */}
        <motion.header 
          variants={{
            visible: { y: 0 },
            hidden: { y: "-100%" },
          }}
          animate={hidden ? "hidden" : "visible"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex h-20 items-center justify-between glass-panel fixed lg:sticky top-0 left-0 right-0 lg:left-auto lg:right-auto z-30 px-6 md:px-10 border-b border-border transition-colors duration-500"
        >
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-xl font-heading font-black tracking-tighter text-foreground uppercase">
              monk mode
            </span>
          </div>
          <div className="hidden lg:flex items-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-monk-mint animate-pulse" /> Systems Nominal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-1 bg-secondary/50 dark:bg-secondary/10 rounded-2xl border border-border transition-colors duration-500">
              <ThemeToggle />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 hover:bg-secondary/20 rounded-xl lg:hidden transition-all text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </motion.header>

        <main 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 py-24 md:px-10 md:py-12 custom-scrollbar scroll-smooth"
        >
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

