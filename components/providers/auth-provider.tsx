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

          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          break;
        }
        setProfile(data);
        return; // Success
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
          // We wait a bit to ensure session is stored in localStorage by Supabase
          setTimeout(() => {
             window.location.href = '/auth/reset-password';
          }, 100);
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
    const ensureProfile = async () => {
      if (user) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (!existingProfile) {
            console.log('Ensuring profile for user:', user.id);
            const baseUsername = user.email?.split('@')[0] || 'user';
            const { error } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                username: `${baseUsername}_${user.id.slice(0, 4)}`,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || baseUsername,
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                role: 'user', // Default role
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });
            
            if (error) console.error('Error creating default profile:', error);
            else await fetchProfile(user.id);
          }
        } catch (err) {
          console.error('Error in profile assurance:', err);
        }
      }
    };
    ensureProfile();
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
