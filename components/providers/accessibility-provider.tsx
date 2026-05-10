'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-provider';
import { RouteAnnouncer } from './route-announcer';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  dyslexicFont: boolean;
  reducedMotion: boolean;
  bionicReading: boolean;
  focusMode: boolean;
  voiceMode: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'md',
  highContrast: false,
  dyslexicFont: false,
  reducedMotion: false,
  bionicReading: false,
  focusMode: false,
  voiceMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Barrier-free accessibility provider for EngelsizForum.
 * Syncs with Supabase profiles if user is logged in.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSyncingFromCloud, setIsSyncingFromCloud] = useState(false);
  const lastSyncedSettings = React.useRef<string>(JSON.stringify(defaultSettings));

  // Initial load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility_prefs');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse accessibility prefs', e);
      }
    }
    setIsInitialLoad(false);
  }, []);

  // Fetch from Supabase when user logs in
  useEffect(() => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

    if (user && isSupabaseConfigured) {
      const fetchPrefs = async () => {
        setIsSyncingFromCloud(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('accessibility_prefs')
            .eq('id', user.id)
            .single();

          if (error) {
            console.warn('Could not fetch prefs from Supabase:', error.message);
          } else if (data?.accessibility_prefs) {
            const cloudSettings = data.accessibility_prefs as AccessibilitySettings;
            setSettings(cloudSettings);
            lastSyncedSettings.current = JSON.stringify(cloudSettings);
          }
        } catch (err) {
          console.error('Exception while fetching prefs:', err);
        } finally {
          setIsSyncingFromCloud(false);
        }
      };
      fetchPrefs();
    }
  }, [user]);

  // Apply and Persist locally
  useEffect(() => {
    if (isInitialLoad) return;

    const root = document.documentElement;
    root.setAttribute('data-font-size', settings.fontSize);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('dyslexic-font', settings.dyslexicFont);
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('bionic-reading', settings.bionicReading);
    root.classList.toggle('focus-mode', settings.focusMode);
    root.classList.toggle('voice-mode', settings.voiceMode);

    localStorage.setItem('accessibility_prefs', JSON.stringify(settings));

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

    // Sync with Supabase if logged in and settings actually changed
    const currentSettingsStr = JSON.stringify(settings);
    if (user && isSupabaseConfigured && !isSyncingFromCloud && currentSettingsStr !== lastSyncedSettings.current) {
       supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          accessibility_prefs: settings,
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) {
            console.error('Failed to sync prefs to Supabase:', error.message || 'Unknown error');
            // We'll try again next time they actually change something
            lastSyncedSettings.current = currentSettingsStr;
          } else {
            lastSyncedSettings.current = currentSettingsStr;
          }
        });
    }
  }, [settings, user, isInitialLoad, isSyncingFromCloud]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <AccessibilityContext.Provider value={{ ...settings, updateSettings, resetSettings }}>
      <div className={`accessibility-wrapper min-h-screen ${settings.highContrast ? 'dark contrast-more' : ''}`}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/50"
        >
          Ana İçeriğe Atla
        </a>
        <RouteAnnouncer />
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
}
