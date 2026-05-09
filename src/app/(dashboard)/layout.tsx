"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, Flame } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-monk-rose/10 bg-card px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight text-foreground uppercase">
              monk mode
            </span>
          </div>
          <div className="hidden lg:block">
            {/* Spacer for desktop since logo is in sidebar */}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-secondary/50 rounded-xl lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

