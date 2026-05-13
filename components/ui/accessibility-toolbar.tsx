'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { Settings, Type, Contrast, Eye, MoveHorizontal, X, RotateCcw, Zap, Target, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Smart Accessibility Toolbar
 * Provides quick access to accessibility settings.
 */
export function AccessibilityToolbar() {
  const { 
    fontSize, 
    highContrast, 
    dyslexicFont, 
    reducedMotion, 
    bionicReading,
    focusMode,
    voiceMode,
    updateSettings, 
    resetSettings 
  } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {isOpen && (
            <div
            className="mb-4 w-[calc(100vw-2rem)] sm:w-96 rounded-[2.5rem] border-4 border-border p-8 bg-card shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] z-[60] animate-in slide-in-from-bottom-4 fade-in duration-300"
            role="dialog"
            aria-label="Erişilebilirlik Ayarları"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tighter">Erişilebilirlik</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-muted transition-colors"
                aria-label="Kapat"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Text Size */}
              <section>
                <label className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Type size={14} className="text-primary" /> Metin Boyutu
                </label>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase transition-all ${
                        fontSize === size 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.05]' 
                          : 'bg-muted hover:bg-accent text-muted-foreground'
                      }`}
                      aria-pressed={fontSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              {/* High Contrast */}
              <section className="flex items-center justify-between group">
                <label className="flex items-center gap-2 text-sm font-bold group-hover:text-primary transition-colors">
                  <Contrast size={18} className="text-primary" /> Yüksek Kontrast
                </label>
                <button
                  onClick={() => updateSettings({ highContrast: !highContrast })}
                  className={`relative h-7 w-14 rounded-full border-2 border-border transition-all ${highContrast ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={highContrast}
                >
                  <span className={`absolute left-1 top-0.5 h-5 w-5 rounded-full transition-all shadow-sm ${highContrast ? 'translate-x-7 bg-white' : 'bg-foreground/50'}`} />
                </button>
              </section>

              {/* Dyslexic Font */}
              <section className="flex items-center justify-between group">
                <label className="flex items-center gap-2 text-sm font-bold group-hover:text-primary transition-colors">
                  <Eye size={18} className="text-primary" /> Disleksi Fontu
                </label>
                <button
                  onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                  className={`relative h-7 w-14 rounded-full border-2 border-border transition-all ${dyslexicFont ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={dyslexicFont}
                >
                  <span className={`absolute left-1 top-0.5 h-5 w-5 rounded-full transition-all shadow-sm ${dyslexicFont ? 'translate-x-7 bg-white' : 'bg-foreground/50'}`} />
                </button>
              </section>

              {/* Reduced Motion */}
              <section className="flex items-center justify-between group">
                <label className="flex items-center gap-2 text-sm font-bold group-hover:text-primary transition-colors">
                  <MoveHorizontal size={18} className="text-primary" /> Hareketi Azalt
                </label>
                <button
                  onClick={() => updateSettings({ reducedMotion: !reducedMotion })}
                  className={`relative h-7 w-14 rounded-full border-2 border-border transition-all ${reducedMotion ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={reducedMotion}
                >
                  <span className={`absolute left-1 top-0.5 h-5 w-5 rounded-full transition-all shadow-sm ${reducedMotion ? 'translate-x-7 bg-white' : 'bg-foreground/50'}`} />
                </button>
              </section>

              {/* Bionic Reading */}
              <section className="flex items-center justify-between group">
                <label className="flex items-center gap-2 text-sm font-bold group-hover:text-primary transition-colors">
                  <Zap size={18} className="text-primary" /> Biyonik Okuma
                </label>
                <button
                  onClick={() => updateSettings({ bionicReading: !bionicReading })}
                  className={`relative h-7 w-14 rounded-full border-2 border-border transition-all ${bionicReading ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={bionicReading}
                >
                  <span className={`absolute left-1 top-0.5 h-5 w-5 rounded-full transition-all shadow-sm ${bionicReading ? 'translate-x-7 bg-white' : 'bg-foreground/50'}`} />
                </button>
              </section>

              {/* Focus Mode */}
              <section className="flex items-center justify-between group">
                <label className="flex items-center gap-2 text-sm font-bold group-hover:text-primary transition-colors">
                  <Target size={18} className="text-primary" /> Odak Modu
                </label>
                <button
                  onClick={() => updateSettings({ focusMode: !focusMode })}
                  className={`relative h-7 w-14 rounded-full border-2 border-border transition-all ${focusMode ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={focusMode}
                >
                  <span className={`absolute left-1 top-0.5 h-5 w-5 rounded-full transition-all shadow-sm ${focusMode ? 'translate-x-7 bg-white' : 'bg-foreground/50'}`} />
                </button>
              </section>

              {/* Voice Mode */}
              <section className="flex items-center justify-between group">
                <label className="flex items-center gap-2 text-sm font-bold group-hover:text-primary transition-colors">
                  <Mic size={18} className="text-primary" /> Sesli Mod (STT)
                </label>
                <button
                  onClick={() => updateSettings({ voiceMode: !voiceMode })}
                  className={`relative h-7 w-14 rounded-full border-2 border-border transition-all ${voiceMode ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={voiceMode}
                >
                  <span className={`absolute left-1 top-0.5 h-5 w-5 rounded-full transition-all shadow-sm ${voiceMode ? 'translate-x-7 bg-white' : 'bg-foreground/50'}`} />
                </button>
              </section>

              <button
                onClick={resetSettings}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-border py-4 text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors active:scale-95"
              >
                <RotateCcw size={16} /> Varsayılana Dön
              </button>
            </div>
          </div>
        )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-all hover:scale-110 active:scale-95 ring-4 ring-white dark:ring-zinc-900 border-2 border-primary"
        aria-label="Erişilebilirlik Menüsünü Aç"
        aria-expanded={isOpen}
      >
        <Settings size={22} className="sm:hidden" />
        <Settings size={32} className="hidden sm:block" />
      </button>
    </div>
  );
}
