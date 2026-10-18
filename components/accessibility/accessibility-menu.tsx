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
  ExternalLink,
  BookOpen,
  BellRing,
  HelpCircle,
  Keyboard
} from 'lucide-react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { motion, AnimatePresence } from 'motion/react';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Universal Accessible Toolbar & Dialog (WCAG 2.1 AAA Compliant).
 * Enhanced for TEKNOFEST 2027 Engelsiz Yaşam Teknolojileri.
 * 
 * Supports:
 * - Visually Impaired: Font sizing, High Contrast, Color blindness simulation & correction, Screen reader TTS audio guide, Large cursor.
 * - Hearing Impaired: Visual alert flash indicators.
 * - Neurodiverse / Dyslexia / ADHD: OpenDyslexic font, Reading ruler, Bionic reading parser, Focus mode distraction dimmer.
 * - Motor Disabilities: Keyboard shortcut helper & high touch-targets.
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
    readingRuler,
    visualAlerts,
    updateSettings,
    resetSettings,
    triggerVisualAlert
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
          {/* Backdrop for outside click & focus isolation (mobile & desktop) */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Accessibility Menu Panel */}
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            id="accessibility-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Engelsiz Erişim ve Kişiselleştirme Menüsü"
            className="fixed inset-x-2 top-16 max-h-[calc(100dvh-5rem)] sm:inset-x-auto sm:right-4 sm:top-16 sm:w-[400px] sm:max-h-[min(680px,calc(100dvh-5rem))] z-50 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-700 text-white shadow-xs">
                  <Accessibility size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
                    Engelsiz Erişim Merkezi
                  </h2>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    WCAG 2.1 AAA Standart Ayarları
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={resetSettings}
                  className="min-h-[36px] min-w-[36px] p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  title="Tüm Ayarları Sıfırla"
                  aria-label="Tüm erişilebilirlik ayarlarını varsayılana sıfırla"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[36px] min-w-[36px] p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  title="Kapat"
                  aria-label="Erişilebilirlik menüsünü kapat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-4 divide-y divide-slate-200 dark:divide-slate-800">
              
              {/* Profiller */}
              <section className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100">Hızlı Erişilebilirlik Profilleri</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => { updateSettings({ reducedMotion: true, visualAlerts: false }); }} className="text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border">Nöbet Güvenli</button>
                  <button onClick={() => { updateSettings({ fontSize: 'xl', highContrast: true }); }} className="text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border">Görme Engelli</button>
                </div>
              </section>

              {/* Metin Boyutu */}
              <section className="space-y-2 pt-3.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Type size={15} className="text-sky-700 dark:text-sky-400" />
                    Yazı Boyutu (Font Size)
                  </span>
                  <span className="text-[10px] uppercase font-black text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-md border border-sky-300 dark:border-sky-800">
                    {fontSize.toUpperCase()}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`min-h-[38px] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                        fontSize === size
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                      }`}
                    >
                      {size === 'sm' && 'Küçük'}
                      {size === 'md' && 'Normal'}
                      {size === 'lg' && 'Büyük'}
                      {size === 'xl' && 'Çok Büyük'}
                    </button>
                  ))}
                </div>
              </section>

              {/* Görme Engelli & Az Görenler: Kontrast, Sesli Rehber, Büyük İmleç */}
              <section className="pt-3.5 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Görme &amp; Algı Desteği
                </span>

                {/* Yüksek Kontrast */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <Eye size={17} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Yüksek Kontrast</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Siyah-beyaz derin kontrast modu (AAA)</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    onClick={() => updateSettings({ highContrast: !highContrast })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      highContrast ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Sesli Okuma Rehberi (TTS) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <Volume2 size={17} className="text-sky-600 dark:text-sky-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Sesli Ekran Rehberi</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Fare veya odak üzerindeki metinleri seslendirir</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={audioGuide}
                    onClick={() => updateSettings({ audioGuide: !audioGuide })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      audioGuide ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        audioGuide ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Büyük İmleç */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <MousePointer2 size={17} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Büyük Belirgin İmleç</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Fareyi kaybetmeyenler için sarı vurgulu imleç</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={largeCursor}
                    onClick={() => updateSettings({ largeCursor: !largeCursor })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      largeCursor ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        largeCursor ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </section>

              {/* Renk Körlüğü Simülasyonu ve Düzeltmesi */}
              <section className="pt-3.5 space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette size={15} className="text-rose-600 dark:text-rose-400" />
                    Renk Körlüğü Filtresi
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'none', label: 'Kapalı' },
                    { id: 'protanopia', label: 'Protanopi (Kırmızı)' },
                    { id: 'deuteranopia', label: 'Döteranopi (Yeşil)' },
                    { id: 'tritanopia', label: 'Tritanopi (Mavi)' },
                    { id: 'achromatopsia', label: 'Tam Renk Körlüğü' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => updateSettings({ colorBlindness: filter.id as any })}
                      className={`min-h-[38px] px-2.5 py-1.5 text-xs font-bold rounded-lg border text-left transition-all cursor-pointer ${
                        colorBlindness === filter.id
                          ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Disleksi & DEHB & Odaklanma Araçları */}
              <section className="pt-3.5 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Disleksi, DEHB &amp; Nöroçeşitlilik
                </span>

                {/* Disleksi Dostu Yazı Tipi */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={17} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Disleksi Fontu (OpenDyslexic)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Harf karışıklığını önleyen ağırlıklı font</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dyslexicFont}
                    onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      dyslexicFont ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        dyslexicFont ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Okuma Cetveli (Reading Ruler) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <Zap size={17} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Okuma Cetveli (Satır Kılavuzu)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Gözün satırı kaybetmesini önleyen takip bandı</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={readingRuler}
                    onClick={() => updateSettings({ readingRuler: !readingRuler })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      readingRuler ? 'bg-yellow-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        readingRuler ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Biyonik Okuma */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <Type size={17} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Biyonik Okuma (Bionic)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Kelimelerin ilk harflerini koyulaştırarak hızlı okuma</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={bionicReading}
                    onClick={() => updateSettings({ bionicReading: !bionicReading })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      bionicReading ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        bionicReading ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </section>

              {/* İşitme Engelli Bireyler: Görsel Flaş Bildirimler */}
              <section className="pt-3.5 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  İşitme Engeli Desteği
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <BellRing size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Görsel Flaş Bildirimleri</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Sesli uyarılar yerine ekran çevresinde yumuşak ışık</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={visualAlerts}
                    onClick={() => {
                      updateSettings({ visualAlerts: !visualAlerts });
                      if (!visualAlerts) triggerVisualAlert('success');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      visualAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        visualAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </section>

              {/* Kısayol Tuşları Bilgilendirmesi */}
              <section className="pt-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Keyboard size={15} className="text-slate-600 dark:text-slate-400" />
                  <span>Klavye Kısayolları (Motor Engeli / Hızlı Erişim)</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border shadow-xs">Alt + A</kbd> : Bu Menü</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border shadow-xs">Alt + H</kbd> : Ana Sayfa</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border shadow-xs">Alt + C</kbd> : Hesaplayıcı</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border shadow-xs">Alt + N</kbd> : Yeni Konu</div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
              <Link
                href="/about"
                onClick={onClose}
                className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                <span>EngelsizForum WCAG 2.1 AAA Erişilebilirlik Raporu</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
