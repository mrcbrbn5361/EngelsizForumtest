'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase URL is not configured.');
      return;
    }

    const maxAttempts = 3;
    let lastErr: any = null;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
          lastErr = error;
          const errMsg = error.message || String(error);
          if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || errMsg.includes('TypeError')) {
            console.warn('Network issue fetching profile from Supabase');
            setProfile(null);
            return;
          }
        } else if (data) {
          // Verify role from validated profile row
          let finalProfile = data;
          const userMetaAvatar = (authUser.user_metadata?.avatar_url as string) || (authUser.user_metadata?.picture as string) || null;
          
          // Auto-sync avatar if missing in profile row but present in auth metadata
          if (!data.avatar_url && userMetaAvatar) {
            finalProfile = { ...finalProfile, avatar_url: userMetaAvatar };
            supabase.from('profiles').update({ avatar_url: userMetaAvatar }).eq('id', authUser.id).then();
          }

          if (authUser.email === 'miracbirben@gmail.com' && data.role !== 'admin') {
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', authUser.id)
              .select()
              .maybeSingle();
            if (updatedProfile) {
              finalProfile = { ...updatedProfile, avatar_url: updatedProfile.avatar_url || userMetaAvatar };
            } else {
              finalProfile = { ...finalProfile, role: 'admin' };
            }
          }
          setProfile(finalProfile);
          return;
        } else {
          // Profile does not exist - Let's auto-create it!
          const defaultUsername = authUser.email ? authUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : `user_${authUser.id.substring(0, 5)}`;
          const defaultRole = authUser.email === 'miracbirben@gmail.com' ? 'admin' : 'user';
          const metaAvatar = (authUser.user_metadata?.avatar_url as string) || (authUser.user_metadata?.picture as string) || '';
          const newProfile = {
            id: authUser.id,
            username: defaultUsername,
            full_name: authUser.user_metadata?.full_name || defaultUsername,
            avatar_url: metaAvatar,
            role: defaultRole,
            xp: 10,
            level: 1,
            created_at: new Date().toISOString()
          };
          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .maybeSingle();
          
          if (!insertError && insertedData) {
            setProfile(insertedData);
            return;
          } else {
            console.error('Error auto-creating profile:', insertError);
            setProfile(newProfile as any);
            return;
          }
        }
      } catch (err: any) {
        lastErr = err;
        const errMsg = err?.message || String(err);
        if (errMsg.includes('Failed to fetch') || errMsg.includes('TypeError')) {
          console.warn('Network exception while fetching profile');
          setProfile(null);
          return;
        }
      }

      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 250));
      }
    }

    // If profile row doesn't exist or couldn't be fetched, keep profile null instead of generating synthetic fake role/XP/username
    setProfile(null);
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
          await fetchProfile(session.user);
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
          await fetchProfile(session.user);
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

  // Realtime subscription for current user's profile updates
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`profile_update_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
