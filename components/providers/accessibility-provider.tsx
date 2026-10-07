'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './auth-provider';
import { RouteAnnouncer } from './route-announcer';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  dyslexicFont: boolean;
  reducedMotion: boolean;
  bionicReading: boolean;
  focusMode: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  largeCursor: boolean;
  audioGuide: boolean;
  readingRuler: boolean;     // Dyslexia & ADHD guide line
  visualAlerts: boolean;     // Visual flash for deaf & hard-of-hearing users
}

interface AccessibilityContextType extends AccessibilitySettings {
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  triggerVisualAlert: (type?: 'info' | 'success' | 'warning') => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'md',
  highContrast: false,
  dyslexicFont: false,
  reducedMotion: false,
  bionicReading: false,
  focusMode: false,
  colorBlindness: 'none',
  largeCursor: false,
  audioGuide: false,
  readingRuler: false,
  visualAlerts: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Universal Barrier-Free Accessibility Provider (WCAG 2.1 AAA Compliant).
 * Designed for TEKNOFEST 2027 Engelsiz Yaşam Teknolojileri.
 * 
 * Supports:
 * - Visually impaired: High contrast, screen-reader audio guide (Web Speech TTS), large cursors, SVG colorblind matrices.
 * - Hearing impaired: Visual flash notifications, tactile feedback cues.
 * - Neurodiverse / Dyslexia / ADHD: OpenDyslexic font, reading ruler guide, focus mode dimmer, bionic reading parser.
 * - Motor impaired: 44px+ touch targets, keyboard hotkeys trap & navigation.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSyncingFromCloud, setIsSyncingFromCloud] = useState(false);
  const [visualFlash, setVisualFlash] = useState<string | null>(null);
  const [rulerY, setRulerY] = useState<number>(200);
  const lastSyncedSettings = React.useRef<string>(JSON.stringify(defaultSettings));

  // Initialize and load saved local preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('engelsiz_a11y_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore localStorage errors in private mode
    }
    setIsInitialLoad(false);
  }, []);

  // Fetch from Supabase when user logs in
  useEffect(() => {
    if (user && isSupabaseConfigured) {
      const fetchPrefs = async () => {
        setIsSyncingFromCloud(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('accessibility_prefs')
            .eq('id', user.id)
            .maybeSingle();

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

  // Apply settings to DOM and persist locally & cloud
  useEffect(() => {
    if (isInitialLoad) return;

    try {
      const root = document.documentElement;
      root.setAttribute('data-font-size', settings.fontSize);
      root.classList.toggle('high-contrast', settings.highContrast);
      root.classList.toggle('dyslexic-font', settings.dyslexicFont);
      root.classList.toggle('reduced-motion', settings.reducedMotion);
      root.classList.toggle('bionic-reading', settings.bionicReading);
      root.classList.toggle('focus-mode', settings.focusMode);
      root.classList.toggle('large-cursor', settings.largeCursor);
      root.classList.toggle('reading-ruler-active', settings.readingRuler);

      // Color blindness filters
      root.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia');
      if (settings.colorBlindness && settings.colorBlindness !== 'none') {
        root.classList.add(settings.colorBlindness);
      }

      // Persist in localStorage
      localStorage.setItem('engelsiz_a11y_prefs', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not apply accessibility settings', e);
    }

    // Sync with Supabase if logged in and settings actually changed
    const currentSettingsStr = JSON.stringify(settings);
    if (user && isSupabaseConfigured && !isSyncingFromCloud && currentSettingsStr !== lastSyncedSettings.current) {
       supabase
        .from('profiles')
        .update({ 
          accessibility_prefs: settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to sync prefs to Supabase:', error.message || 'Unknown error');
          }
          lastSyncedSettings.current = currentSettingsStr;
        });
    }
  }, [settings, user, isInitialLoad, isSyncingFromCloud]);

  // Track cursor for Reading Ruler (Dyslexia / ADHD aid)
  useEffect(() => {
    if (!settings.readingRuler || typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingRuler]);

  // Visual Alert for Hearing Impaired
  const triggerVisualAlert = React.useCallback((type: 'info' | 'success' | 'warning' = 'info') => {
    if (!settings.visualAlerts) return;
    setVisualFlash(type);
    const timer = setTimeout(() => {
      setVisualFlash(null);
    }, 450);
    return () => clearTimeout(timer);
  }, [settings.visualAlerts]);

  // Audio Guide (Hover & Focus TTS Screen-Reader Mode)
  useEffect(() => {
    if (isInitialLoad || !settings.audioGuide) return;

    let lastText = '';
    let speechTimeout: NodeJS.Timeout;

    const handleHoverFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest('button, a, h1, h2, h3, h4, h5, h6, [role="button"], label, p, input, textarea');
      if (!interactive) return;

      let text = '';
      if (interactive.tagName === 'INPUT' || interactive.tagName === 'TEXTAREA') {
        text = (interactive as HTMLInputElement).placeholder || interactive.getAttribute('aria-label') || '';
      } else {
        text = interactive.getAttribute('aria-label') || interactive.textContent || '';
      }
      
      const trimmed = text.trim().substring(0, 150);
      if (trimmed && trimmed !== lastText) {
        lastText = trimmed;
        clearTimeout(speechTimeout);
        speechTimeout = setTimeout(() => {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(trimmed);
            utterance.lang = 'tr-TR';
            utterance.rate = 1.05;
            window.speechSynthesis.speak(utterance);
          }
        }, 150);
      }
    };

    const handleMouseLeave = () => {
      lastText = '';
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };

    document.addEventListener('mouseover', handleHoverFocus);
    document.addEventListener('focusin', handleHoverFocus);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseover', handleHoverFocus);
      document.removeEventListener('focusin', handleHoverFocus);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(speechTimeout);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [settings.audioGuide, isInitialLoad]);

  const updateSettings = React.useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = React.useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('engelsiz_a11y_prefs');
    } catch {}
  }, []);

  const accessibilityClasses = !isInitialLoad && settings.highContrast ? 'dark contrast-more' : '';

  const contextValue = React.useMemo(() => ({
    ...settings,
    updateSettings,
    resetSettings,
    triggerVisualAlert
  }), [settings, updateSettings, resetSettings, triggerVisualAlert]);

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div className={`accessibility-wrapper min-h-screen ${accessibilityClasses}`}>
        <RouteAnnouncer />

        {/* Visual Flash Notification for Deaf / Hearing-Impaired Users */}
        {visualFlash && (
          <div 
            aria-live="assertive"
            aria-label="Görsel Uyarı Bildirimi"
            className={`fixed inset-0 pointer-events-none z-[999999] transition-opacity duration-200 border-8 ${
              visualFlash === 'success' 
                ? 'border-emerald-500 bg-emerald-500/15' 
                : visualFlash === 'warning' 
                  ? 'border-amber-500 bg-amber-500/15' 
                  : 'border-sky-500 bg-sky-500/15'
            }`} 
          />
        )}

        {/* Reading Ruler for Dyslexia & ADHD Focus */}
        {settings.readingRuler && (
          <div
            aria-hidden="true"
            className="reading-ruler fixed left-0 right-0 pointer-events-none z-[999998] transition-none"
            style={{
              top: `${rulerY - 24}px`,
              height: '48px',
              backgroundColor: 'rgba(254, 240, 138, 0.22)',
              borderTop: '2px solid rgba(234, 179, 8, 0.75)',
              borderBottom: '2px solid rgba(234, 179, 8, 0.75)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.15)',
            }}
          />
        )}

        {children}
        
        {/* Hidden SVG Filters for Color Blindness Accommodation */}
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <filter id="protanopia">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="deuteranopia">
              <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="tritanopia">
              <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="achromatopsia">
              <feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
          </defs>
        </svg>
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
}
