'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-provider';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  dyslexicFont: boolean;
  reducedMotion: boolean;
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

  // Initial load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility_prefs');
    requestAnimationFrame(() => {
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      setIsInitialLoad(false);
    });
  }, []);

  // Fetch from Supabase when user logs in
  useEffect(() => {
    if (user) {
      const fetchPrefs = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('accessibility_prefs')
          .eq('id', user.id)
          .single();

        if (data?.accessibility_prefs && !error) {
          setSettings(data.accessibility_prefs as AccessibilitySettings);
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

    localStorage.setItem('accessibility_prefs', JSON.stringify(settings));

    // Sync with Supabase if logged in
    if (user) {
       supabase
        .from('profiles')
        .update({ accessibility_prefs: settings })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to sync prefs:', error);
        });
    }
  }, [settings, user, isInitialLoad]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <AccessibilityContext.Provider value={{ ...settings, updateSettings, resetSettings }}>
      <div className={`accessibility-wrapper min-h-screen ${settings.highContrast ? 'dark contrast-more' : ''}`}>
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
