"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Flame, 
  ChevronRight,
  Monitor,
  Lock,
  LogOut,
  Trash2,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [activeSection, setActiveActiveSection] = useState("profile");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("monk_os_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("monk_os_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const sections = [
    { id: "profile", label: "Identity Profile", icon: User },
    { id: "habits", label: "Non-Negotiables", icon: CheckCircle2 },
    { id: "system", label: "System & Theme", icon: Monitor },
    { id: "security", label: "Security & Data", icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your environment for maximum self-mastery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation - Responsive (Scrollable on mobile, Fixed on desktop) */}
        <div className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap lg:w-full",
                  activeSection === section.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-card text-muted-foreground hover:bg-secondary/50"
                )}
              >
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="monk-card p-6 md:p-10 space-y-12">
            
            {activeSection === "profile" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <section className="space-y-6">
                  <h2 className="text-xl font-heading font-bold">Identity Setup</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue="Monk User"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-monk-rose/20 focus:outline-none focus:border-primary/50 transition-all font-soft"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Identity Type</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-background border border-monk-rose/20 focus:outline-none focus:border-primary/50 transition-all font-soft">
                        <option>Builder</option>
                        <option>Student</option>
                        <option>Monk Mode</option>
                        <option>Athlete</option>
                        <option>Creator</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-heading font-bold">Daily Structure</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <TimeInput label="Wake Time" value="05:00 AM" />
                    <TimeInput label="Sleep Time" value="10:00 PM" />
                    <TimeInput label="Deep Work Goal" value="4 Hours" />
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-5 w-5 text-primary" />
                        <h3 className="font-heading font-bold text-lg">monk os Mastery</h3>
                      </div>
                      <p className="text-sm text-muted-foreground font-soft">
                        You are currently on the Initiate tier. Upgrade to unlock infinite tracking, AI analysis, and calendar auto-sync.
                      </p>
                    </div>
                    <a href="/pricing" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 whitespace-nowrap text-center">
                      Upgrade Status
                    </a>
                  </div>
                </section>
              </motion.div>
            )}

            {activeSection === "habits" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-bold">Your Non-Negotiables</h2>
                  <button className="text-sm font-bold text-primary">+ Add Habit</button>
                </div>
                <div className="space-y-3">
                  {["Morning Chanting", "45m Workout", "Deep Work: Coding", "Study: DBMS"].map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-monk-rose/10 group">
                      <span className="font-bold text-sm">{h}</span>
                      <button className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  Note: Changes to non-negotiables take effect starting at the next daily reset (3:00 AM).
                </p>
              </motion.div>
            )}

            {activeSection === "system" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <section className="space-y-6">
                  <h2 className="text-xl font-heading font-bold">Theme Preference</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleThemeChange("light")}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all text-left",
                        theme === "light" 
                          ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                          : "border-transparent bg-secondary/10 text-muted-foreground hover:border-secondary/30"
                      )}
                    >
                      <Sun className="h-6 w-6" />
                      <div>
                        <div className="font-bold">Monk Morning</div>
                        <div className="text-[10px] uppercase font-bold opacity-70">Light Mode</div>
                      </div>
                      {theme === "light" && <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    </button>
                    <button 
                      onClick={() => handleThemeChange("dark")}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all text-left",
                        theme === "dark" 
                          ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                          : "border-transparent bg-secondary/10 text-muted-foreground hover:border-secondary/30"
                      )}
                    >
                      <Moon className="h-6 w-6" />
                      <div>
                        <div className="font-bold">Deep Night</div>
                        <div className="text-[10px] uppercase font-bold opacity-70">Dark Mode</div>
                      </div>
                      {theme === "dark" && <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    </button>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-heading font-bold">Notifications</h2>
                  <div className="space-y-4">
                    <ToggleSwitch label="Habit Reminders" description="Alerts for uncompleted non-negotiables." defaultChecked />
                    <ToggleSwitch label="Bill Punctuality" description="Due date reminders for registered bills." defaultChecked />
                    <ToggleSwitch label="Daily Reflection" description="Morning/Evening journal prompts." />
                  </div>
                </section>
              </motion.div>
            )}

            {activeSection === "security" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <section className="space-y-6">
                  <h2 className="text-xl font-heading font-bold text-red-500">Danger Zone</h2>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-6 bg-secondary/10 hover:bg-secondary/20 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <Download className="h-6 w-6 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-bold">Export Life Data</div>
                          <div className="text-xs text-muted-foreground">Download all your logs in JSON format.</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-6 bg-red-50 hover:bg-red-100 rounded-2xl transition-all group border border-red-100">
                      <div className="flex items-center gap-4">
                        <Trash2 className="h-6 w-6 text-red-500" />
                        <div className="text-left">
                          <div className="font-bold text-red-600">Delete Account</div>
                          <div className="text-xs text-red-400">Permanently wipe all data from monk os.</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-red-300" />
                    </button>
                  </div>
                </section>
                
                <button className="flex items-center justify-center gap-2 w-full py-4 bg-foreground text-background font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

function TimeInput({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</label>
      <div className="px-4 py-3 rounded-xl bg-background border border-monk-rose/20 font-bold text-sm cursor-pointer hover:border-primary/50 transition-all">
        {value}
      </div>
    </div>
  );
}

function ToggleSwitch({ label, description, defaultChecked }: { label: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between p-2">
      <div className="space-y-1">
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-12 h-6 rounded-full relative transition-all duration-300",
          checked ? "bg-monk-mint" : "bg-secondary"
        )}
      >
        <div className={cn(
          "h-4 w-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm",
          checked ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
