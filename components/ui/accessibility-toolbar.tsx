'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { Settings, Type, Contrast, Eye, MoveHorizontal, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Smart Accessibility Toolbar
 * Provides quick access to accessibility settings.
 */
export function AccessibilityToolbar() {
  const { fontSize, highContrast, dyslexicFont, reducedMotion, updateSettings, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
            <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 rounded-[2rem] border-2 border-border p-6 accessibility-panel-solid z-[60]"
            role="dialog"
            aria-label="Erişilebilirlik Ayarları"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Erişilebilirlik</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-muted"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Text Size */}
              <section>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Type size={16} /> Metin Boyutu
                </label>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`flex-1 rounded-md py-1 text-xs font-bold uppercase transition-all ${
                        fontSize === size 
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/20' 
                          : 'bg-muted hover:bg-accent'
                      }`}
                      aria-pressed={fontSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              {/* High Contrast */}
              <section className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Contrast size={16} /> Yüksek Kontrast
                </label>
                <button
                  onClick={() => updateSettings({ highContrast: !highContrast })}
                  className={`relative h-6 w-12 rounded-full border-2 border-border transition-colors ${highContrast ? 'bg-primary' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={highContrast}
                >
                  <span className={`absolute left-1 top-0.5 h-4 w-4 rounded-full transition-all ${highContrast ? 'translate-x-5 bg-primary-foreground' : 'bg-foreground'}`} />
                </button>
              </section>

              {/* Dyslexic Font */}
              <section className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Eye size={16} /> Disleksi Dostu Font
                </label>
                <button
                  onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                  className={`relative h-6 w-12 rounded-full border-2 border-border transition-colors ${dyslexicFont ? 'bg-primary' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={dyslexicFont}
                >
                  <span className={`absolute left-1 top-0.5 h-4 w-4 rounded-full transition-all ${dyslexicFont ? 'translate-x-5 bg-primary-foreground' : 'bg-foreground'}`} />
                </button>
              </section>

              {/* Reduced Motion */}
              <section className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <MoveHorizontal size={16} /> Hareketi Azalt
                </label>
                <button
                  onClick={() => updateSettings({ reducedMotion: !reducedMotion })}
                  className={`relative h-6 w-12 rounded-full border-2 border-border transition-colors ${reducedMotion ? 'bg-primary' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={reducedMotion}
                >
                  <span className={`absolute left-1 top-0.5 h-4 w-4 rounded-full transition-all ${reducedMotion ? 'translate-x-5 bg-primary-foreground' : 'bg-foreground'}`} />
                </button>
              </section>

              <button
                onClick={resetSettings}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs hover:bg-muted"
              >
                <RotateCcw size={14} /> Ayarları Sıfırla
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-all hover:scale-110 active:scale-95 ring-4 ring-white dark:ring-zinc-900 border-2 border-primary"
        aria-label="Erişilebilirlik Menüsünü Aç"
        aria-expanded={isOpen}
      >
        <Settings size={32} />
      </button>
    </div>
  );
}
