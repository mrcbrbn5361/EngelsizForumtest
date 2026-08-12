'use client';

import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { 
  Settings, 
  Type, 
  Eye, 
  Wind, 
  Zap, 
  RotateCcw,
  Maximize2,
  MousePointer2,
  Accessibility
} from 'lucide-react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { motion, AnimatePresence } from 'motion/react';

/**
 * World-class Accessibility Toolbar (WCAG 2.2 AAA)
 * Floating control panel for barrier-free experience.
 */
export function AccessibilityToolbar() {
  const { 
    fontSize, 
    highContrast, 
    dyslexicFont, 
    reducedMotion, 
    bionicReading, 
    focusMode,
    updateSettings,
    resetSettings 
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="vibe-card p-6 w-[320px] shadow-2xl pointer-events-auto border-primary/20"
            role="dialog"
            aria-label="Erişilebilirlik Paneli"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Accessibility className="text-primary w-5 h-5" />
                Erişilebilirlik
              </h2>
              <button 
                onClick={resetSettings}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="Ayarları Sıfırla"
                aria-label="Tüm erişilebilirlik ayarlarını sıfırla"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Font Size */}
              <section>
                <label className="vibe-label flex items-center gap-2">
                  <Type size={14} /> Yazı Boyutu
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`h-10 rounded-xl text-xs font-black uppercase transition-all ${
                        fontSize === size 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      aria-pressed={fontSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              {/* Toggles */}
              <div className="grid grid-cols-1 gap-3">
                <A11yToggle 
                  icon={<Eye size={18} />}
                  label="Yüksek Kontrast"
                  active={highContrast}
                  onClick={() => updateSettings({ highContrast: !highContrast })}
                  description="AAA Standartlarında siyah-beyaz görünüm"
                />
                <A11yToggle 
                  icon={<Type size={18} />}
                  label="Disleksi Fontu"
                  active={dyslexicFont}
                  onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                  description="OpenDyslexic yazı tipini aktifleştir"
                />
                <A11yToggle 
                  icon={<Zap size={18} />}
                  label="Biyonik Okuma"
                  active={bionicReading}
                  onClick={() => updateSettings({ bionicReading: !bionicReading })}
                  description="Odaklanmayı artıran harf vurgulama"
                />
                <A11yToggle 
                  icon={<Wind size={18} />}
                  label="Hareketi Azalt"
                  active={reducedMotion}
                  onClick={() => updateSettings({ reducedMotion: !reducedMotion })}
                  description="Animasyonları ve efektleri kapat"
                />
                <A11yToggle 
                  icon={<MousePointer2 size={18} />}
                  label="Odak Modu"
                  active={focusMode}
                  onClick={() => updateSettings({ focusMode: !focusMode })}
                  description="Aktif olmayan öğeleri soluklaştır"
                />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border text-[10px] font-bold text-muted-foreground uppercase text-center">
              EngelsizForum &copy; WCAG 2.2 AAA Uyumlu
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="vibe-button-primary !p-0 w-14 h-14 rounded-full shadow-2xl pointer-events-auto flex items-center justify-center bg-primary"
        aria-label="Erişilebilirlik Ayarları Paneli"
        aria-expanded={isOpen}
      >
        {isOpen ? <Maximize2 size={24} /> : <Accessibility size={28} />}
      </button>
    </div>
  );
}

function A11yToggle({ 
  icon, 
  label, 
  active, 
  onClick, 
  description 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all text-left w-full ${
        active 
          ? 'bg-primary/5 border-primary shadow-sm' 
          : 'bg-transparent border-border hover:border-primary/30'
      }`}
      aria-pressed={active}
    >
      <div className={`p-2 rounded-xl shrink-0 ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-black uppercase tracking-tight leading-tight">{label}</div>
        <div className="text-[10px] text-muted-foreground font-medium leading-tight mt-1">{description}</div>
      </div>
    </button>
  );
}
