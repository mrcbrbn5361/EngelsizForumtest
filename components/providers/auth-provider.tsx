'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    let lastError = null;

    if (!isSupabaseConfigured) {
      console.warn('Supabase URL is not configured.');
      return;
    }

    // Try multiple times with exponential backoff to allow the auth trigger to create the profile
    for (let i = 0; i < 5; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          lastError = error;
          console.error(`Attempt ${i + 1} to fetch profile failed:`, error.message);
        } else if (data) {
          setProfile(data);
          return;
        }
      } catch (err: any) {
        lastError = err;
        console.error(`Exception during profile fetch attempt ${i + 1}:`, err);
      }
      
      // Wait before next retry (500ms, 1000ms, 2000ms, 4000ms, 8000ms)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 500));
    }
    
    if (lastError) {
      console.error('Final error fetching profile from Supabase:', {
        message: lastError.message || lastError,
        code: lastError.code,
        details: lastError.details,
        hint: lastError.hint
      });
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        let isRecoveryActive = false;
        try {
          isRecoveryActive = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('password_recovery_active') === 'true';
        } catch (e) {
          console.warn('sessionStorage access failed', e);
        }

        // If we are on the reset-password page or URL has recovery token, do NOT set the user context
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const hash = window.location.hash;

          if (path === '/auth/reset-password' || hash.includes('type=recovery')) {
            if (hash.includes('type=recovery')) {
              try {
                sessionStorage.setItem('password_recovery_active', 'true');
              } catch (e) {}
            }
            setUser(null);
            setProfile(null);
            setLoading(false);
            if (path !== '/auth/reset-password') {
              window.location.href = '/auth/reset-password' + hash;
            }
            return;
          }

          if (isRecoveryActive && path !== '/auth/reset-password') {
            try {
              sessionStorage.removeItem('password_recovery_active');
            } catch (e) {}
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (typeof window === 'undefined') return;

        let isRecoveryActive = false;
        try {
          isRecoveryActive = sessionStorage.getItem('password_recovery_active') === 'true';
        } catch (e) {}

        const path = window.location.pathname;
        const hash = window.location.hash;

        if (event === 'PASSWORD_RECOVERY') {
          try {
            sessionStorage.setItem('password_recovery_active', 'true');
          } catch (e) {}
          // We wait a bit to ensure session is stored in localStorage by Supabase
          setTimeout(() => {
             // Only redirect if we are not already on the reset-password page
             if (window.location.pathname !== '/auth/reset-password') {
               window.location.href = '/auth/reset-password';
             }
          }, 100);
          
          // DO NOT set the user context during recovery, so they appear logged out
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        // If they are on the reset-password page but the event is not PASSWORD_RECOVERY,
        // and they just landed there with a recovery token, we shouldn't show them as logged in.
        if (path === '/auth/reset-password' || hash.includes('type=recovery')) {
          if (hash.includes('type=recovery')) {
            try {
              sessionStorage.setItem('password_recovery_active', 'true');
            } catch (e) {}
          }
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (path !== '/auth/reset-password') {
            window.location.href = '/auth/reset-password' + hash;
          }
          return;
        }

        // If they navigate away from reset-password while recovery is active, sign them out immediately!
        // This prevents the security flaw where clicking the reset link logs them in to the whole app.
        if (isRecoveryActive && path !== '/auth/reset-password') {
          try {
            sessionStorage.removeItem('password_recovery_active');
          } catch (e) {}
          supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [fetchProfile]);

  

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    const updateLastSeen = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', user.id);
        
        if (error) {
          // Fallback if column last_seen_at doesn't exist yet
          await supabase
            .from('profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      } catch (err) {
        console.error('Error updating last seen status:', err);
      }
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 3 * 60 * 1000); // every 3 minutes
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
