"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
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
  const supabase = createClient();

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
        syncManager.start();
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('monk_os_profile');
        syncManager.stop();
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      syncManager.stop();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
        localStorage.setItem('monk_os_profile', JSON.stringify(data));
        migrationManager.migrateAll(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    localStorage.removeItem('monk_os_profile');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
