"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  LogOut, 
  RefreshCw, 
  Shield, 
  Smartphone, 
  Database,
  Cloud,
  CloudOff,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useSyncStore } from "@/lib/sync/syncStore";
import { syncManager } from "@/lib/sync/syncManager";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user, profile, signOut } = useAuth();
  const { status, lastSyncedAt, pendingMutations } = useSyncStore();
  const [activeDevices, setActiveDevices] = useState(1);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0B0D10] h-full shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-white/5">
            <h2 className="text-xl font-heading font-black uppercase tracking-tighter italic">Identity Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 space-y-10">
            {/* Account Info - Premium Identity Card */}
            <section className="relative">
              <div className="flex flex-col items-center text-center p-8 rounded-[32px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                   <Shield className="h-32 w-32 rotate-12" />
                </div>
                
                <div className="h-24 w-24 md:h-28 md:w-28 relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                  <div className="h-full w-full relative bg-white dark:bg-white/10 rounded-[32px] overflow-hidden p-1.5 border-4 border-white dark:border-zinc-900 shadow-2xl relative z-10">
                    {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                      <Image 
                        src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                        alt="Avatar" 
                        fill 
                        className="object-cover rounded-[24px]"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                        <User className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 relative z-10">
                  <h3 className="font-heading font-black text-2xl tracking-tighter uppercase italic">
                    {profile?.full_name || user?.user_metadata?.full_name || "Monk"}
                  </h3>
                  <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                    {user?.email}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <div className="px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-widest shadow-lg">
                    {profile?.subscription_tier || 'Free'} Status
                  </div>
                  <div className="h-2 w-2 rounded-full bg-monk-mint animate-pulse shadow-[0_0_8px_rgba(142,217,204,0.6)]" />
                </div>
              </div>
            </section>

            {/* Sync Engine - High Fidelity Controls */}
            <section className="space-y-5">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Sync Infrastructure</h4>
                <div className={cn("flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest", status === 'synced' ? 'text-emerald-500' : 'text-amber-500')}>
                  {status === 'synced' ? 'Systems Nominal' : 'Updating...'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <SyncStat 
                  icon={status === 'offline' ? CloudOff : Cloud}
                  label="Status"
                  value={status === 'synced' ? '🟢 Synced' : status === 'syncing' ? '🟡 Syncing' : status === 'offline' ? '⚪ Offline' : '🔴 Error'}
                  color={status === 'synced' ? 'text-emerald-500' : status === 'syncing' ? 'text-amber-500' : 'text-rose-500'}
                />
                <SyncStat 
                  icon={RefreshCw}
                  label="Pending"
                  value={`${pendingMutations} Updates`}
                  color="text-primary"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                  <span>Cloud Persistence</span>
                  <span>{lastSyncedAt ? 'Active' : 'Awaiting...'}</span>
                </div>
                <div className="h-1 w-full bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: status === 'synced' ? '100%' : '30%' }}
                    className={cn("h-full transition-all duration-1000", status === 'synced' ? "bg-monk-mint shadow-[0_0_10px_rgba(142,217,204,0.4)]" : "bg-primary")}
                  />
                </div>
                <p className="text-[9px] text-zinc-400 text-center italic">
                  Last successful pulse: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Never'}
                </p>
              </div>

              <button 
                onClick={() => syncManager.sync()}
                className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-transparent dark:border-white/10"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", status === 'syncing' && "animate-spin")} />
                Force Cloud Synchronization
              </button>
            </section>

            {/* Mastery Controls */}
            <section className="space-y-3 pt-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 px-2">Mastery Controls</h4>
               <MenuButton icon={Shield} label="Subscription Architecture" />
               <MenuButton icon={User} label="Identity Configuration" />
               
               <div className="pt-4">
                 <button 
                  onClick={signOut}
                  className="w-full flex items-center justify-between p-5 rounded-3xl bg-rose-500/5 text-rose-600 dark:text-rose-500 border border-rose-500/10 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500/10 transition-all active:scale-[0.98] group"
                 >
                   <div className="flex items-center gap-3">
                     <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     <span>Terminate Session</span>
                   </div>
                   <ChevronRight className="h-4 w-4 opacity-30" />
                 </button>
               </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em] text-center">
              MONK OS v2.0 • Hybrid Architecture
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SyncStat({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3 text-zinc-400" />
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <p className={cn("text-xs font-bold", color)}>{value}</p>
    </div>
  );
}

function MenuButton({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/[0.02] text-zinc-700 dark:text-zinc-300 font-bold text-sm transition-all active:scale-95 border border-transparent hover:border-zinc-100 dark:hover:border-white/5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 opacity-40" />
        <span>{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 opacity-40" />
    </button>
  );
}
