'use client';

import React, { useState } from 'react';
import { 
  Type, 
  Eye, 
  Wind, 
  Zap, 
  RotateCcw,
  X,
  MousePointer2,
  Accessibility
} from 'lucide-react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Accessibility Toolbar (WCAG 2.2 AAA compliant)
 * Floating accessible control panel for barrier-free experience.
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end gap-2.5 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            id="floating-accessibility-panel"
            className="w-[calc(100vw-2rem)] max-w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl pointer-events-auto"
            role="dialog"
            aria-label="Erişilebilirlik Paneli"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Accessibility className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                Erişilebilirlik Araçları
              </h2>
              <div className="flex items-center gap-1">
                <button 
                  onClick={resetSettings}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Ayarları Sıfırla"
                  aria-label="Tüm erişilebilirlik ayarlarını varsayılana sıfırla"
                >
                  <RotateCcw size={15} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Kapat"
                  aria-label="Erişilebilirlik panelini kapat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Font Size Selector */}
              <section>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <Type size={14} className="text-indigo-600 dark:text-indigo-400" /> Metin Boyutu
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`h-9 rounded-lg text-xs font-bold uppercase transition-colors border ${
                        fontSize === size 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      aria-pressed={fontSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              {/* Toggles */}
              <div className="space-y-2">
                <A11yToggle 
                  icon={<Eye size={16} />}
                  label="Yüksek Kontrast"
                  active={highContrast}
                  onClick={() => updateSettings({ highContrast: !highContrast })}
                  description="WCAG AAA standartlarında yüksek kontrast"
                />
                <A11yToggle 
                  icon={<Type size={16} />}
                  label="Disleksi Dostu Font"
                  active={dyslexicFont}
                  onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                  description="OpenDyslexic yazı tipini etkinleştir"
                />
                <A11yToggle 
                  icon={<Zap size={16} />}
                  label="Biyonik Okuma"
                  active={bionicReading}
                  onClick={() => updateSettings({ bionicReading: !bionicReading })}
                  description="Odaklanmayı artıran harf vurgusu"
                />
                <A11yToggle 
                  icon={<Wind size={16} />}
                  label="Hareketi Azalt"
                  active={reducedMotion}
                  onClick={() => updateSettings({ reducedMotion: !reducedMotion })}
                  description="Animasyonları ve efektleri sınırla"
                />
                <A11yToggle 
                  icon={<MousePointer2 size={16} />}
                  label="Odak Modu"
                  active={focusMode}
                  onClick={() => updateSettings({ focusMode: !focusMode })}
                  description="Aktif olmayan öğeleri soluklaştır"
                />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-center">
              EngelsizForum • WCAG 2.1 AAA
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        id="floating-accessibility-toggle-btn"
        className="w-12 h-12 sm:w-13 sm:h-13 rounded-full shadow-lg pointer-events-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
        aria-label="Erişilebilirlik Ayarları Paneli"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Accessibility size={24} />}
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
      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors text-left w-full ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
      }`}
      aria-pressed={active}
    >
      <div className={`p-1.5 rounded-md shrink-0 ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold leading-tight ${active ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
          {label}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight mt-0.5">
          {description}
        </div>
      </div>
    </button>
  );
}
