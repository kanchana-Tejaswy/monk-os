"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging in with Google:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0D10] flex flex-col items-center justify-center p-6 transition-colors duration-500 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-primary/10 dark:from-primary/5 to-transparent -z-10 pointer-events-none" />
      
      <div className="w-full max-w-sm space-y-10 md:space-y-12 animate-in fade-in zoom-in duration-1000 flex flex-col items-center relative z-10">
        
        {/* Brand - Ultra Tight for Mobile */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-20 w-20 md:h-28 md:w-28 relative bg-white dark:bg-white/5 rounded-[24px] md:rounded-[32px] shadow-2xl border border-black/5 dark:border-white/10 p-3 md:p-4 flex items-center justify-center backdrop-blur-sm">
            <div className="relative h-full w-full">
              <Image 
                src="/monk-logo.jpeg" 
                alt="Monk Mode Logo" 
                fill 
                className="object-contain opacity-90"
                priority
              />
            </div>
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">monk mode</h1>
            <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 font-black tracking-[0.25em] uppercase">
              Identity Evolution Active
            </p>
          </div>
        </div>

        {/* Auth Box - Precision Glassmorphism */}
        <div className="w-full monk-card p-6 md:p-8 space-y-6 bg-white/50 dark:bg-white/[0.02] border-zinc-200/60 dark:border-white/5 backdrop-blur-md shadow-xl shadow-zinc-900/5 dark:shadow-none">
          <div className="text-center space-y-1.5 md:space-y-2">
            <h2 className="text-lg md:text-xl font-heading font-bold text-zinc-900 dark:text-white">Welcome, Monk Mode</h2>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-soft">Initiate your daily discipline sequence.</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl dark:shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="filter dark:brightness-100">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="uppercase tracking-widest text-[11px] md:text-sm">Initiate with Google</span>
              </>
            )}
          </button>
          
          <div className="text-center pt-2">
            <p className="text-[8px] md:text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em] opacity-60">
              Identity Verification via Supabase
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
