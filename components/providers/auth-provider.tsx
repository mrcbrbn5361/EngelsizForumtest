'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          if (error.message.includes('Refresh Token Not Found')) {
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event);
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      } else if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });
            
            if (error) console.error('Error creating default profile:', error);
          }
        } catch (err) {
          console.error('Error in profile assurance:', err);
        }
      }
    };
    ensureProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
