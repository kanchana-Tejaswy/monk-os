"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Moon, 
  Sun, 
  CheckCircle2, 
  ChevronRight,
  Monitor,
  Trash2,
  Download,
  Sparkles,
  Clock,
  Compass,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("identity");
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

  const handleExportLifeData = () => {
    const keys = [
      "monk_os_habits", "monk_os_logs", "monk_os_focus", "monk_os_finance", 
      "monk_os_iron_will", "monkos_ikigai_data", "monk_os_goals", "monk_os_journal",
      "monk_os_bills", "monk_os_debts", "monk_os_reflections"
    ];
    const exportData: Record<string, unknown> = {};
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) exportData[key] = JSON.parse(data);
    });

    if (Object.keys(exportData).length === 0) return alert("No data found to export.");

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monk-mode-life-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportIkigai = () => {
    const data = localStorage.getItem("monkos_ikigai_data");
    if (!data) return alert("No Ikigai data found.");
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ikigai-wisdom.json";
    a.click();
  };

  const handleResetIkigai = () => {
    if (confirm("Reset your Ikigai? This will clear your life's compass data.")) {
      localStorage.removeItem("monkos_ikigai_data");
      alert("Ikigai cleared. Start fresh.");
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("CRITICAL WARNING: This will permanently delete ALL your discipline logs, financial history, and identity data. This action is irreversible. Are you absolutely sure?")) {
      const keys = [
        "monk_os_habits", "monk_os_logs", "monk_os_focus", "monk_os_finance", 
        "monk_os_iron_will", "monkos_ikigai_data", "monk_os_goals", "monk_os_journal",
        "monk_os_bills", "monk_os_debts", "monk_os_reflections", "monk_os_streak_restart",
        "monk_mode_tutorial_seen"
      ];
      keys.forEach(key => localStorage.removeItem(key));
      alert("Identity purged. The slate is clean.");
      window.location.href = "/login";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-24 md:pb-24 px-4 sm:px-0">    
      {/* Header */}
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-foreground italic uppercase">System Settings.</h1>
        <p className="text-text-secondary font-soft mt-1 opacity-80 text-sm md:text-lg">Configure your environment for maximum self-mastery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

        {/* Navigation */}
        <div className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 custom-scrollbar sticky top-24 -mx-4 px-4 lg:mx-0 lg:px-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 md:py-5 rounded-2xl md:rounded-[24px] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all whitespace-nowrap lg:w-full active:scale-95 shadow-sm border-2",
                  activeSection === section.id
                    ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105 lg:scale-100"
                    : "bg-card text-text-secondary hover:bg-secondary/50 dark:hover:bg-white/[0.03] border-border/50 hover:border-primary/30"
                )}
              >
                <section.icon className="h-5 w-5 md:h-4 md:w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="monk-card p-6 md:p-12 min-h-[500px] md:min-h-[600px] shadow-sm border-border">
            <AnimatePresence mode="wait">
              {activeSection === "identity" && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12 md:space-y-16"
                >
                  <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4 border-b border-border pb-4 md:pb-6">
                      <div className="h-12 w-12 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <User className="h-6 w-6 md:h-5 md:w-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight uppercase">Identity Setup</h2> 
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <input
                          type="text"
                          defaultValue="Monk User"
                          className="w-full px-6 py-5 rounded-[24px] bg-background border-2 border-border focus:outline-none focus:border-primary/50 transition-all font-heading font-bold text-lg shadow-inner"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Identity Type</label>
                        <select className="w-full px-6 py-5 rounded-[24px] bg-background border-2 border-border focus:outline-none focus:border-primary/50 transition-all font-heading font-bold text-lg appearance-none cursor-pointer shadow-inner">    
                          <option>Builder</option>
                          <option>Student</option>
                          <option>Monk Mode</option>
                          <option>Athlete</option>
                          <option>Creator</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4 border-b border-border pb-4 md:pb-6">
                      <div className="h-12 w-12 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Clock className="h-6 w-6 md:h-5 md:w-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight uppercase">Daily Structure</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                      <SettingsInput label="Wake Time" value="05:00 AM" />
                      <SettingsInput label="Sleep Time" value="10:00 PM" />
                      <SettingsInput label="Deep Work Goal" value="4 Hours" />
                    </div>
                  </section>
                </motion.div>
              )}

              {activeSection === "habits" && (
                <motion.div
                  key="habits"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 md:space-y-12"
                >
                  <div className="flex items-center gap-4 border-b border-border pb-4 md:pb-6">
                    <div className="h-12 w-12 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-monk-mint/10 flex items-center justify-center text-monk-mint shadow-inner">
                      <CheckCircle2 className="h-6 w-6 md:h-5 md:w-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight uppercase">Habit Governance</h2> 
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60">Non-Negotiable Protocols</h3>
                    <div className="flex flex-col items-center justify-center p-12 md:p-16 bg-secondary/10 dark:bg-white/[0.01] rounded-[40px] border-2 border-dashed border-border text-center space-y-6 group hover:border-monk-mint/30 transition-all">
                      <div className="p-6 bg-monk-mint/10 rounded-3xl text-monk-mint group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <CheckCircle2 className="h-10 w-10 stroke-[2.5px]" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-heading font-black text-xl md:text-2xl uppercase italic">No Protocols Defined</h4>
                        <p className="text-sm text-text-secondary max-w-sm mx-auto font-soft leading-relaxed opacity-80">Your identity is forged through repeated actions. Define your first non-negotiable protocol.</p>
                      </div>
                      <Link href="/habits" className="px-10 py-5 bg-monk-mint text-zinc-900 font-black text-[11px] uppercase tracking-[0.3em] rounded-[24px] hover:scale-105 transition-all shadow-2xl shadow-monk-mint/20 active:scale-95 border border-white/20">     
                        Initialize First Protocol
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "system" && (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12 md:space-y-16"
                >
                  <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4 border-b border-border pb-4 md:pb-6">
                      <div className="h-12 w-12 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Monitor className="h-6 w-6 md:h-5 md:w-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight uppercase">System Interface</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <button
                        onClick={() => handleThemeChange("light")}
                        className={cn(
                          "flex items-center gap-6 p-8 rounded-[32px] border-2 transition-all text-left group active:scale-[0.98]", 
                          theme === "light"
                            ? "border-primary bg-primary/[0.03] text-primary shadow-2xl shadow-primary/10"        
                            : "border-border bg-card text-text-secondary hover:border-primary/30"    
                        )}
                      >
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0",
                          theme === "light" ? "bg-primary text-white" : "bg-secondary/50 dark:bg-white/[0.03] text-text-secondary"
                        )}>
                          <Sun className="h-8 w-8 stroke-[2px]" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-heading font-black text-xl uppercase tracking-tighter">Monk Morning</div>       
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Light System</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleThemeChange("dark")}
                        className={cn(
                          "flex items-center gap-6 p-8 rounded-[32px] border-2 transition-all text-left group active:scale-[0.98]", 
                          theme === "dark"
                            ? "border-primary bg-primary/[0.03] text-primary shadow-2xl shadow-primary/10"        
                            : "border-border bg-card text-text-secondary hover:border-primary/30"    
                        )}
                      >
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0",
                          theme === "dark" ? "bg-primary text-white" : "bg-secondary/50 dark:bg-white/[0.03] text-text-secondary"
                        )}>
                          <Moon className="h-8 w-8 stroke-[2px]" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-heading font-black text-xl uppercase tracking-tighter">Deep Night</div>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Dark System</div>
                        </div>
                      </button>
                    </div>
                  </section>

                  <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4 border-b border-border pb-4 md:pb-6">
                      <div className="h-12 w-12 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                        <Sparkles className="h-6 w-6 md:h-5 md:w-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight uppercase">Feedback Signals</h2>
                    </div>
                    <div className="space-y-4">
                      <ToggleSwitch label="Habit Reminders" description="Alerts for uncompleted non-negotiables." defaultChecked />
                      <ToggleSwitch label="Bill Punctuality" description="Due date reminders for registered bills." defaultChecked />
                      <ToggleSwitch label="Daily Reflection" description="Morning/Evening journal prompts." />  
                    </div>
                  </section>
                </motion.div>
              )}

              {activeSection === "ikigai" && (
                <motion.div
                  key="ikigai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 md:space-y-12"
                >
                  <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4 border-b border-border pb-4 md:pb-6">
                      <div className="h-12 w-12 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                        <Compass className="h-6 w-6 md:h-5 md:w-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight uppercase">Ikigai Governance</h2>
                    </div>
                    <p className="text-sm md:text-base text-text-secondary font-soft leading-relaxed max-w-2xl opacity-80">
                      Your Ikigai represents the intersection of your passion, mission, vocation, and profession. This data is the bedrock of your purposeful living.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-4">
                      <button
                        onClick={handleExportIkigai}
                        className="flex flex-col items-center gap-5 p-10 bg-card border-2 border-border rounded-[32px] hover:border-amber-500/30 transition-all group text-center shadow-sm"
                      >
                        <div className="h-16 w-16 rounded-2xl bg-secondary/50 dark:bg-white/[0.03] flex items-center justify-center text-text-secondary group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors shadow-inner">
                          <Download className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                          <div className="font-heading font-black text-xl uppercase tracking-tighter">Export Wisdom</div>      
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Download Ikigai protocols.</div>
                        </div>
                      </button>
                      <button
                        onClick={handleResetIkigai}
                        className="flex flex-col items-center gap-5 p-10 bg-rose-500/[0.02] border-2 border-rose-500/20 rounded-[32px] hover:bg-rose-500/[0.05] transition-all group text-center shadow-sm"
                      >
                        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner group-hover:scale-110 transition-transform">
                          <Trash2 className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                          <div className="font-heading font-black text-xl uppercase tracking-tighter text-rose-500">Reset Destiny</div>
                          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Clear all Ikigai datasets.</div>  
                        </div>
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeSection === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-rose-500/20 pb-4 md:pb-6">
                      <div className="h-12 w-12 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                        <ShieldAlert className="h-6 w-6 md:h-5 md:w-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight text-rose-500 uppercase">Danger Zone</h2>
                    </div>

                    <div className="space-y-6">
                      <button
                        onClick={handleExportLifeData}
                        className="w-full flex items-center justify-between p-8 bg-card border-2 border-border rounded-[32px] hover:border-primary/30 transition-all group shadow-sm active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-secondary/50 flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors shadow-inner">
                            <Download className="h-6 w-6" />
                          </div>
                          <div className="text-left space-y-1">
                            <div className="font-heading font-black text-lg uppercase tracking-tight">Export Life Evidence</div>
                            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Download complete history (JSON).</div>
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-text-secondary group-hover:translate-x-2 group-hover:text-primary transition-all" />
                      </button>

                      <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-between p-8 bg-rose-500/[0.03] border-2 border-rose-500/20 rounded-[32px] hover:bg-rose-500/[0.08] hover:border-rose-500/40 transition-all group shadow-sm active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                            <Trash2 className="h-6 w-6" />
                          </div>
                          <div className="text-left space-y-1">
                            <div className="font-heading font-black text-lg uppercase tracking-tight text-rose-500">Identity Purge</div>
                            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Permanently wipe all system data.</div>
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-rose-500 group-hover:translate-x-2 transition-all" />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
  }

  const sections = [
  { id: "identity", label: "Identity", icon: User },
  { id: "habits", label: "Habits", icon: CheckCircle2 },
  { id: "system", label: "System", icon: Monitor },
  { id: "ikigai", label: "Ikigai", icon: Compass },
  { id: "security", label: "Security", icon: ShieldAlert },
  ];

  function SettingsInput({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">{label}</label>  
      <div className="px-6 py-5 rounded-[24px] bg-background border-2 border-border font-heading font-bold text-lg cursor-pointer hover:border-primary/50 transition-all flex items-center justify-between shadow-inner">
        {value}
        <ChevronRight className="h-5 w-5 text-text-secondary/30" />
      </div>
    </div>
  );
  }

  function ToggleSwitch({ label, description, defaultChecked }: { label: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-[32px] bg-secondary/10 dark:bg-white/[0.02] border-2 border-border/50 hover:border-border transition-all">
      <div className="space-y-2">
        <div className="font-heading font-black text-lg uppercase tracking-tight text-text-primary">{label}</div>
        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{description}</div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-16 h-8 rounded-full relative transition-all duration-500 flex items-center shrink-0 border border-white/10",
          checked ? "bg-primary shadow-lg shadow-primary/30" : "bg-secondary dark:bg-white/10"
        )}
      >
        <motion.div
          animate={{ x: checked ? 34 : 4 }}
          className="h-6 w-6 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
  }
