'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
    for (let i = 0; i < 3; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          lastError = error;
          const isRecursionError = error.message?.toLowerCase().includes('recursion');
          if (isRecursionError) break; // Don't retry if it's recursion

          // Self-healing: if profile doesn't exist (PGRST116), create one!
          if (error.code === 'PGRST116') {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.id === userId) {
              const email = user.email;
              const designatedAdmins = ['miracbirben@gmail.com', 'brtapardi@gmail.com', 'yigitfirat3405@gmail.com'];
              const isDesignatedAdmin = email && designatedAdmins.includes(email.toLowerCase());
              const defaultRole = isDesignatedAdmin ? 'admin' : 'user';

              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  username: user.user_metadata?.username || 'user_' + user.id.substring(0, 8),
                  full_name: user.user_metadata?.full_name || 'Yeni Kullanıcı',
                  avatar_url: user.user_metadata?.avatar_url || '',
                  role: defaultRole
                })
                .select()
                .single();
              
              if (!insertError && newProfile) {
                setProfile(newProfile);
                return; // Success
              } else {
                console.error('Failed to auto-create profile:', insertError);
              }
            }
          }

          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          break;
        }

        if (data) {
          // Self-healing: Promote on the fly if this is a designated admin but has wrong role in DB
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.id === userId && user.email) {
            const email = user.email.toLowerCase();
            const designatedAdmins = ['miracbirben@gmail.com', 'brtapardi@gmail.com', 'yigitfirat3405@gmail.com'];
            if (designatedAdmins.includes(email) && data.role !== 'admin') {
              const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', userId)
                .select()
                .single();
              
              if (!updateError && updatedProfile) {
                setProfile(updatedProfile);
                return; // Success
              } else {
                console.error('Failed to auto-promote admin profile:', updateError);
              }
            }
          }

          setProfile(data);
          return; // Success
        }
      } catch (err: any) {
        lastError = err;
        if (err.message?.toLowerCase().includes('recursion')) break;
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (lastError) {
      console.error('Error fetching profile from Supabase:', lastError);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const isRecoveryActive = sessionStorage.getItem('password_recovery_active') === 'true';

        // If we are on the reset-password page or URL has recovery token, do NOT set the user context
        if (window.location.pathname === '/auth/reset-password' || window.location.hash.includes('type=recovery')) {
          if (window.location.hash.includes('type=recovery')) {
            sessionStorage.setItem('password_recovery_active', 'true');
          }
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (window.location.pathname !== '/auth/reset-password') {
            window.location.href = '/auth/reset-password' + window.location.hash;
          }
          return;
        }

        if (isRecoveryActive && window.location.pathname !== '/auth/reset-password') {
          sessionStorage.removeItem('password_recovery_active');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
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
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery mode active!');
          sessionStorage.setItem('password_recovery_active', 'true');
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
        
        // Check if we are in recovery mode
        const isRecoveryActive = sessionStorage.getItem('password_recovery_active') === 'true';

        // If they are on the reset-password page but the event is not PASSWORD_RECOVERY,
        // and they just landed there with a recovery token, we shouldn't show them as logged in.
        if (window.location.pathname === '/auth/reset-password' || window.location.hash.includes('type=recovery')) {
          if (window.location.hash.includes('type=recovery')) {
            sessionStorage.setItem('password_recovery_active', 'true');
          }
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (window.location.pathname !== '/auth/reset-password') {
            window.location.href = '/auth/reset-password' + window.location.hash;
          }
          return;
        }

        // If they navigate away from reset-password while recovery is active, sign them out immediately!
        // This prevents the security flaw where clicking the reset link logs them in to the whole app.
        if (isRecoveryActive && window.location.pathname !== '/auth/reset-password') {
          sessionStorage.removeItem('password_recovery_active');
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

  

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
