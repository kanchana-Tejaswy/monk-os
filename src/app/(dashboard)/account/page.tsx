"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  RefreshCw, 
  Check, 
  Cloud, 
  Database, 
  Download, 
  Calendar,
  Lock,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  FileJson,
  FileSpreadsheet,
  Archive,
  History,
  Info,
  Zap,
  Target,
  BookText,
  Flame,
  Wallet,
  Compass,
  ListTodo,
  X,
  Upload,
  Camera,
  Mail,
  Fingerprint,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useSyncStore, SyncStatus } from "@/lib/sync/syncStore";
import { syncManager } from "@/lib/sync/syncManager";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

interface StatStats {
  habits: number;
  goals: number;
  journal: number;
  focus: number;
  finance: number;
  ikigai: number;
  tasks: number;
}

interface ExportData {
  exported_at: string;
  user_id?: string;
  version: string;
  [key: string]: unknown;
}

export default function AccountPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { status: syncStatus, lastSyncedAt, pendingMutations } = useSyncStore();
  
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [showId, setShowId] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats State
  const [stats, setStats] = useState<StatStats>({
    habits: 0,
    goals: 0,
    journal: 0,
    focus: 0,
    finance: 0,
    ikigai: 0,
    tasks: 0
  });

  // Edit Profile Form State
  const [editName, setEditName] = useState(profile?.full_name || "");
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setEditName(profile.full_name || "");
  }, [profile]);

  useEffect(() => {
    const loadStats = () => {
      const getCount = (key: string) => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return 0;
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed.length;
          if (typeof parsed === 'object' && parsed !== null) {
            if (key === 'monk_os_logs') return Object.keys(parsed).length;
            if (key === 'monkos_ikigai_evolution') return (parsed as { entries?: unknown[] }).entries?.length || 0;
            return 1;
          }
          return 0;
        } catch { return 0; }
      };

      setStats({
        habits: getCount("monk_os_habits"),
        goals: getCount("monk_os_goals"),
        journal: getCount("monk_os_journal"),
        focus: getCount("monk_os_focus"),
        finance: getCount("monk_os_finance"),
        ikigai: getCount("monkos_ikigai_evolution"),
        tasks: getCount("monk_os_todos")
      });
    };

    loadStats();
    window.addEventListener("sync_complete", loadStats);
    return () => window.removeEventListener("sync_complete", loadStats);
  }, []);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleForceSync = async () => {
    setRefreshing(true);
    try {
      await syncManager.sync();
      alert("System intelligence synchronized with cloud.");
    } catch (e) {
      console.error(e);
      alert("Synchronization sequence interrupted.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportJSON = () => {
    const keys = [
      "monk_os_habits", "monk_os_logs", "monk_os_focus", "monk_os_finance", 
      "monk_os_iron_will", "monkos_ikigai_evolution", "monk_os_goals", "monk_os_journal",
      "monk_os_bills", "monk_os_debts", "monk_os_settings", "monk_os_streak_data"
    ];
    const exportData: ExportData = {
      exported_at: new Date().toISOString(),
      user_id: user?.id,
      version: "2.0"
    };
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) exportData[key] = JSON.parse(data);
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monk-os-archive-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string);
        const data = rawData as Record<string, unknown>;
        if (confirm("Identified legacy archive. Restoring data will merge with current state. Proceed?")) {
           Object.keys(data).forEach(key => {
             if (key.startsWith('monk_os') || key.startsWith('monkos_')) {
               localStorage.setItem(key, JSON.stringify(data[key]));
             }
           });
           alert("Identity restoration successful. Reloading system...");
           window.location.reload();
        }
      } catch {
        alert("Failed to parse archive integrity.");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local cache
      const cachedString = localStorage.getItem('monk_os_profile');
      const cached = cachedString ? JSON.parse(cachedString) : {};
      localStorage.setItem('monk_os_profile', JSON.stringify({ ...cached, full_name: editName }));
      
      setEditModalOpen(false);
      alert("Identity configuration updated.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update identity.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetCache = () => {
    if (confirm("Are you sure you want to reset the local cache? This will clear all local data and re-pull from the cloud. Unsynced changes will be lost.")) {
      const keysToClear = [
        'monk_os_habits', 'monk_os_logs', 'monk_os_finance', 'monk_os_bills',
        'monk_os_debts', 'monk_os_focus', 'monk_os_todos', 'monk_os_journal',
        'monkos_ikigai_evolution', 'monk_os_iron_will', 'monk_os_goals',
        'monk_os_streak_data'
      ];
      keysToClear.forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-40 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="h-20 w-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Flame className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Accessing Identity Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 md:space-y-16 pb-24 md:pb-24 animate-in fade-in duration-700 px-4 md:px-8 text-foreground">

      {/* 1. PROFILE OVERVIEW - PREMIUM CARD */}
      <section className="relative overflow-hidden rounded-[40px] md:rounded-[48px] bg-card border-2 border-border p-6 md:p-16 shadow-2xl group transition-all duration-500 hover:border-primary/20">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
          <Shield className="h-48 w-48 md:h-64 md:w-64 text-primary" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 md:gap-12 lg:gap-16">  
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <div className="h-32 w-32 md:h-48 md:w-48 relative bg-white dark:bg-white/10 rounded-[40px] md:rounded-[56px] overflow-hidden p-2 border-[6px] md:border-8 border-white dark:border-zinc-900 shadow-2xl z-10">
              {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                <Image
                  src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover rounded-[32px] md:rounded-[40px]"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">     
                  <User className="h-16 w-16 md:h-20 md:w-20" />
                </div>
              )}
            </div>
            <button
              onClick={() => setEditModalOpen(true)}
              className="absolute bottom-1 right-1 md:bottom-2 md:right-2 h-10 w-10 md:h-12 md:w-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-20 border-[3px] md:border-4 border-white dark:border-zinc-900 group/btn"
            >
               <Camera className="h-4 w-4 md:h-5 md:w-5 group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] bg-primary/10 px-5 py-2 rounded-full border border-border inline-block">Authenticated Agent</span>
                <SyncStatusBadge status={syncStatus} />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tighter italic uppercase text-foreground leading-tight">
                {profile?.full_name || user?.user_metadata?.full_name || "Monk Mode"}
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-text-secondary">     
                 <Mail className="h-4 w-4 opacity-40" />
                 <p className="text-base md:text-xl font-soft opacity-70 truncate max-w-[250px] sm:max-w-none">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 md:gap-4 w-full">
               <button
                onClick={handleCopyId}
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-4 md:py-3 bg-secondary/50 dark:bg-white/[0.03] border border-border rounded-[20px] md:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all active:scale-95 group/sig"
               >
                 {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Fingerprint className="h-4 w-4 opacity-40 group-hover/sig:opacity-100 transition-opacity" />}
                 {showId ? user?.id : "Copy Signature ID"}
               </button>
               <div className="flex gap-3 w-full sm:w-auto">
                 <button
                  onClick={() => setShowId(!showId)}
                  className="flex-1 sm:flex-none flex items-center justify-center p-4 md:p-3 bg-secondary/50 dark:bg-white/[0.03] border border-border rounded-[20px] md:rounded-2xl text-text-secondary hover:text-foreground transition-all active:scale-95"
                 >
                   {showId ? <Zap className="h-5 w-5 md:h-4 md:w-4 text-primary fill-primary" /> : <Lock className="h-5 w-5 md:h-4 md:w-4" />}
                 </button>
                 <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex-[2] sm:flex-none px-6 py-4 md:py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[20px] md:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-zinc-900/10 active:scale-95 flex items-center justify-center"
                 >
                   Configure Identity
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:gap-8 pt-8 md:pt-6 border-t border-border/50 max-w-sm mx-auto lg:mx-0 w-full">    
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2"><Calendar className="h-3 w-3" /> System Start</p>
                  <p className="text-xs md:text-sm font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2"><History className="h-3 w-3" /> Last Pulse</p>
                  <p className="text-xs md:text-sm font-bold">{lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting Pulse'}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACCOUNT STATUS GRID - HIGH FIDELITY */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard 
          label="Authorization" 
          status="Secure Protocol" 
          icon={Shield} 
          color="text-emerald-500" 
          active
          desc="Google OAuth active."
        />
        <StatusCard 
          label="Synchronization" 
          status={syncStatus === 'synced' ? "Data Integrity Verified" : syncStatus === 'syncing' ? "Syncing Logic..." : "Pulse Mismatch"} 
          icon={Cloud} 
          color={syncStatus === 'synced' ? "text-emerald-500" : syncStatus === 'syncing' ? "text-amber-500" : "text-rose-500"} 
          active={syncStatus === 'synced'}
          desc="Cross-device persistence."
        />
        <StatusCard 
          label="Cloud Persistence" 
          status="Live Mirroring" 
          icon={Database} 
          color="text-primary" 
          active
          desc="Supabase DB connected."
        />
        <StatusCard 
          label="Local Resilience" 
          status="Offline Capable" 
          icon={Zap} 
          color="text-accent" 
          active
          desc="PWA & Cache active."
        />
      </section>

      {/* 5. SYNC CENTER & 3. ACCOUNT ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sync Center */}
        <section className="lg:col-span-2 monk-card p-8 md:p-10 space-y-10">
          <div className="flex items-center justify-between border-b border-border pb-6">
             <div className="space-y-1">
                <h3 className="text-2xl font-heading font-black italic uppercase tracking-tight">Sync Infrastructure</h3>
                <p className="text-sm text-text-secondary font-soft">Manage your identity mirror across the global network.</p>
             </div>
             <BarChart3 className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 rounded-[32px] bg-secondary/30 dark:bg-white/[0.02] border border-border space-y-5 group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <History className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Last Integrity Pulse</span>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="text-3xl font-heading font-black">{lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Never'}</div>
                <p className="text-[10px] text-text-secondary opacity-60 leading-relaxed uppercase tracking-tighter font-bold">Successfully verified your local datasets against cloud state.</p>
             </div>
             <div className="p-8 rounded-[32px] bg-secondary/30 dark:bg-white/[0.02] border border-border space-y-5 group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-primary">
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pending Mutations</span>
                  </div>
                  {pendingMutations > 0 && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(246,193,204,0.5)]" />}
                </div>
                <div className="text-3xl font-heading font-black">{pendingMutations} Updates</div>
                <p className="text-[10px] text-text-secondary opacity-60 leading-relaxed uppercase tracking-tighter font-bold">Local changes waiting for the next synchronization window.</p>
             </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleForceSync}
              disabled={isRefreshing}
              className="w-full py-6 rounded-[24px] bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
            >
              <RefreshCw className={cn("h-4 w-4 group-hover:rotate-180 transition-transform duration-700", isRefreshing && "animate-spin")} />
              Execute Global Synchronization
            </button>
            <p className="text-center text-[9px] text-text-secondary opacity-40 uppercase font-black tracking-widest">Push local modifications → Pull cloud delta → Rehydrate state.</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="monk-card p-8 md:p-10 space-y-8 bg-primary/[0.02] border-primary/10">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary opacity-60">System Protocols</h3>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Access fundamental identity controls.</p>
          </div>
          
          <div className="space-y-3">
             <ActionRow icon={User} label="Edit Profile Identity" onClick={() => setEditModalOpen(true)} />
             <ActionRow icon={RefreshCw} label="Revalidate Session" onClick={() => window.location.reload()} />
             <ActionRow icon={Download} label="Export JSON Evidence" onClick={handleExportJSON} />
             <ActionRow icon={FileSpreadsheet} label="Download CSV Archive" onClick={() => alert("CSV Generation Sequence... Pending Phase 5 Update.")} />
             <ActionRow icon={Upload} label="Restore From Backup" onClick={handleRestoreClick} />
             
             <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileRestore} 
              className="hidden" 
              accept=".json" 
             />

             <div className="pt-6 border-t border-border/50">
               <button 
                onClick={signOut}
                className="w-full flex items-center justify-between p-5 rounded-[24px] bg-rose-500/5 text-rose-600 dark:text-rose-500 border border-rose-500/10 font-black uppercase tracking-widest text-[11px] hover:bg-rose-500/10 transition-all active:scale-[0.98] group"
               >
                 <div className="flex items-center gap-3">
                   <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   <span>Terminate Session</span>
                 </div>
                 <ChevronRight className="h-4 w-4 opacity-20" />
               </button>
             </div>
          </div>
        </section>
      </div>

      {/* 4. DATA MANAGEMENT STATISTICS */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6">
           <div className="space-y-1">
              <h3 className="text-2xl font-heading font-black italic uppercase tracking-tight">System Statistics</h3>
              <p className="text-sm text-text-secondary font-soft">Quantified evidence of your identity evolution.</p>
           </div>
           <div className="px-4 py-2 bg-secondary/50 rounded-xl border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground">Live Telemetry</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
          <StatPill label="Habits" value={stats.habits} icon={Flame} color="text-orange-500" />
          <StatPill label="Goals" value={stats.goals} icon={Target} color="text-accent" />
          <StatPill label="Journal" value={stats.journal} icon={BookText} color="text-indigo-500" />
          <StatPill label="Focus" value={stats.focus} icon={Zap} color="text-primary" />
          <StatPill label="Finance" value={stats.finance} icon={Wallet} color="text-emerald-500" />
          <StatPill label="Ikigai" value={stats.ikigai} icon={Compass} color="text-amber-500" />
          <StatPill label="Tasks" value={stats.tasks} icon={ListTodo} color="text-monk-mint" />
        </div>
      </section>

      {/* 6 & 7. SECURITY & PRIVACY ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="monk-card p-10 space-y-8">
           <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="h-10 w-10 rounded-xl bg-secondary dark:bg-white/[0.03] flex items-center justify-center text-text-secondary"><Lock className="h-5 w-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-[0.4em] opacity-80">Security Architecture</h3>
           </div>
           
           <div className="space-y-5">
              <SecurityItem label="Identity Provider" value="Google OAuth 2.0" icon={Shield} />
              <SecurityItem label="Auth Status" value="Secure Session" icon={ShieldAlert} />
              <SecurityItem label="Last Logic Validation" value={new Date().toLocaleDateString()} icon={Check} />
              <SecurityItem label="Encryption Level" value="AES-256 (Cloud)" icon={Lock} />
           </div>
           
           <div className="pt-4">
            <button className="w-full py-5 border-2 border-border rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-secondary/50 transition-all active:scale-[0.98]">Request Account Access Re-auth</button>
           </div>
        </section>

        <section className="monk-card p-10 space-y-8 border-emerald-500/10 bg-emerald-500/[0.01] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12"><Archive className="h-32 w-32 text-emerald-500" /></div>
           
           <div className="flex items-center gap-4 border-b border-emerald-500/10 pb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Database className="h-5 w-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-emerald-600/80">Data Portability</h3>
           </div>

           <div className="grid grid-cols-2 gap-5">
              <PortableButton icon={FileJson} label="Archive JSON" onClick={handleExportJSON} />
              <PortableButton icon={FileSpreadsheet} label="Archive CSV" onClick={() => alert("CSV Pipeline Initiating...")} />
              <PortableButton icon={Archive} label="Cloud Backup" onClick={handleForceSync} />
              <PortableButton icon={RefreshCw} label="Restore Node" onClick={handleRestoreClick} />
           </div>
           <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-4 items-start">
              <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400/60 font-bold uppercase tracking-widest leading-relaxed">Identity Sovereignty Protocol: You own your data. Export it anytime in universal formats.</p>
           </div>
        </section>
      </div>

      {/* 8. DANGER ZONE - HIGH CONTRAST */}
      <section className="rounded-[56px] border-2 border-rose-500/30 bg-rose-500/[0.03] p-10 md:p-16 space-y-10 relative overflow-hidden group shadow-2xl shadow-rose-500/5">
         <div className="absolute -top-16 -right-16 p-12 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity rotate-12">
            <ShieldAlert className="h-64 w-64 text-rose-500" />
         </div>
         
         <div className="relative z-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-rose-500">
                    <ShieldAlert className="h-6 w-6" />
                    <h3 className="text-3xl font-heading font-black uppercase italic tracking-tighter">Danger Protocols</h3>
                  </div>
                  <p className="text-sm text-rose-600/60 dark:text-rose-400/40 font-black uppercase tracking-[0.25em]">Destructive system actions. Proceed with absolute caution.</p>
               </div>
               <div className="h-px flex-1 bg-rose-500/10 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <DangerCard 
                label="Reset System Cache" 
                desc="Wipe local storage and re-pull from cloud. Unsynced data will be lost." 
                action="Execute Reset" 
                onClick={handleResetCache}
               />
               <DangerCard 
                label="Clear Sync Queue" 
                desc="Remove all pending mutations from the offline queue." 
                action="Purge Queue" 
                onClick={() => { if(confirm("Purge offline queue?")) { localStorage.removeItem('monk_os_offline_queue'); window.location.reload(); } }}
               />
               <DangerCard 
                label="Terminate Identity" 
                desc="Permanently delete all discipline history and identity data." 
                action="Delete Account" 
                variant="filled"
                onClick={() => alert("To delete your identity, please contact identity@monkmode.os or revoke access from your Google Account settings.")}
               />
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-12 border-t border-border opacity-30">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em]">
            <p>MONK OS v2.0 • ARCHITECTURE RE-INITIALIZED</p>
            <p>© 2026 IDENTITY ENGINE</p>
         </div>
      </footer>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="w-full max-w-lg monk-card p-10 shadow-2xl border-2 border-primary/20 relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Identity Configuration</span>
                  <h2 className="text-2xl font-heading font-black italic uppercase tracking-tight">Modify Profile</h2>
                </div>
                <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-all text-foreground"><X /></button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-center mb-8">
                     <div className="relative group/edit">
                        <div className="h-24 w-24 relative rounded-[32px] overflow-hidden border-4 border-primary/20">
                           {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                              <Image src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="Avatar" fill className="object-cover" />
                           ) : <div className="h-full w-full bg-secondary flex items-center justify-center"><User className="text-foreground" /></div>}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/edit:opacity-100 flex items-center justify-center transition-opacity rounded-[28px] cursor-pointer">
                           <Camera className="h-6 w-6 text-white" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2 text-foreground">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Display Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter identity name..."
                      className="w-full px-6 py-4 rounded-2xl bg-background border border-border focus:border-primary/50 focus:outline-none transition-all font-heading font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border-2 border-border font-black text-[10px] uppercase tracking-widest hover:bg-secondary/50 transition-all text-foreground"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Lock Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Internal Helper Components ---

interface StatusCardProps {
  label: string;
  status: string;
  icon: React.ElementType;
  color: string;
  active: boolean;
  desc: string;
}

function StatusCard({ label, status, icon: Icon, color, active, desc }: StatusCardProps) {
  return (
    <div className="monk-card p-6 md:p-8 flex flex-col gap-6 border-border/50 hover:border-border transition-all group relative overflow-hidden">
      <div className={cn("absolute -bottom-4 -right-4 h-20 w-20 rounded-full blur-[40px] opacity-[0.05] transition-all group-hover:opacity-[0.1]", active ? "bg-emerald-500" : "bg-zinc-500")} />
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("p-3 rounded-2xl bg-secondary/50 dark:bg-white/[0.03] transition-all group-hover:scale-110", active && "bg-emerald-500/10")}>
           <Icon className={cn("h-5 w-5", active ? color : "text-muted-foreground")} />
        </div>
        <div className={cn("px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest", active ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500")}>
           {active ? "Active" : "Offline"}
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
        <p className={cn("text-sm font-black uppercase tracking-widest leading-tight", active ? "text-foreground" : "text-muted-foreground")}>{status}</p>
        <p className="text-[9px] text-text-secondary opacity-40 font-bold uppercase tracking-tighter mt-1">{desc}</p>
      </div>
    </div>
  );
}

interface ActionRowProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function ActionRow({ icon: Icon, label, onClick }: ActionRowProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-[20px] hover:bg-secondary dark:hover:bg-white/[0.03] border border-transparent hover:border-border transition-all group text-left"
    >
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-xl bg-secondary/80 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-foreground">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-text-secondary/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
    </button>
  );
}

interface StatPillProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

function StatPill({ label, value, icon: Icon, color }: StatPillProps) {
  return (
    <div className="monk-card p-5 flex flex-col items-center justify-center gap-3 text-center border-border/50 group hover:border-border transition-all hover:bg-secondary/10 dark:hover:bg-white/[0.01]">
      <div className={cn("p-2 rounded-xl bg-secondary/50 dark:bg-white/[0.03] group-hover:bg-white transition-all shadow-sm")}>
        <Icon className={cn("h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity", color)} />
      </div>
      <div className="space-y-0.5">
        <div className="text-2xl font-heading font-black tracking-tighter text-foreground">{value}</div>
        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

interface SecurityItemProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

function SecurityItem({ label, value, icon: Icon }: SecurityItemProps) {
  return (
    <div className="flex items-center justify-between p-5 bg-secondary/30 dark:bg-white/[0.01] rounded-3xl border border-border/50 group hover:border-border/80 transition-all">
       <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-background shadow-sm border border-border/50"><Icon className="h-4 w-4 text-muted-foreground" /></div>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.15em]">{label}</span>
       </div>
       <span className="text-xs font-black uppercase tracking-tight text-foreground">{value}</span>
    </div>
  );
}

interface PortableButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function PortableButton({ icon: Icon, label, onClick }: PortableButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-4 p-8 bg-background rounded-[32px] border-2 border-border/50 hover:border-emerald-500/40 hover:bg-emerald-500/[0.03] hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group"
    >
      <div className="h-12 w-12 rounded-2xl bg-secondary/50 dark:bg-white/[0.03] flex items-center justify-center transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110">
        <Icon className="h-6 w-6 text-muted-foreground group-hover:text-current" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{label}</span>
    </button>
  );
}

interface DangerCardProps {
  label: string;
  desc: string;
  action: string;
  onClick: () => void;
  variant?: "outline" | "filled";
}

function DangerCard({ label, desc, action, onClick, variant = "outline" }: DangerCardProps) {
  return (
    <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-900/50 border border-rose-500/10 space-y-6 flex flex-col justify-between group hover:border-rose-500/30 transition-all shadow-sm">
       <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-rose-500/80">{label}</h4>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-tighter leading-relaxed opacity-60">{desc}</p>
       </div>
       <button 
        onClick={onClick}
        className={cn(
          "w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-lg shadow-rose-500/5",
          variant === "outline" 
            ? "border border-rose-500/20 text-rose-600 dark:text-rose-500 hover:bg-rose-500 hover:text-white" 
            : "bg-rose-500 text-white hover:bg-rose-600"
        )}
       >
         {action}
       </button>
    </div>
  );
}

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = {
    synced: { bg: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500", text: "Cloud integrity verified" },
    syncing: { bg: "bg-amber-500/10 text-amber-500", dot: "bg-amber-500", text: "Mirroring modifications..." },
    error: { bg: "bg-rose-500/10 text-rose-500", dot: "bg-rose-500", text: "Identity mismatch detected" },
    offline: { bg: "bg-zinc-500/10 text-zinc-500", dot: "bg-zinc-500", text: "Disconnected node" }
  };
  const s = config[status as keyof typeof config] || config.synced;
  return (
    <div className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2", s.bg)}>
      <div className={cn("h-1.5 w-1.5 rounded-full", s.dot, status === 'syncing' && "animate-pulse")} />
      {s.text}
    </div>
  );
}
