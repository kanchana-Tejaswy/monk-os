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
  Sparkles
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
                    : "bg-card text-muted-foreground hover:bg-secondary/30 dark:bg-secondary/50"
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
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary/50 transition-all font-soft"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Identity Type</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary/50 transition-all font-soft">
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
                    <div key={i} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border group">
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

            {activeSection === "ikigai" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <section className="space-y-6">
                  <h2 className="text-xl font-heading font-bold">Ikigai Management</h2>
                  <p className="text-sm text-muted-foreground font-soft">
                    Your Ikigai is your life's compass. Manage your reflection data here.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={handleExportIkigai}
                      className="flex items-center justify-between p-6 bg-secondary/10 hover:bg-secondary/20 rounded-2xl transition-all group border border-secondary/20"
                    >
                      <div className="flex items-center gap-4">
                        <Download className="h-6 w-6 text-secondary" />
                        <div className="text-left">
                          <div className="font-bold">Export Wisdom</div>
                          <div className="text-xs text-muted-foreground">Download Ikigai JSON.</div>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={handleResetIkigai}
                      className="flex items-center justify-between p-6 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all group border border-red-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <Trash2 className="h-6 w-6 text-red-500" />
                        <div className="text-left">
                          <div className="font-bold text-red-500">Reset Destiny</div>
                          <div className="text-xs text-red-400">Clear all Ikigai data.</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </section>
              </motion.div>
            )}

            {activeSection === "security" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <section className="space-y-6">
                  <h2 className="text-xl font-heading font-bold text-red-500">Danger Zone</h2>
                  <div className="space-y-4">
                    <button 
                      onClick={handleExportLifeData}
                      className="w-full flex items-center justify-between p-6 bg-secondary/10 hover:bg-secondary/20 rounded-2xl transition-all group border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-center gap-4">
                        <Download className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="text-left">
                          <div className="font-bold">Export Life Data</div>
                          <div className="text-xs text-muted-foreground">Download all your logs in JSON format.</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                    </button>
                    
                    <button 
                      onClick={handleDeleteAccount}
                      className="w-full flex items-center justify-between p-6 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all group border border-red-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <Trash2 className="h-6 w-6 text-red-500" />
                        <div className="text-left">
                          <div className="font-bold text-red-500">Delete Account</div>
                          <div className="text-xs text-red-400">Permanently wipe all data from monk mode.</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-red-300" />
                    </button>
                  </div>
                </section>
                
                <button className="flex items-center justify-center gap-2 w-full py-4 bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
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
      <div className="px-4 py-3 rounded-xl bg-background border border-border font-bold text-sm cursor-pointer hover:border-primary/50 transition-all">
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
