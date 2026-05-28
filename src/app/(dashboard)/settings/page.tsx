"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Shield, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Flame, 
  ChevronRight,
  Monitor,
  LogOut,
  Trash2,
  Download,
  Sparkles,
  Lock,
  Clock,
  Compass
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
    const exportData: Record<string, any> = {};
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-black tracking-tight text-foreground italic">System Settings</h1>
        <p className="text-text-secondary font-soft mt-1">Configure your environment for maximum self-mastery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation */}
        <div className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar sticky top-24">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap lg:w-full",
                  activeSection === section.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-card text-text-secondary hover:bg-secondary/30 dark:hover:bg-white/[0.03] border border-border/50"
                )}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="monk-card p-6 md:p-10 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeSection === "identity" && (
                <motion.div 
                  key="identity"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-heading font-black italic tracking-tight">Identity Setup</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Full Name</label>
                        <input 
                          type="text" 
                          defaultValue="Monk User"
                          className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-primary/50 transition-all font-heading font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Identity Type</label>
                        <select className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-primary/50 transition-all font-heading font-bold appearance-none cursor-pointer">
                          <option>Builder</option>
                          <option>Student</option>
                          <option>Monk Mode</option>
                          <option>Athlete</option>
                          <option>Creator</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-heading font-black italic tracking-tight">Daily Structure</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-heading font-black italic tracking-tight">Habit Governance</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Non-Negotiable Protocols</h3>
                    <div className="grid gap-3">
                      {["Morning Chanting", "45m Workout", "Deep Work: Coding"].map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-card rounded-[24px] border border-border group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="font-bold text-sm">{h}</span>
                          </div>
                          <button className="p-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-4 border-2 border-dashed border-border rounded-[24px] text-text-secondary font-black text-[10px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all">
                      + Initialize New Protocol
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSection === "system" && (
                <motion.div 
                  key="system"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-heading font-black italic tracking-tight">System Interface</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <button 
                        onClick={() => handleThemeChange("light")}
                        className={cn(
                          "flex items-center gap-5 p-6 rounded-[28px] border-2 transition-all text-left group",
                          theme === "light" 
                            ? "border-primary bg-primary/[0.03] text-primary shadow-lg shadow-primary/5" 
                            : "border-border/50 bg-secondary/10 text-text-secondary hover:border-primary/20"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                          theme === "light" ? "bg-primary text-white" : "bg-card text-text-secondary"
                        )}>
                          <Sun className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-black text-sm uppercase tracking-tight">Monk Morning</div>
                          <div className="text-[10px] font-bold opacity-60">Light System</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => handleThemeChange("dark")}
                        className={cn(
                          "flex items-center gap-5 p-6 rounded-[28px] border-2 transition-all text-left group",
                          theme === "dark" 
                            ? "border-primary bg-primary/[0.03] text-primary shadow-lg shadow-primary/5" 
                            : "border-border/50 bg-secondary/10 text-text-secondary hover:border-primary/20"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                          theme === "dark" ? "bg-primary text-white" : "bg-card text-text-secondary"
                        )}>
                          <Moon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-black text-sm uppercase tracking-tight">Deep Night</div>
                          <div className="text-[10px] font-bold opacity-60">Dark System</div>
                        </div>
                      </button>
                    </div>
                  </section>

                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-heading font-black italic tracking-tight">Feedback Signals</h2>
                    </div>
                    <div className="space-y-6">
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
                  className="space-y-12"
                >
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Compass className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-heading font-black italic tracking-tight">Ikigai Governance</h2>
                    </div>
                    <p className="text-sm text-text-secondary font-soft leading-relaxed max-w-2xl">
                      Your Ikigai represents the intersection of your passion, mission, vocation, and profession. This data is the bedrock of your purposeful living.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <button 
                        onClick={handleExportIkigai}
                        className="flex items-center gap-5 p-6 bg-card border border-border rounded-[28px] hover:border-primary/30 transition-all group text-left"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                          <Download className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-black text-sm uppercase tracking-tight">Export Wisdom</div>
                          <div className="text-[10px] font-bold text-text-secondary">Download Ikigai protocols.</div>
                        </div>
                      </button>
                      <button 
                        onClick={handleResetIkigai}
                        className="flex items-center gap-5 p-6 bg-red-500/[0.03] border border-red-500/20 rounded-[28px] hover:bg-red-500/[0.06] transition-all group text-left"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                          <Trash2 className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-black text-sm uppercase tracking-tight text-red-500">Reset Destiny</div>
                          <div className="text-[10px] font-bold text-red-400">Clear all Ikigai datasets.</div>
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
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <Lock className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-heading font-black italic tracking-tight text-red-500 uppercase">Danger Zone</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={handleExportLifeData}
                        className="w-full flex items-center justify-between p-6 bg-card border border-border rounded-[28px] hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                            <Download className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <div className="font-black text-sm uppercase tracking-tight">Export Life Evidence</div>
                            <div className="text-[10px] font-bold text-text-secondary">Download complete history (JSON).</div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-all" />
                      </button>
                      
                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-between p-6 bg-red-500/[0.03] border border-red-500/20 rounded-[28px] hover:bg-red-500/[0.06] transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <Trash2 className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <div className="font-black text-sm uppercase tracking-tight text-red-500">Identity Purge</div>
                            <div className="text-[10px] font-bold text-red-400">Permanently wipe all system data.</div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-red-500 group-hover:translate-x-1 transition-all" />
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
  { id: "security", label: "Security", icon: Shield },
];

function SettingsInput({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{label}</label>
      <div className="px-5 py-4 rounded-2xl bg-background border border-border font-heading font-bold text-sm cursor-pointer hover:border-primary/50 transition-all flex items-center justify-between">
        {value}
        <ChevronRight className="h-4 w-4 text-text-secondary/30" />
      </div>
    </div>
  );
}

function ToggleSwitch({ label, description, defaultChecked }: { label: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 dark:bg-white/[0.02] border border-transparent hover:border-border transition-all">
      <div className="space-y-1">
        <div className="font-black text-sm uppercase tracking-tight">{label}</div>
        <div className="text-[10px] font-bold text-text-secondary">{description}</div>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-14 h-7 rounded-full relative transition-all duration-500 flex items-center",
          checked ? "bg-primary shadow-lg shadow-primary/20" : "bg-secondary"
        )}
      >
        <motion.div 
          animate={{ x: checked ? 28 : 4 }}
          className="h-5 w-5 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}
