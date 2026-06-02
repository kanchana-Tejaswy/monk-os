"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { syncManager } from '@/lib/sync/syncManager';
import { migrationManager } from '@/lib/sync/migrationManager';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: 'Free' | 'Mastery';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const clearUserCache = useCallback(() => {
    const keysToClear = [
      'monk_os_profile',
      'monk_os_habits',
      'monk_os_logs',
      'monk_os_finance',
      'monk_os_bills',
      'monk_os_debts',
      'monk_os_focus',
      'monk_os_focus_duration',
      'monk_os_custom_modes',
      'monk_os_todos',
      'monk_os_journal',
      'monkos_ikigai_evolution',
      'monk_os_iron_will',
      'monk_os_iron_will_logs',
      'monk_os_goals',
      'monk_os_settings',
      'monk_os_streak_data',
      'monk_os_streak_restart',
      'monk_os_offline_queue',
      'monk_os_migrated_v2',
      'monk_os_sync_status'
    ];
    keysToClear.forEach(key => localStorage.removeItem(key));
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
        localStorage.setItem('monk_os_profile', JSON.stringify(data));
        migrationManager.migrateAll(userId);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // 1. Initial Load from Local Storage (Offline First)
    const cachedProfile = localStorage.getItem('monk_os_profile');
    if (cachedProfile) {
      setProfile(JSON.parse(cachedProfile));
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
          syncManager.start();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setLoading(false);
      }
    };

    initAuth();

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('🔔 Auth State Change:', event, session?.user?.email);
      
      if (session?.user) {
        // If a new user logged in (different from previous or previous was null)
        if (user && user.id !== session.user.id) {
          console.log('🔄 User mismatch detected. Purging old session data...');
          clearUserCache();
        }
        
        setUser(session.user);
        fetchProfile(session.user.id);
        syncManager.start();
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Sign out detected. Clearing all state...');
        setUser(null);
        setProfile(null);
        clearUserCache();
        syncManager.stop();
        setLoading(false);
        // Force refresh to ensure all modules reset their local state
        if (typeof window !== 'undefined') window.location.href = '/login';
      } else {
        setUser(null);
        setProfile(null);
        syncManager.stop();
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      syncManager.stop();
    };
  }, [supabase, fetchProfile, clearUserCache, user]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during signOut:', error);
    } finally {
      setUser(null);
      setProfile(null);
      clearUserCache();
      syncManager.stop();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
