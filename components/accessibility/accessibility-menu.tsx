'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  Type, 
  Eye, 
  Wind, 
  Zap, 
  RotateCcw,
  X,
  MousePointer2,
  Accessibility,
  Palette,
  Volume2,
  ExternalLink
} from 'lucide-react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { motion, AnimatePresence } from 'motion/react';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Accessible Navbar Dropdown / Modal Menu (WCAG 2.1 AAA Compliant)
 * Fixed centered modal on mobile, right-aligned dropdown on desktop.
 */
export function AccessibilityMenu({ isOpen, onClose }: AccessibilityMenuProps) {
  const { 
    fontSize, 
    highContrast, 
    dyslexicFont, 
    reducedMotion, 
    bionicReading, 
    focusMode,
    colorBlindness,
    largeCursor,
    audioGuide,
    updateSettings,
    resetSettings 
  } = useAccessibility();

  // Prevent background scrolling when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop for outside click & focus isolation */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 sm:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Accessibility Menu: Modal on Mobile, Dropdown on Desktop */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            id="accessibility-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Erişilebilirlik Menüsü"
            className="fixed inset-x-4 top-16 z-50 max-w-md mx-auto sm:max-w-none sm:mx-0 sm:inset-x-auto sm:top-full sm:right-0 sm:absolute sm:mt-2 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Accessibility size={17} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Erişilebilirlik Araçları
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Kişiselleştirilmiş deneyim ayarları
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetSettings}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Ayarları Sıfırla"
                  aria-label="Tüm erişilebilirlik ayarlarını varsayılana sıfırla"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Kapat"
                  aria-label="Erişilebilirlik menüsünü kapat"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Scrollable Body: max-h-[85vh] overflow-y-auto */}
            <div className="max-h-[85vh] overflow-y-auto p-4 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Metin Boyutu */}
              <section className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Type size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Metin Boyutu
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    {fontSize}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`h-9 rounded-lg text-xs font-bold uppercase transition-all border cursor-pointer ${
                        fontSize === size
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300 dark:ring-indigo-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      aria-pressed={fontSize === size}
                      aria-label={`Yazı boyutunu ${size.toUpperCase()} yap`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              {/* Görsel ve Okuma Kolaylaştırıcılar */}
              <section className="pt-3 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Görünüm &amp; Okuma
                </div>
                <div className="space-y-1.5">
                  <A11yToggleItem
                    icon={<Eye size={15} />}
                    label="Yüksek Kontrast"
                    active={highContrast}
                    onClick={() => updateSettings({ highContrast: !highContrast })}
                    description="WCAG AAA standartlarında koyu ve net kontrast"
                  />
                  <A11yToggleItem
                    icon={<Type size={15} />}
                    label="Disleksi Dostu Font"
                    active={dyslexicFont}
                    onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                    description="Harf ayırt etmeyi kolaylaştıran OpenDyslexic yazı tipi"
                  />
                  <A11yToggleItem
                    icon={<Zap size={15} />}
                    label="Biyonik Okuma"
                    active={bionicReading}
                    onClick={() => updateSettings({ bionicReading: !bionicReading })}
                    description="Kelimelerin ilk harflerini vurgulayarak hızlı okuma"
                  />
                  <A11yToggleItem
                    icon={<Wind size={15} />}
                    label="Hareketi Azalt"
                    active={reducedMotion}
                    onClick={() => updateSettings({ reducedMotion: !reducedMotion })}
                    description="Geçiş animasyonlarını ve görsel efektleri sınırla"
                  />
                  <A11yToggleItem
                    icon={<MousePointer2 size={15} />}
                    label="Odak Modu"
                    active={focusMode}
                    onClick={() => updateSettings({ focusMode: !focusMode })}
                    description="Aktif olmayan öğeleri soluklaştırarak dikkati topla"
                  />
                  <A11yToggleItem
                    icon={<MousePointer2 size={15} className="rotate-90 scale-110" />}
                    label="Büyük İmleç"
                    active={largeCursor}
                    onClick={() => updateSettings({ largeCursor: !largeCursor })}
                    description="Görünürlüğü artıran büyük ve kontrastlı fare imleci"
                  />
                  <A11yToggleItem
                    icon={<Volume2 size={15} />}
                    label="Sesli Kılavuz"
                    active={audioGuide}
                    onClick={() => updateSettings({ audioGuide: !audioGuide })}
                    description="Gezindiğiniz sayfa öğelerini sesli okur"
                  />
                </div>
              </section>

              {/* Renk Körlüğü Filtresi */}
              <section className="pt-3 space-y-2">
                <label 
                  htmlFor="color-blindness-select"
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Palette size={14} className="text-indigo-600 dark:text-indigo-400" />
                  Renk Körlüğü Filtresi
                </label>
                <select
                  id="color-blindness-select"
                  value={colorBlindness}
                  onChange={(e) => updateSettings({ colorBlindness: e.target.value as any })}
                  className="w-full h-9 rounded-lg px-2.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="none">Normal Renkler (Filtresiz)</option>
                  <option value="protanopia">Protanopi (Kırmızı Renk Göremezlik)</option>
                  <option value="deuteranopia">Deuteranopi (Yeşil Renk Göremezlik)</option>
                  <option value="tritanopia">Tritanopi (Mavi Renk Göremezlik)</option>
                  <option value="achromatopsia">Akromatopsi (Tam Renk Körlüğü / Tek Renk)</option>
                </select>
              </section>

              {/* Bilgilendirme & Erişilebilirlik Beyanı Linki */}
              <section className="pt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold">EngelsizForum • WCAG 2.1 AAA</span>
                <Link
                  href="/accessibility"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  <span>Beyan</span>
                  <ExternalLink size={11} />
                </Link>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function A11yToggleItem({ 
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
      type="button"
      onClick={onClick}
      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all text-left w-full cursor-pointer ${
        active 
          ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 shadow-2xs' 
          : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
      aria-pressed={active}
    >
      <div className={`p-1.5 rounded-md shrink-0 transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold leading-tight ${
            active ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'
          }`}>
            {label}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
            active 
              ? 'bg-indigo-600 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}>
            {active ? 'AÇIK' : 'KAPALI'}
          </span>
        </div>
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
          {description}
        </p>
      </div>
    </button>
  );
}
